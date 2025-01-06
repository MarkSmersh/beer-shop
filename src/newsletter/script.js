document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("email").value = localStorage.getItem("email") ? localStorage.getItem("email") : "";
})

/**
    * @param {HTMLInputElement[]} args
    */
function displayForm(...args) {
    const [email, firstname, surname, sex, usaBeer, chechBeer, polishBeer] = args;

    // Do konsoli są zapisywane dane z <form/>

    console.log(`Poczta elektronowa: ${email.value}`)
    console.log(`Imię: ${firstname.value}`)
    console.log(`Nazwisko: ${surname.value}`)
    console.log(`Płec: ${sex.value === "m" ? "Męczyzna" : "Kobieta"}`)
    console.log(`Są ciekawe piwa z Stanów Zjednoczonych: ${usaBeer.checked ? "Tak" : "Nie"}`)
    console.log(`Są ciekawe piwa z Czechów: ${chechBeer.checked ? "Tak" : "Nie"}`)
    console.log(`Są ciekawe piwa z Polscy: ${polishBeer.checked ? "Tak" : "Nie"}`)
}
