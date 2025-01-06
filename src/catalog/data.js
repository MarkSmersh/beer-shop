/** Spełnia funkcję setProductSize podczas zmiany rozmiarów */
window.addEventListener("resize", () => {
    setProductSize();
})

/** Spełnia funkcję setProductSize po ladowaniu strony */
window.addEventListener("DOMContentLoaded", () => {
    setProductSize();
})

/** Wystawia zdjęcie produktu w zależności od rozmiarów strony */
function setProductSize() {
    const product = document.getElementById("product");
    const tableImg = document.getElementById("table").querySelector("img");
    product.style.bottom = `${tableImg.height / 3 * 2}px`;
}
