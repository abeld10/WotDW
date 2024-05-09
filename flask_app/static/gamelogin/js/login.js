let signupBtn = document.getElementById("signupBtn");
let loginBtn = document.getElementById("loginBtn");
let title = document.getElementById("title");

// Retrieve form elements by their IDs
const formbox = document.getElementById('form');
const password = document.getElementById('password');
const username = document.getElementById('username')

// Function to display an error message for a specific form element
const setError = (element, message) => {
    const inputControl = element.parentElement.parentElement;
    let errorDisplay;
    if(element === password){
        errorDisplay = inputControl.querySelector('.error2');
    }
    else{
        errorDisplay = inputControl.querySelector('.error');
    }

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
    const inputControl = element.parentElement.parentElement;
    let errorDisplay;
    if(element === password){
        errorDisplay = inputControl.querySelector('.error2');
    }
    else{
        errorDisplay = inputControl.querySelector('.error');
    }

    // Clear any error message and update the class to show success state
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

// Function to validate username format using a regular expression
const isValidUsername = username => {
      // Regular expression for username validation
      const re = /^[a-zA-Z0-9]{4,}$/;
      // Tests if the username is at least 4 characters long and only contains letters and numbers
      return re.test(username);
}

// Function to validate input fields before submission
const validateInputs = () => {
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    let isValid = false;
    
    // Validate username input
    if(usernameValue === '') {
        setError(username, 'Username is required');
    } else if (!isValidUsername(usernameValue)) {
        setError(username, 'Username must be 4 characters long and only contain letters and numbers ');
    } else {
        setSuccess(username);
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
loginBtn.addEventListener('click', () => {

    // Perform validation only if login is active
    if (!loginBtn.classList.contains("disable")) {
        if(validateInputs()){
            submitForm('/processgamelogin');
        }
    }

    title.innerHTML = "Log In";
    title.style.opacity = '0.6';
    // Restore opacity after a short delay
    setTimeout(() => {
        title.style.opacity = '.8';
    }, 200); // The timeout should match the CSS transition duration
    setTimeout(() => {
        title.style.opacity = '.9';
    }, 300); // The timeout should match the CSS transition duration
    setTimeout(() => {
        title.style.opacity = '1';
    }, 400); // The timeout should match the CSS transition duration

    signupBtn.classList.add("disable");
    loginBtn.classList.remove("disable");

});

// Event listener for the register button click
signupBtn.addEventListener('click', () =>{
    // Perform validation only if signup is active
    // Perform validation only if signup is active
    if (!signupBtn.classList.contains("disable")) {
        if(validateInputs()){
            submitForm('/processgameregister');
        }
    }
    
    title.innerHTML = "Sign Up";
    title.style.opacity = '0.6';
    // Restore opacity after a short delay
    setTimeout(() => {
        title.style.opacity = '.8';
    }, 200); // The timeout should match the CSS transition duration
    setTimeout(() => {
        title.style.opacity = '.9';
    }, 300); // The timeout should match the CSS transition duration
    setTimeout(() => {
        title.style.opacity = '1';
    }, 400); // The timeout should match the CSS transition duration
    signupBtn.classList.remove("disable");
    loginBtn.classList.add("disable");

});

// Function to handle the Enter key press in input fields
function handleEnterKeyPress(e) {
    // Check if the Enter key is pressed
    if (e.keyCode === 13 || e.which === 13) {

        // Determine which form is active (login or register) and submit accordingly
        if (validateInputs()) {
            if (!loginBtn.classList.contains("disable")) {
                submitForm('/processgamelogin');
            } else if (!signupBtn.classList.contains("disable")) {
                submitForm('/processgameregister');
            }
        }
    }
}

username.addEventListener('keypress', handleEnterKeyPress);
password.addEventListener('keypress', handleEnterKeyPress);

// Function to submit the form data to a specified URL using Fetch API
function submitForm(actionURL) {
    const formData = new FormData(formbox);
    // Send a POST request with the form data
    fetch(actionURL, {
        method: 'POST',
        body: formData
    })
    .then( response => response.json()) // Parse JSON response
    .then(data => {  // On success, redirect to game page; on failure, show error message
        if (data.success) {
            window.location.href= '/game';
        } else{
            setError(username,data.message);
        }
    })
    .catch(error => {
        console.error("Error", error);
    });

}