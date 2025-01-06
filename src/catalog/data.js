window.addEventListener("resize", () => {
    setProductSize();
})

window.addEventListener("DOMContentLoaded", () => {
    setProductSize();
})

function setProductSize() {
    const product = document.getElementById("product");
    const tableImg = document.getElementById("table").querySelector("img");
    product.style.bottom = `${tableImg.height / 3 * 2}px`;
}
