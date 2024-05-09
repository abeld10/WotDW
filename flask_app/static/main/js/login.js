// Retrieve form elements by their IDs
const form = document.getElementById('form');
const email = document.getElementById('email2');
const password = document.getElementById('password');
const loginbtn = document.getElementById('loginbtn');
const registerbtn = document.getElementById('registerbtn');




// Prevent the form from submitting traditionally and validate inputs instead
form.addEventListener('submit', e => {
    e.preventDefault();

    validateInputs();
});


// Function to display an error message for a specific form element
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    // Special handling for specific error messages
    if (message === "Incorrect password" || message === "User already exists" || message === "User not found"){
        passControl = password.parentElement;
        passControl.classList.add('error');
        passControl.classList.remove('success');
    }

    // Set the error message and update the class to show error state
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

// Function to indicate successful input validation
const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    // Clear any error message and update the class to show success state
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

// Function to validate email format using a regular expression
const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate input fields before submission
const validateInputs = () => {
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    let isValid = false;
    
    // Validate email input
    if(emailValue === '') {
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
        isValid = true;
    }

    // Validate password input
    if(passwordValue === '') {
        setError(password, 'Password is required');
        isValid = false;
    } else if (passwordValue.length < 8 ) {
        setError(password, "Password must be at least 8 characters long and include at least one number, one lowercase and one uppercase letter.")
        isValid = false;
    } else {
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Regex pattern for password
        if (!re.test(passwordValue)) {
            setError(password,("Password must be at least 8 characters long and include at least one number, one lowercase and one uppercase letter."));
            isValid = false;
        }
        else{
            setSuccess(password);
            isValid = true;
        }    
    }
    return isValid


};


// Event listener for the login button click
loginbtn.addEventListener('click', () => {
    if(validateInputs()){
        submitForm('/processlogin');
    }

});

// Event listener for the register button click
registerbtn.addEventListener('click', () =>{
    if(validateInputs()){
        submitForm('/processregister');
    }
});


// Function to submit the form data to a specified URL using Fetch API
function submitForm(actionURL) {
    const formData = new FormData(form);
    // Send a POST request with the form data
    fetch(actionURL, {
        method: 'POST', // i think need to change this to GET when I do processlogin
        body: formData
    })
    .then( response => response.json()) // Parse JSON response
    .then(data => {  // On success, redirect to home page; on failure, show error message
        if (data.success) {
            window.location.href= '/home';
        } else{
            setError(email,data.message);
        }
    })
    .catch(error => {
        console.error("Error", error);
    });

}




