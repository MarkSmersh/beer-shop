const images = ["{{ meta.assets }}/piwko_perla.png", "{{ meta.assets }}/piwko_rom.png", "{{ meta.assets }}/piwko_prosto.png", "{{ meta.assets }}/piwko_nice.png", "{{ meta.assets }}/piwko_piwooooo.png"];

const imageContainer = document.getElementById("main");
const timePerImage = 5000; // ms 
const startFrom = 0;
let currentImage = startFrom;

/**
    * Wystawia zdjęcie w zależności od wprowadzonego indeksu,
    * gdzie indeks to i w images[i].
    * @param {number} index
    */
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


/**
    * Funkcja rekursywna, jaka wystawia następne indeksy dla images,
    * każdych timerPerImage milisekund.
    * @param {number} index
    */
async function infiniteVoid(index) {
    setImageByIndex(index);

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timePerImage)
    });

    infiniteVoid(currentImage + 1);
}

/**
    * Po ladowaniu strony, zaczyna funkcję infinitiVoid,
    * dodaje do elementu o id selectors naciski, ilość
    * ktorych jest równa ilości elementów w tablicę images.
    */
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
