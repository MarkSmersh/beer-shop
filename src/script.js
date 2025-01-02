const images = ["{{ meta.assets }}/piwko_perla.png", "{{ meta.assets }}/piwko_rom.png", "{{ meta.assets }}/piwko_prosto.png", "{{ meta.assets }}/piwko_nice.png", "{{ meta.assets }}/piwko_piwooooo.png"];

const imageContainer = document.getElementById("main");
const timePerImage = 5000; // ms 
const startFrom = 0;
let currentImage = startFrom;

function setImageByIndex(index) {
    let indexToSet = index;

    if (indexToSet > (images.length - 1)) {
        indexToSet = 0;
    }

    imageContainer.style.backgroundImage = `url(${images[indexToSet]})`;

    const selectors = document.getElementsByClassName("selector");

    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];

        if (i === indexToSet) {
            selector.classList.add("active");
        } else {
            selector.classList.remove("active");
        }
    }

    currentImage = indexToSet;
}


async function infiniteVoid(index) {
    setImageByIndex(index);

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timePerImage)
    });

    infiniteVoid(currentImage + 1);
}

document.addEventListener("DOMContentLoaded", () => {
    infiniteVoid(startFrom);

    const selectorsWrapper = document.getElementById("selectors");

    for (let i = 0; i < images.length; i++) {
        const newSelector = document.createElement("button");

        newSelector.classList.add("selector");
        newSelector.textContent = i + 1;
        newSelector.addEventListener("click", () => setImageByIndex(i));

        if (i === startFrom) {
            newSelector.classList.add("active");
        }

        selectorsWrapper.appendChild(newSelector);
    }
})
