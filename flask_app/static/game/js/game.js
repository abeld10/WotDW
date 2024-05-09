
let currentGuess = [];
let currentRow = 0;
const maxTries = document.querySelectorAll('.grid-row:first-child .grid-cell').length;
const wordLength = document.querySelectorAll('.grid-row:first-child .grid-cell').length;
let startTime; // Set this when the game starts
let isModalOpen = true;



document.addEventListener('DOMContentLoaded', function() {


    var savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
        console.log(savedGameState);
        console.log("there is a savedgamestate");
        // Restore the game state and continue the timer
        restoreGameState();
    }
    var showInstructions = document.getElementById("instructionModal").getAttribute('data-show-instructions') === 'true';

    if (showInstructions) {
        document.getElementById('instructionModal').style.display = 'block';
        isModalOpen = true;
    } else {
        document.getElementById('instructionModal').style.display = 'none';
        isModalOpen = false;
        startTimer();
    }

    


    document.getElementById('startGameBtn').addEventListener('click', function() {
        // When the user clicks 'OK', hide the modal, set the flag in localStorage, and start the timer
        document.getElementById('instructionModal').style.display = 'none';
        isModalOpen = false;
        startTimer();
    });
});






function startTimer() {
    if (!startTime) {
        startTime = Date.now(); // Set startTime only if it's not already set
    }
    updateTimer();
}

function updateTimer() {
    let currentTime = Date.now();
    let elapsed = currentTime - startTime;

    // Format elapsed time and display it
    document.getElementById('timerDisplay').textContent = formatTime(elapsed);
    requestAnimationFrame(updateTimer);
    saveGameState(); 

}

function stopTimer() {
    cancelAnimationFrame(stopTimer);
}





document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', function() {
        const letter = this.innerText;
        // Handle the letter input (add to the current guess, etc.)
        if (letter === "Enter") { // Enter key
            submitGuess();
        } else if (letter === "Backspace") { // Backspace key
            if (currentGuess.length > 0) {
                currentGuess.pop(); // Remove the last letter
                updateGridDisplay(); // Update the display
            }
        } else { // A-Z keys
            handleLetterInput(letter);
        }

    });

});


document.addEventListener('keydown', function(event) {
    if (!isModalOpen) {
       if (event.keyCode === 13) { // Enter key
        event.preventDefault(); // Prevent default behavior of Enter key
        submitGuess();
        } else if (event.keyCode === 8) { // Backspace key
        event.preventDefault(); // Prevent default behavior of Backspace key
        if (currentGuess.length > 0) {
            currentGuess.pop(); // Remove the last letter
            updateGridDisplay(); // Update the display
        }
        } else if (event.keyCode >= 65 && event.keyCode <= 90) { // A-Z keys
        const letter = event.key.toUpperCase();
        handleLetterInput(letter);
        } 
    }
    
});

function handleLetterInput(letter) {
    if (currentGuess.length < wordLength) {
        currentGuess.push(letter.toUpperCase());
        updateGridDisplay();
    }
}

function updateGridDisplay() {
    // Clear all cells in the current row
    for (let i = 0; i < wordLength; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        if (currentGuess[i]) {
            cell.textContent = currentGuess[i];
            cell.classList.add('pop', 'filled'); 
            setTimeout(() => {
                cell.classList.remove('pop'); 
            }, 300); 
        } else {
            cell.textContent = '';
            cell.classList.remove('filled'); 
        }
    }
}

function submitGuess() {
    if (currentGuess.length === wordLength) {
        const guess = currentGuess.join('').toUpperCase();
        // Call verifyWord only when the full guess is made
        verifyWord(guess, function(isValid) {
            if (isValid) {
                checkGuess(guess, function(){
                    currentGuess = []; // Reset for next guess
                    currentRow++;
                    updateGridDisplay(); // Clear the display for the next guess
                });

            } else {
                triggerInvalidWordFeedback();
                
            }
            
        });
    }
    saveGameState(); // Save the game state after each guess

}


function checkGuess(guess, callback) {
    fetch('/check-guess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: guess })
    })
    .then(response => response.json())
    .then(data => {
        // data should contain information about the guess
        // Example data format: { correct: [true, false, false, true, true], ... }
        data.correct.forEach((isCorrect, i) => {
            const cell = document.getElementById(`cell-${currentRow}-${i}`);
            if (isCorrect) {
                cell.classList.add('correct', 'flip');
            } else if (data.present[i]) {
                cell.classList.add('present', 'flip');
            } else {
                cell.classList.add('absent', 'flip');
            }
        });

        if (data.isComplete) {
            handleWin();
        } else if (currentRow === maxTries - 1) {
            handleLoss();
        }
        if (typeof callback === 'function'){
            callback();
        }
        saveGameState();
    })
    .catch(error => console.error('Error:', error));
}



function handleLoss() {
    alert("Sorry, you've used all your attempts. Better luck next time!");
    clearGameState();
    recordLoss(function() {
        window.location.href = '/leaderboard'; // Redirect to leaderboard
    });

}


function recordLoss(callback){

    fetch('/record-loss', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (typeof callback === 'function') {
            callback();
        }
    })
    .catch(error => console.error('Error:', error));

}


function calculateTimeTaken(endTime) {
    return formatTime(endTime - startTime); // Format time as you like (e.g., in minutes and seconds)
}

function handleWin() {
    let endTime = Date.now();
    const timeTaken = calculateTimeTaken(endTime);
    let timeSeconds = formatSeconds(endTime - startTime);
    alert(`Congratulations! You won in ${timeTaken}`); // i don't want this
    clearGameState();
    recordWin(timeSeconds, function() {
        window.location.href = '/leaderboard'; // Redirect to leaderboard
    });
}

function recordWin(timeSeconds, callback) {
    fetch('/record-win', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSeconds: timeSeconds })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof callback === 'function') {
            callback();
        }
    })
    .catch(error => console.error('Error:', error));
}



function verifyWord(guess, callback){
    console.log(guess);
    fetch(`/validate-guess?guess=${guess}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => { // On success, redirect to home page; on failure, show error message
        callback(data.isValid);
    })
    .catch(error => console.error('Error:', error));

}



function triggerInvalidWordFeedback() {
    // Add shake class to each cell in the current guess
    for (let i = 0; i < wordLength; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        cell.classList.add('shake');
    }

    // Show error message
    const errorMessage = document.querySelector('.error-message');
    errorMessage.classList.add('active');

    // Remove shake class and hide message after a few seconds
    setTimeout(() => {
        for (let i = 0; i < wordLength; i++) {
            const cell = document.getElementById(`cell-${currentRow}-${i}`);
            cell.classList.remove('shake');
        }
        errorMessage.classList.remove('active');
    }, 2000); // Adjust time as needed
}


function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60; // Remaining seconds after minutes
    minutes = minutes % 60; // Remaining minutes after hours

    // Padding each value with a leading zero if less than 10
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}


function formatSeconds(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    return seconds;
}


function saveGameState() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;

    const gameState = {
        currentGuess: currentGuess,
        currentRow: currentRow,
        elapsed: elapsed,
        gridState: Array.from({ length: maxTries }, (_, row) =>
            Array.from({ length: wordLength }, (__, col) => {
                const cell = document.getElementById(`cell-${row}-${col}`);
                return {
                    letter: cell.textContent || '',
                    classes: cell.className.split(' ').filter(cls => cls === 'correct' || cls === 'present' || cls === 'absent')
                };
            })
        )
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function restoreGameState() {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
        const gameState = JSON.parse(savedGameState);
        currentGuess = gameState.currentGuess;
        currentRow = gameState.currentRow;
        console.log("currentrow in restoregamestate(): ", currentRow);

        // Adjust startTime based on elapsed time
        if (gameState.elapsed && gameState.elapsed > 0) {
            startTime = Date.now() - gameState.elapsed;
        }

        // Restore the grid cells based on the saved guesses
        gameState.gridState.forEach((rowState, row) => {
            let rowHasGuesses = false;
            rowState.forEach((cellState, col) => {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.textContent = cellState.letter;
                cell.className = 'grid-cell ' + cellState.classes.join(' '); // Restore classes
                if (cellState.letter) {
                    rowHasGuesses = true;
                }
            });
            if (!rowHasGuesses && row < currentRow) {
                currentRow = row;
            }
        });

        if (currentRow === maxTries) {
            handleLoss();
        }
    }
}





const logout_btn = document.getElementById('logout-btn');

logout_btn.addEventListener('click',()=>{
    console.log("clicked")
    clearGameState();
    
});

function clearGameState() {
    localStorage.removeItem('gameState');
    clearGridDisplay();
    currentGuess = [];
    currentRow = 0;
    startTime = Date.now();
}

function clearGridDisplay() {
    for (let row = 0; row < maxTries; row++) {
        for (let col = 0; col < wordLength; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.textContent = ''; 
            cell.className = 'grid-cell'; 
        }
    }
}