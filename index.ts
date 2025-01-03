import fs from "fs";
import { parse } from "node-html-parser"

const BUILD_DIR = "build"
const SRC_DIR = "src"
const PAGE = "page"
const LAYOUT = "layout"
const SCRIPT = "script"
const DATA = "data"
const EXT = "html"
const ASSETS_DIR = "assets"
const DATA_DIR = "data"
const TEMP_DIR = "temp"
const META_PREFIX = "meta"
const DATA_PREFIX = "data"

interface Directory {
    dir: string,
    layout: boolean,
    page: boolean,
    script: boolean,
    data: boolean,
}

const DIRS: Directory[] = []

const HTML_VARIABLE_REGEX = /\{\{\s*((?:\w+\.?)+)\s*\}\}/gm;

function scanDirectory(directory: string) {
    const dir = fs.readdirSync(directory);

    let newDir: Directory = {
        dir: directory,
        layout: false,
        page: false,
        script: false,
        data: false
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

        switch (fileName) {
            case PAGE: newDir.page = true; continue;
            case LAYOUT: newDir.layout = true; continue;
            case SCRIPT: newDir.script = true; continue;
            case DATA: newDir.data = true; continue;
        }
    }

    if (newDir.page) {
        DIRS.push(newDir);
    }
}


function applyMetaPage(page: string, dir: string): string {
    const metaTags = [...page.matchAll(HTML_VARIABLE_REGEX)];

    let newPage = page;

    const deepness = dir.split(TEMP_DIR).join("").split("/").length - 2

    for (let i = 0; i < metaTags.length; i++) {
        const [prefix, noun, ...args] = metaTags[i][1].split(".");

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

function makeDataPages(dirs: Directory[]) {
    const data = dirs.filter((d) => d.data === true)

    for (let i = 0; i < data.length; i++) {
        const curPage = data[i];
        const json = JSON.parse(fs.readFileSync(`${curPage.dir}/${DATA}.json`).toString())

        if (json.length <= 0) {
            continue;
        }

        for (let j = 0; j < json.length; j++) {
            let page = fs.readFileSync(`${curPage.dir}/${DATA}.${EXT}`).toString();

            page = applyDataPage(page, json, j);

            const newDir = `${curPage.dir}/${j}`
            fs.mkdirSync(newDir, { recursive: true })

            fs.writeFileSync(`${newDir}/${PAGE}.${EXT}`, page)
        }
    }
}

function applyDataPage(page: string, json: any, slug: number) {
    const dataTags = [...page.matchAll(HTML_VARIABLE_REGEX)];

    let newPage = page;

    for (let i = 0; i < dataTags.length; i++) {
        const [prefix, ...data] = dataTags[i][1].split(".");

        if (prefix !== DATA_PREFIX) continue;

        let dataToAdd = json[slug];

        for (let j = 0; j < data.length; j++) {
            dataToAdd = dataToAdd[data[j]]
        }

        console.log(dataToAdd)

        newPage = newPage.replace(
            dataTags[i][0],
            dataToAdd
        )
    }

    return newPage;
}

function buildPages(dirs: Directory[]) {
    const defaultLayout = dirs.find((d) => d.dir === "./" + TEMP_DIR)

    if (!defaultLayout || !defaultLayout?.layout) {
        console.info(`There is no defaut layout in your ${SRC_DIR} directory`)
    }

    for (let i = 0; i < dirs.length; i++) {
        let { dir, page, layout, script, data } = dirs[i];

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

        pageToBuild = applyMetaPage(pageToBuild, dir);

        if (!pageToBuild) {
            console.warn(`${dir}. Page is empty`)
            continue;
        }

        const buildPageDir = `./${BUILD_DIR}${dir.split("./" + TEMP_DIR)[1]}`

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
        `./${TEMP_DIR}/${dir}`,
        `./${BUILD_DIR}/${dir}`,
        {
            recursive: true
        }
    )
}

function copySrcToTemp() {
    fs.cpSync(
        `./${SRC_DIR}`,
        `./${TEMP_DIR}`,
        {
            recursive: true
        }
    )
}

function main() {
    fs.rmSync("./" + BUILD_DIR, { force: true, recursive: true });

    copySrcToTemp()

    scanDirectory("./" + TEMP_DIR);

    makeDataPages(DIRS);

    DIRS.length = 0;

    scanDirectory("./" + TEMP_DIR);

    console.log(DIRS);

    buildPages(DIRS);

    copyFolder(ASSETS_DIR);

    copyFolder(DATA_DIR);

    // fs.rmSync("./" + TEMP_DIR, { force: true, recursive: true });
}

main()

// Our Father, who art in heaven,
// hallowed be Thy Name,
// Thy kingdom come,
// Thy will be done,
// on earth as it is in heaven.
// Give us this day our daily bread.
// And forgive us our sins,
// as we forgive those
// who sin against us.
// And lead us not into temptation,
// but deliver us from evil.
// For Thine is the Kingdom,
// and the power, and the glory,
// for ever and ever. Amen.
