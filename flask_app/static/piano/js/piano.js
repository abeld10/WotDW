
// Select all piano key elements in the document.
const pianoKeys = document.querySelectorAll(".keys .key"); 

// Define a mapping of key codes to sound file URLs.
const sound = {65:"http://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",
                87:"http://carolinegabriel.com/demo/js-keyboard/sounds/041.wav",
                83:"http://carolinegabriel.com/demo/js-keyboard/sounds/042.wav",
                69:"http://carolinegabriel.com/demo/js-keyboard/sounds/043.wav",
                68:"http://carolinegabriel.com/demo/js-keyboard/sounds/044.wav",
                70:"http://carolinegabriel.com/demo/js-keyboard/sounds/045.wav",
                84:"http://carolinegabriel.com/demo/js-keyboard/sounds/046.wav",
                71:"http://carolinegabriel.com/demo/js-keyboard/sounds/047.wav",
                89:"http://carolinegabriel.com/demo/js-keyboard/sounds/048.wav",
                72:"http://carolinegabriel.com/demo/js-keyboard/sounds/049.wav",
                85:"http://carolinegabriel.com/demo/js-keyboard/sounds/050.wav",
                74:"http://carolinegabriel.com/demo/js-keyboard/sounds/051.wav",
                75:"http://carolinegabriel.com/demo/js-keyboard/sounds/052.wav",
                79:"http://carolinegabriel.com/demo/js-keyboard/sounds/053.wav",
                76:"http://carolinegabriel.com/demo/js-keyboard/sounds/054.wav",
                80:"http://carolinegabriel.com/demo/js-keyboard/sounds/055.wav",
                186:"http://carolinegabriel.com/demo/js-keyboard/sounds/056.wav"};


// Initialize a string to store the sequence of key presses.
let sequence = '';
const oldonestring = 'weseeyou';

// Add an event listener to the document for the 'keydown' event.
document.addEventListener('keydown',keypress);


// Iterate over each piano key and attach various event listeners.
for (const key of pianoKeys){
    console.log(key.id);
    // Attach a click event listener to play the tune when a key is clicked.
    key.addEventListener("click",function() {playTune(key.id); });

    // Attach mouseover and mouseout event listeners to show and hide letters on keys.
    key.addEventListener('mouseover',showletters);
    key.addEventListener("mouseout",hideletters);
}

// Function to handle keypress events.
function keypress(event){
    //console.log("playing tune for key: ",event);
    // Retrieve the key code of the pressed key.
    let keyCode = event.keyCode;
    //console.log("keycode: ",keyCode);
    // Find the corresponding sound URL and play it.
    let audioUrl = sound[keyCode];
    //console.log("audiourl: ", audioUrl);
    
    let activeButton = document.querySelector("#"+ event.key);
    console.log("activeButton: ", activeButton);
    // Add visual feedback for key pressed
    activeButton.classList.add("pressed");
    setTimeout(function(){activeButton.classList.remove("pressed");},150);

    if (audioUrl){
        let audio = new Audio(audioUrl);
        audio.play();
    }

    // Update the sequence of key presses and check if the old one has awakened.
    let key = event.key.toLowerCase();
    if(key.length === 1){
        sequence += key;

        if(sequence.length > oldonestring.length){
            sequence = sequence.substring(1);
        }

        
        if(sequence === oldonestring){
            checkIfAwaken();
        }
    }



}


// Function to play tune for a given key when clicked
function playTune(key){
    let keyCode;
    if (key !== ';'){
        key = key.toUpperCase();
        keyCode = key.charCodeAt(0);

    }
    else{
        keyCode = 186;
    }
    console.log("playing tune for key: ",key)
    console.log("keycode: ",keyCode);
    let audioUrl = sound[keyCode];
    console.log("audiourl: ", audioUrl);
    if (audioUrl){
        let audio = new Audio(audioUrl);
        audio.play();
    }


    // Update the sequence of key presses and check if the old one has awakened.
    key = key.toLowerCase();
    if(key.length === 1){
        sequence += key;

        if(sequence.length > oldonestring.length){
            sequence = sequence.substring(1);
        }

        
        if(sequence === oldonestring){
            checkIfAwaken();
        }
    }


}

// Function to hide letters on piano keys.
function hideletters(){
    const spans = document.querySelectorAll(".key span");
    for(const i of spans){
        i.style.display = 'none';
    }
}

// Function to show letters on piano keys.
function showletters(){
    const spans = document.querySelectorAll(".key span");
    for(const i of spans){
        i.style.display = 'inline';
    }
}


// Function to perform actions when the old one has awakened.
// Perform various visual and auditory effects to signify the awakening.
// Replace the piano keys with awakening message and image.
function checkIfAwaken(event){
    let outer = document.querySelector(".outer");
    outer.style.transition = "opacity 2s ease-in-out";
    outer.style.opacity = "0";
    let audio = new Audio("https://orangefreesounds.com/wp-content/uploads/2020/09/Creepy-piano-sound-effect.mp3?_=1")
    audio.play();

    let wrapperDiv = document.createElement("div");
    wrapperDiv.className = "awakenWrapper";

    let textDiv = document.createElement("h2");
    textDiv.textContent = "I have awoken.";
    textDiv.className = "awakenText";

    wrapperDiv.appendChild(textDiv);

    let oldoneimage = document.createElement("img");
    oldoneimage.src = "../static/piano/images/texture.jpeg";
    oldoneimage.loading = "lazy";
    oldoneimage.alt = "Image of Old One";
    oldoneimage.className = "awakenImage";
    oldoneimage.title = "Old One"

    wrapperDiv.appendChild(oldoneimage);

    oldoneimage.style.transition = "opacity 2s ease-in-out";
    oldoneimage.style.opacity = "0"
    let parentDiv = document.querySelector('.outer').parentNode;

    setTimeout(()=> {
        oldoneimage.style.opacity = "1";
        textDiv.style.opacity = "1";
    }, 0);

    parentDiv.replaceChild(wrapperDiv, document.querySelector(".outer"));
    
    document.removeEventListener("keydown", keypress);
    pianoKeys.forEach(key => key.removeEventListener("click", playTune));

    


}