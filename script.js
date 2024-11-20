const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'easy'; // Default to 'easy' if no difficulty is specified

// Word pool variable
let words = [];
let currentWordIndex = 0;
let typedCharacters = 0;
let mistakes = 0;
let timeLeft = 60;
let interval;

// DOM Elements
const textDisplay = document.getElementById('text-display');
const textInput = document.getElementById('text-input');
const wpmDisplay = document.getElementById('wpm');
const cpmDisplay = document.getElementById('cpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const popup = document.getElementById('popup');
const popupWpm = document.getElementById('popup-wpm');
const popupCpm = document.getElementById('popup-cpm');
const popupAccuracy = document.getElementById('popup-accuracy');
const restartBtn = document.getElementById('restart-btn');
const goHomeBtn = document.getElementById('go-home-btn');
const goHomePopupBtn = document.getElementById('go-home-popup-btn');

// Show the homepage when the Go Home button is clicked
function goHome() {
  window.location.href = '/'; // Adjust URL if necessary
}

// Load words from the selected difficulty
function loadWords() {
  fetch(`${difficulty}.json`)
    .then(response => response.json())
    .then(data => {
      words = data.words;
      startTest();
    })
    .catch(error => {
      console.error("Error loading word file:", error);
    });
}

// Generate random words dynamically
function generateWords(count) {
  const wordList = [];
  for (let i = 0; i < count; i++) {
    wordList.push(words[Math.floor(Math.random() * words.length)]);
  }
  return wordList;
}

function updateTextDisplay() {
  const maxWidth = textDisplay.clientWidth; // Available space for words
  let visibleWords = '';
  let currentWidth = 0;

  for (let i = currentWordIndex; i < words.length; i++) {
    const wordWidth = words[i].length * 15; // Approximate width per word
    if (currentWidth + wordWidth < maxWidth) {
      visibleWords += words[i] + ' ';
      currentWidth += wordWidth;
    } else {
      break;
    }
  }
  textDisplay.textContent = visibleWords.trim();
}

function startTest() {
  updateTextDisplay();
  textInput.addEventListener('input', checkInput);
  interval = setInterval(updateTimer, 1000);
}

function checkInput(e) {
  const typedText = textInput.value.trim(); // Get the typed input
  const currentWord = words[currentWordIndex]; // Current word to match

  // Handle backspace and input logic
  if (e.inputType === 'deleteContentBackward') {
    return; // Do not count backspace as a mistake or character typed
  }

  // Track all characters typed
  typedCharacters++;

  // Validate input
  if (currentWord.startsWith(typedText)) {
    textInput.style.color = "green";
  } else {
    textInput.style.color = "red";
    mistakes++;
  }

  // Move to the next word when space is pressed and the word is correct
  if (typedText === currentWord && textInput.value.endsWith(" ")) {
    currentWordIndex++;
    textInput.value = ""; // Clear the input field
    if (currentWordIndex >= words.length) {
      words = [...words, ...generateWords(20)]; // Generate more words if the current pool is exhausted
    }
    updateTextDisplay(); // Update visible words
  }

  updateStats();
}

function updateStats() {
  const wordsTyped = currentWordIndex;
  const minutes = (60 - timeLeft) / 60;
  const wpm = Math.round(wordsTyped / minutes || 0);
  const cpm = Math.round(typedCharacters / minutes || 0);
  const accuracy = Math.max(0, Math.round(((typedCharacters - mistakes) / typedCharacters) * 100) || 0);

  wpmDisplay.textContent = wpm;
  cpmDisplay.textContent = cpm;
  accuracyDisplay.textContent = `${accuracy}%`;
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = timeLeft;

  if (timeLeft === 0) {
    clearInterval(interval);
    textInput.disabled = true;
    showPopup();
  }
}

function showPopup() {
  popupWpm.textContent = wpmDisplay.textContent;
  popupCpm.textContent = cpmDisplay.textContent;
  popupAccuracy.textContent = accuracyDisplay.textContent;
  popup.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
  location.reload(); // Reload the page to restart the test
});

// Add event listener to the "Go Home" buttons
goHomeBtn.addEventListener('click', goHome);
goHomePopupBtn.addEventListener('click', goHome);

// Start the test when the page loads and the difficulty is loaded
loadWords();
