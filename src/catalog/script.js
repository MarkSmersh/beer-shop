/** 
    * Generuje HTML w zależności od danych, które są w skrypcie products.js.
    * Korzysta z elementu <template/> dla stworzenia szablonu dla produktu,
    * na podstawie danych i dodaje to do elementy <main/>
    */
document.addEventListener("DOMContentLoaded", () => {
    const main = document.getElementById("main");

    const template = document.getElementsByTagName("template")[0];

    for (let i = 0; i < products.length; i++) {
        const p = template.content.cloneNode(true);

        const prod = products[i];

        p.querySelectorAll(".image")[0].setAttribute("src", `{{meta.assets}}/products/${prod.image}`);

        p.querySelectorAll(".title")[0].textContent = prod.title;

        p.querySelectorAll(".description")[0].textContent = prod.description.slice(0, 100) + "...";

        p.querySelectorAll(".price")[0].textContent = `Cena: ${prod.price} zł`;

        p.querySelectorAll("button")[0].setAttribute("slug", prod.id);

        main.appendChild(p);
    }
})

/** 
    * Przekierowuje do strony w zależnosci od atrubutu slug
    * @param {HTMLButtonElement} button
    */
function goToProduct(button) {
    const slug = button.attributes["slug"].value;

    document.location.assign(`{{meta.location}}/catalog/${slug}/{{meta.page}}`);
}
