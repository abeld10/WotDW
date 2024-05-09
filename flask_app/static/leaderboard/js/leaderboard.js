const logout_btn = document.getElementById('logout-btn');
const maxTries = document.querySelectorAll('.grid-row:first-child .grid-cell').length;
const wordLength = document.querySelectorAll('.grid-row:first-child .grid-cell').length;
let startTime; // Set this when the game starts
let currentGuess = [];
let currentRow = 0;


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