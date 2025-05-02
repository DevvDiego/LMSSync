document.addEventListener("DOMContentLoaded", () => {

    const btn_start = document.getElementById("btn_start");

    btn_start.addEventListener("click", ()=>{

        chrome.runtime.sendMessage("mensaje",()=>{
            console.log("Respuesta recibida del ")
        })

    })  


})