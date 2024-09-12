const sidebar_close_button  = document.querySelector("div.sidebar button");
const sidebar_open_button = document.querySelector("div.opensidebar");
const sidebar = document.querySelector("div.sidebar");
const mainContainer = document.querySelector("#mainContainer");
const messagebar = document.querySelector("#messagebar");

sidebar_close_button.addEventListener('click', event => {
    sidebar_open_button.style.display = "block"
    sidebar.style.display = "none"
    messagebar.style.width = "100vw"; mainContainer.style.width = "100vw"
})

sidebar_open_button.addEventListener('click', event => {
    sidebar_open_button.style.display = "none"
    sidebar.style.display = "block"
    messagebar.style.width = "82vw"; mainContainer.style.width = "82vw"
})
