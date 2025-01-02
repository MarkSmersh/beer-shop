import fs from "fs";
import { parse } from "node-html-parser"

const BUILD_DIR = "build"
const SRC_DIR = "src"
const PAGE = "page"
const LAYOUT = "layout"
const SCRIPT = "script"
const EXT = "html"
const ASSETS_DIR = "assets"
const DATA_DIR = "data"
const META_PREFIX = "meta"

interface Directory {
    dir: string,
    layout: boolean,
    page: boolean,
    script: boolean,
}

const DIRS: Directory[] = []

function scanDirectory(directory: string) {
    const dir = fs.readdirSync(directory);

    let newDir: Directory = {
        dir: directory,
        layout: false,
        page: false,
        script: false,
    };


    for (let i = 0; i < dir.length; i++) {
        const file = dir[i];

        const splitFile = file.split(".");

        const fileName = splitFile[0];
        const fileExt =
            splitFile.length <= 1 ? undefined : splitFile[splitFile.length - 1]

        if (!fileExt) {
            scanDirectory(`${directory}/${fileName}`);
            continue;
        }

        if (fileName === PAGE) {
            newDir.page = true;
            continue;
        }

        if (fileName === LAYOUT) {
            newDir.layout = true;
            continue;
        }

        if (fileName === SCRIPT) {
            newDir.script = true;
            continue;
        }
    }

    if (newDir.page) {
        DIRS.push(newDir);
    }
}

function applyMetaPage(page: string, dir: string)/* : string */ {
    const htmlMetaRegex = /\{\{\s*((?:\w+\.?)+)\s*\}\}/gm;
    const metaTags = [...page.matchAll(htmlMetaRegex)];

    let newPage = page;

    const deepness = dir.split(SRC_DIR).join("").split("/").length - 2

    for (let i = 0; i < metaTags.length; i++) {
        const [prefix, nounUnlowered, ...args] = metaTags[i][1].split(".");

        const noun = nounUnlowered.toLowerCase();

        if (prefix !== META_PREFIX) continue;

        if (noun === "location") {
            const relDir = "../".repeat(deepness)

            newPage = newPage.replace(
                metaTags[i][0],
                deepness > 0 ? relDir.slice(0, relDir.length - 1) : "."
            )
        }

        if (noun === "assets") {
            newPage = newPage.replace(
                metaTags[i][0],
                "../".repeat(deepness) + "assets"
            )
        }

        if (noun === "data") {
            newPage = newPage.replace(
                metaTags[i][0],
                "../".repeat(deepness) + "data"
            )
        }

        if (noun === "page") {
            newPage = newPage.replace(
                metaTags[i][0],
                `index.${EXT}`
            )
        }
    }

    return newPage;
}

function buildPages(dirs: Directory[]) {
    const defaultLayout = dirs.find((d) => d.dir === "./" + SRC_DIR)

    if (!defaultLayout || !defaultLayout?.layout) {
        console.info(`There is no defaut layout in your ${SRC_DIR} directory`)
    }

    for (let i = 0; i < dirs.length; i++) {
        let { dir, page, layout, script } = dirs[i];

        if (!page) continue;

        const domPage = parse(
            fs.readFileSync(`${dir}/${PAGE}.${EXT}`).toString()
        )

        let pageToBuild: string | null = null;

        if ((defaultLayout && defaultLayout.layout) || layout) {
            const domLayout = parse(
                fs.readFileSync(
                    layout
                        ? `${dir}/${LAYOUT}.${EXT}`
                        : `${defaultLayout?.dir}/${LAYOUT}.${EXT}`
                ).toString()
            )

            const childContainer = domLayout.getElementById("child")

            if (!childContainer) {
                console.error(`In ${dir}/${LAYOUT}.${EXT} is missing element with id 'child'`);
                continue;
            }

            childContainer.append(
                ...domPage.childNodes
            );

            pageToBuild = domLayout.toString();
        } else {
            pageToBuild = domPage.toString();
        }

        if (script) {
            const scriptJs = fs.readFileSync(`${dir}/${SCRIPT}.js`)

            pageToBuild += "<script>\n"
            pageToBuild += `${scriptJs.toString()}\n`
            pageToBuild += "</script>\n"
        }

        pageToBuild = applyMetaPage(pageToBuild, dir)

        if (!pageToBuild) {
            console.warn(`${dir}. Page is empty`)
            continue;
        }

        const buildPageDir = `./${BUILD_DIR}${dir.split("./" + SRC_DIR)[1]}`

        if (!fs.existsSync(buildPageDir)) {
            fs.mkdirSync(buildPageDir, { recursive: true })
        }

        fs.writeFileSync(
            `${buildPageDir}/index.${EXT}`,
            pageToBuild,
        );
    }
}

function copyFolder(dir: string) {
    fs.cpSync(
        `./${SRC_DIR}/${dir}`,
        `./${BUILD_DIR}/${dir}`,
        {
            recursive: true
        }
    )
}

function main() {
    fs.rmSync("./" + BUILD_DIR, { force: true, recursive: true });

    scanDirectory("./" + SRC_DIR);
    console.log(DIRS);
    buildPages(DIRS);
    copyFolder(ASSETS_DIR);
    copyFolder(DATA_DIR);
}

main()
