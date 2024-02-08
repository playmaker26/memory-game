// Global variables
const cards = document.querySelectorAll('.memory-card');
let hasFlippedCard = false;
let firstCard, secondCard;
let counter = 0;
let lockBoard = true;
let timerInterval;
let counterInterval;
let startTime;
let difficulty = 'none';
const backgroundMusic = document.querySelector('#background-music');
backgroundMusic.volume = 0.5;
const pairedMatchSounds = {
    "boo": document.querySelector('#paired-match-boo'),
    "bowser": document.querySelector('#paired-match-bowser'),
    "koopa": document.querySelector('#paired-match-koopa'),
    "luigi": document.querySelector('#paired-match-luigi'),
    "mario": document.querySelector('#paired-match-mario'),
    "yoshi": document.querySelector('#paired-match-yoshi'),
};
const winningMusic = document.querySelector('#winning-music');
const wrongMatchSound = document.querySelector('#wrong-match');
let PairedMatchSoundPlayed = false;
let easyModeShuffled = false;
let isBackgroundMusicPlaying = false; // Variable to track if background music is playing
let difficultySelected = false;

// Function to play easy mode background music
function playEasyBackgroundMusic() {
    backgroundMusic.play();
    isBackgroundMusicPlaying = true; // Set background music state to playing
}

// Function to stop easy mode background music
function stopEasyBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isBackgroundMusicPlaying = false; // Set background music state to not playing
}

// Function to stop wrong match sound
function stopWrongMatchSound() {
    wrongMatchSound.pause();
    wrongMatchSound.currentTime = 0;
}

// Function to stop background music
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isBackgroundMusicPlaying = false; // Set background music state to not playing
}

// Function to play paired match sound
function playPairedMatchSound(character) {
    pairedMatchSounds[character].play();
}

// Function to play wrong match sound
function playWrongMatchSound() {
    wrongMatchSound.play();
}

// Function to play winning music
function playWinningMusic() {
    winningMusic.play();
}

function disableDifficultySelect() {
    document.querySelector('#difficulty').disabled = true;
}

function enableDifficultySelect() {
    document.querySelector('#difficulty').disabled = false;
}

// Function to disable card clicks
function disableCardClicks() {
    cards.forEach(card => {
        card.removeEventListener('click', flipCard);
    });
}

// Function to enable card clicks
function enableCardClicks() {
    cards.forEach(card => {
        card.addEventListener('click', flipCard);
    });
}

// Update event listener for difficulty selection
document.querySelector('#difficulty').addEventListener('change', async () => {
    alert('Difficulty mode selected.');

    let selectedDifficulty = document.querySelector('#difficulty').value;
    if (selectedDifficulty === 'easy') {
        await shuffle(); // Shuffle the cards when switching to easy mode
    }

    // Set difficultySelected to true when a difficulty mode is selected
    difficultySelected = true;
});

// Function to stop winning music
function stopWinningMusic() {
    winningMusic.pause();
    winningMusic.currentTime = 0;
}

// Function to flip card
function flipCard() {
    if (!difficultySelected) {
        alert('Please choose a difficulty mode.');
        return;
    }

    if (this.classList.contains('disabled') || this === firstCard) return; // Check if the card is disabled or already flipped

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        counter += 1;
        document.querySelector('#turn-counter').innerHTML = counter;
        if (counter === 1) {
            startTimer();
            startTime = new Date();
        }
        return;
    }

    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
}

async function checkForMatch() {
    // Check if the flipped cards have the same character
    let isMatch = firstCard.dataset.character === secondCard.dataset.character;

    if (isMatch) {
        if (!PairedMatchSoundPlayed) {
            playPairedMatchSound(firstCard.dataset.character);
            PairedMatchSoundPlayed = true;
        }
        document.querySelector('#match-result').textContent = `You matched ${firstCard.dataset.character}!`;
        disabledCards();
    } else {
        if (!PairedMatchSoundPlayed) {
            playWrongMatchSound();
            PairedMatchSoundPlayed = true;
        }
        setTimeout(() => {
            PairedMatchSoundPlayed = false;
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            let selectedDifficulty = document.querySelector('#difficulty').value;

            if (selectedDifficulty === 'hard') {
                let unmatchedCards = Array.from(cards).filter(card => !card.classList.contains('flip'));
                let randomPosArr = Array.from({ length: unmatchedCards.length }, (_, i) => i);
                randomPosArr = shuffleArray(randomPosArr);
                unmatchedCards.forEach((card, index) => {
                    card.style.order = randomPosArr[index];
                });
            }
            resetBoard();
        }, 1500);
    }
}

// Function to disable cards
function disabledCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    let flippedCards = document.querySelectorAll('.memory-card.flip')
    if(flippedCards.length === cards.length) {
        stopTimer();

        let endTime = new Date();
        let totalTimeInSeconds = Math.floor((endTime - startTime) / 1000);
        let formattedTime = formatTime(totalTimeInSeconds);
        document.querySelector('#match-result').textContent = `Congratulations! You matched all cards in ${formattedTime} with ${counter} turns`;

        stopBackgroundMusic(); // Stop the background music
        playWinningMusic(); // Play the winning music

        setTimeout(() => {
            
        }, 5000);
    }
    resetBoard();
}

// Function to unflip cards
function unflipCards() {

}

// Function to reset board
function resetBoard() {
    PairedMatchSoundPlayed = false;
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function startTimer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        let formattedTime = formatTime(seconds);
        document.querySelector('#timer').textContent = formattedTime;
    }, 1000);
}

// Function to stop timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Function to format time
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to shuffle cards and handle difficulty modes
async function shuffle() {
    // Shuffle the cards initially
    console.log("Shuffling cards initially...");
    let randomPosArr = shuffleArray(Array.from({ length: cards.length }, (_, i) => i));
    cards.forEach((card, index) => {
        card.style.order = randomPosArr[index];
    });

    // Get the selected difficulty
    let selectedDifficulty = document.querySelector('#difficulty').value;

    // Play background music based on difficulty mode
    if (selectedDifficulty === 'easy') {
        playEasyBackgroundMusic(); // Play easy mode background music
    } else if (selectedDifficulty === 'hard') {
        backgroundMusic.play(); // Play default background music for hard mode
        isBackgroundMusicPlaying = true; // Set background music state to playing
    }
}

// Event listener for card clicks
cards.forEach(card => card.addEventListener('click', flipCard));

// Function to reset the game
function resetGame() {
    // Stop the timer if it's running
    stopTimer();

    // Lock the board if a difficulty mode has not been selected
    if (!difficultySelected) {
        lockBoard = true;
        return;
    }

    // Reset all global variables
    hasFlippedCard = false;
    firstCard = null;
    secondCard = null;
    counter = 0;
    lockBoard = false;
    startTime = null;
    PairedMatchSoundPlayed = false;

    // Reset the turn counter and timer display
    document.querySelector('#turn-counter').textContent = '0';
    document.querySelector('#timer').textContent = '0:00';

    // Reset the match result display
    document.querySelector('#match-result').textContent = '';

    // Reset difficulty selection
    document.querySelector('#difficulty').value = 'none';

    // Enable difficulty selection
    enableDifficultySelect();

    // Stop background music
    stopBackgroundMusic();

    // Stop winning music
    stopWinningMusic();

    // Start background music based on selected difficulty if it was playing before
    let selectedDifficulty = document.querySelector('#difficulty').value;
    if (selectedDifficulty !== 'none') {
        startBackgroundMusic(selectedDifficulty);
    }

    // Set difficultySelected to false when resetting the game
    difficultySelected = false;

    // Flip all cards back to their original state
    cards.forEach(card => {
        card.classList.remove('flip', 'disabled');
    });
}

// Event listener for restart button
document.querySelector('#restart-button').addEventListener('click', () => {
    resetGame();
});
