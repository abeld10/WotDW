const formInpts = document.querySelectorAll(".floating-contact-form .form-container .form-input");

const contactIcon = document.querySelector(".floating-contact-form .contact-icon");

const formContainer = document.querySelector(".floating-contact-form .form-container");

contactIcon.addEventListener("click", () => {
    formContainer.classList.toggle("active");
});

formInpts.forEach(i => {
    i.addEventListener("focus", () =>{
        i.previousElementSibling.classList.add("active");
    });
});

formInpts.forEach(i => {
    i.addEventListener("blur", () =>{
        if(i.value === ""){
            i.previousElementSibling.classList.remove("active");
        }
    });
});




