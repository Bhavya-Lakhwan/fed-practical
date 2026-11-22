/**
 * TYPECRAFT - SPEED TYPING TEST ENGINE
 * Vanilla JavaScript ES6
 * 
 * Features:
 * - Real-time character-by-character validation and blinking cursor tracking
 * - Dual WPM calculation: Net WPM (penalized for errors) & Raw WPM
 * - Multi-mode: Inspiring Quotes, Common Words, and Real Code Snippets (C / JS)
 * - Auto-start timer on first keystroke
 * - High score persistence with LocalStorage
 * - Keyboard shortcuts (Tab+Enter or Esc to restart)
 */

// ==========================================================================
// 1. Text Passages Dataset
// ==========================================================================
const DATASETS = {
  quotes: [
    "Simplicity is prerequisite for reliability. Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Talk is cheap. Show me the code. The only way to learn a new programming language is by writing programs in it.",
    "First, solve the problem. Then, write the code. Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
    "Computer science is no more about computers than astronomy is about telescopes. Think twice, code once.",
    "Programs must be written for people to read, and only incidentally for machines to execute. Experience is the name everyone gives to their mistakes.",
    "The function of good software is to make the complex appear to be simple. Premature optimization is the root of all evil."
  ],
  words: [
    "algorithm binary compile debug execute function variable pointer loop condition array structure memory pointer system terminal syntax logic compile return integer float string character boolean module import export class object inheritance method",
    "computer science database network server client protocol packet request response cache buffer thread process deadlock semaphore stack queue tree graph search sort recursion iteration constant dynamic",
    "frontend backend fullstack interface component element styling layout responsive design container flexbox grid script event listener handler dispatch promise async await storage session cookie token"
  ],
  code: [
    "#include <stdio.h>\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}",
    "for (int i = 0; i < n; i++) {\n  if (arr[i] > max) {\n    max = arr[i];\n  }\n}",
    "const calculateWpm = (chars, time) => {\n  return Math.round((chars / 5) / (time / 60));\n};",
    "typedef struct {\n  int id;\n  char name[50];\n  float gpa;\n} Student;"
  ]
};

const STORAGE_KEY_BEST = 'typecraft_best_wpm_v1';
const STORAGE_KEY_THEME = 'typecraft_theme_v1';

// ==========================================================================
// 2. Application State
// ==========================================================================
let state = {
  category: 'quotes',       // 'quotes' | 'words' | 'code'
  selectedDuration: 30,     // 15 | 30 | 60
  timeLeft: 30,
  timerInterval: null,
  isTestActive: false,
  isTestFinished: false,
  
  targetText: '',
  currentIndex: 0,
  correctChars: 0,
  wrongChars: 0,
  totalTyped: 0,
  bestWpm: 0,
  theme: 'dark'
};

// ==========================================================================
// 3. DOM Elements Cache
// ==========================================================================
const DOM = {
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  bestWpmVal: document.getElementById('bestWpmVal'),
  
  categoryPills: document.querySelectorAll('#categoryGroup .config-pill'),
  timePills: document.querySelectorAll('#timeGroup .config-pill'),
  
  timeDisplay: document.getElementById('timeDisplay'),
  liveWpm: document.getElementById('liveWpm'),
  liveAccuracy: document.getElementById('liveAccuracy'),
  liveErrors: document.getElementById('liveErrors'),
  
  typingArena: document.getElementById('typingArena'),
  textDisplay: document.getElementById('textDisplay'),
  hiddenInput: document.getElementById('hiddenInput'),
  restartBtn: document.getElementById('restartBtn'),
  
  resultsModal: document.getElementById('resultsModal'),
  resultsBadge: document.getElementById('resultsBadge'),
  resultsSubtext: document.getElementById('resultsSubtext'),
  finalWpm: document.getElementById('finalWpm'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  finalRawWpm: document.getElementById('finalRawWpm'),
  finalCorrectChars: document.getElementById('finalCorrectChars'),
  finalWrongChars: document.getElementById('finalWrongChars'),
  newRecordBanner: document.getElementById('newRecordBanner'),
  modalRestartBtn: document.getElementById('modalRestartBtn')
};

// ==========================================================================
// 4. Initialization
// ==========================================================================
function initApp() {
  loadStoredPreferences();
  setupEventListeners();
  resetTest();
}

function loadStoredPreferences() {
  const savedBest = localStorage.getItem(STORAGE_KEY_BEST);
  if (savedBest) {
    state.bestWpm = parseInt(savedBest, 10) || 0;
    DOM.bestWpmVal.textContent = state.bestWpm;
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  DOM.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

// ==========================================================================
// 5. Test Setup & Reset
// ==========================================================================
function resetTest() {
  // Clear any running interval
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  state.isTestActive = false;
  state.isTestFinished = false;
  state.timeLeft = state.selectedDuration;
  state.currentIndex = 0;
  state.correctChars = 0;
  state.wrongChars = 0;
  state.totalTyped = 0;

  // Reset metrics display
  DOM.timeDisplay.textContent = state.timeLeft;
  DOM.liveWpm.textContent = '0';
  DOM.liveAccuracy.textContent = '100';
  DOM.liveErrors.textContent = '0';

  // Close modal
  DOM.resultsModal.classList.remove('active');
  DOM.newRecordBanner.style.display = 'none';

  // Load fresh passage
  pickPassage();
  renderPassage();

  // Reset & focus hidden input
  DOM.hiddenInput.value = '';
  DOM.hiddenInput.focus();
}

function pickPassage() {
  const list = DATASETS[state.category] || DATASETS.quotes;
  const randomIndex = Math.floor(Math.random() * list.length);
  state.targetText = list[randomIndex];
}

function renderPassage() {
  DOM.textDisplay.innerHTML = '';
  const fragment = document.createDocumentFragment();

  // Split target text into individual character spans
  for (let i = 0; i < state.targetText.length; i++) {
    const char = state.targetText[i];
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char;
    if (i === 0) span.classList.add('active'); // active cursor
    fragment.appendChild(span);
  }

  DOM.textDisplay.appendChild(fragment);
}

// ==========================================================================
// 6. Typing Event Handling
// ==========================================================================
function startTimer() {
  state.isTestActive = true;
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    DOM.timeDisplay.textContent = state.timeLeft;
    updateLiveMetrics();

    if (state.timeLeft <= 0) {
      finishTest();
    }
  }, 1000);
}

function handleInput(e) {
  if (state.isTestFinished) return;

  // Start timer on first keystroke
  if (!state.isTestActive) {
    startTimer();
  }

  const inputValue = DOM.hiddenInput.value;
  const chars = DOM.textDisplay.querySelectorAll('.char');

  // Handle Backspace (input length less than current index)
  if (inputValue.length < state.currentIndex) {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      const prevSpan = chars[state.currentIndex];
      
      // Update counts based on what was removed
      if (prevSpan.classList.contains('correct')) {
        state.correctChars--;
      } else if (prevSpan.classList.contains('incorrect')) {
        state.wrongChars--;
      }
      
      prevSpan.className = 'char active';
      // Remove active from previous
      if (chars[state.currentIndex + 1]) {
        chars[state.currentIndex + 1].classList.remove('active');
      }
    }
    updateLiveMetrics();
    return;
  }

  // Handle standard character input
  if (state.currentIndex >= state.targetText.length) {
    // Reached end of text before time expired, finish test
    finishTest();
    return;
  }

  const typedChar = inputValue[inputValue.length - 1];
  const expectedChar = state.targetText[state.currentIndex];
  const currentSpan = chars[state.currentIndex];

  state.totalTyped++;

  if (typedChar === expectedChar) {
    currentSpan.className = 'char correct';
    state.correctChars++;
  } else {
    currentSpan.className = 'char incorrect';
    state.wrongChars++;
  }

  // Advance index and set next cursor
  state.currentIndex++;
  if (state.currentIndex < chars.length) {
    chars[state.currentIndex].classList.add('active');
    scrollIntoViewIfNeeded(chars[state.currentIndex]);
  } else {
    // Finished all text in passage!
    finishTest();
    return;
  }

  updateLiveMetrics();
}

function scrollIntoViewIfNeeded(element) {
  const container = DOM.textDisplay;
  const containerRect = container.getBoundingClientRect();
  const elemRect = element.getBoundingClientRect();

  if (elemRect.bottom > containerRect.bottom - 20) {
    container.scrollTop += 36;
  } else if (elemRect.top < containerRect.top + 10) {
    container.scrollTop -= 36;
  }
}

// ==========================================================================
// 7. Live & Final Calculations
// ==========================================================================
function updateLiveMetrics() {
  const timeElapsed = state.selectedDuration - state.timeLeft;
  
  if (timeElapsed > 0) {
    // Standard WPM: (correct characters / 5) / (elapsed minutes)
    const minutes = timeElapsed / 60;
    const wpm = Math.max(0, Math.round((state.correctChars / 5) / minutes));
    DOM.liveWpm.textContent = wpm;
  }

  const accuracy = state.totalTyped > 0 
    ? Math.round((state.correctChars / state.totalTyped) * 100) 
    : 100;
  DOM.liveAccuracy.textContent = accuracy;
  DOM.liveErrors.textContent = state.wrongChars;
}

function finishTest() {
  state.isTestFinished = true;
  state.isTestActive = false;

  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  // Compute final scores
  const timeElapsed = Math.max(1, state.selectedDuration - state.timeLeft);
  const minutes = timeElapsed / 60;

  // Net WPM: ((correct chars / 5) - (wrong chars / 5)) / minutes
  const netWpm = Math.max(0, Math.round(((state.correctChars / 5) - (state.wrongChars / 5)) / minutes));
  const rawWpm = Math.max(0, Math.round((state.totalTyped / 5) / minutes));
  const accuracy = state.totalTyped > 0 
    ? Math.round((state.correctChars / state.totalTyped) * 100) 
    : 0;

  // Display in modal
  DOM.finalWpm.textContent = netWpm;
  DOM.finalRawWpm.textContent = rawWpm;
  DOM.finalAccuracy.textContent = `${accuracy}%`;
  DOM.finalCorrectChars.textContent = state.correctChars;
  DOM.finalWrongChars.textContent = state.wrongChars;

  // Speed Badge & Titles
  if (netWpm >= 80) {
    DOM.resultsBadge.textContent = 'Godspeed Typist ⚡';
    DOM.resultsSubtext.textContent = 'Incredible speed! You are typing faster than 95% of developers.';
  } else if (netWpm >= 60) {
    DOM.resultsBadge.textContent = 'Pro Typist 🚀';
    DOM.resultsSubtext.textContent = 'Great rhythm and accuracy. Ready for heavy coding marathons!';
  } else if (netWpm >= 40) {
    DOM.resultsBadge.textContent = 'Fast Typist 🔥';
    DOM.resultsSubtext.textContent = 'Solid speed! Above average for college students and engineers.';
  } else if (netWpm >= 25) {
    DOM.resultsBadge.textContent = 'Intermediate Typist ✨';
    DOM.resultsSubtext.textContent = 'Good consistency. Practice daily to reach 50+ WPM.';
  } else {
    DOM.resultsBadge.textContent = 'Beginner Typist 🌱';
    DOM.resultsSubtext.textContent = 'Focus on accuracy first, speed will naturally follow.';
  }

  // Check for Personal Best
  if (netWpm > state.bestWpm) {
    state.bestWpm = netWpm;
    localStorage.setItem(STORAGE_KEY_BEST, netWpm.toString());
    DOM.bestWpmVal.textContent = netWpm;
    DOM.newRecordBanner.style.display = 'block';
  }

  DOM.resultsModal.classList.add('active');
  DOM.modalRestartBtn.focus();
}

// ==========================================================================
// 8. Event Listeners
// ==========================================================================
function setupEventListeners() {
  // Focus hidden input when clicking anywhere in typing arena
  DOM.typingArena.addEventListener('click', () => {
    DOM.hiddenInput.focus();
    DOM.typingArena.classList.add('focused');
  });

  DOM.hiddenInput.addEventListener('blur', () => {
    DOM.typingArena.classList.remove('focused');
  });

  // Keystrokes
  DOM.hiddenInput.addEventListener('input', handleInput);

  // Restart Buttons
  DOM.restartBtn.addEventListener('click', resetTest);
  DOM.modalRestartBtn.addEventListener('click', resetTest);

  // Category Selector Pills
  DOM.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.category = pill.dataset.category;
      resetTest();
    });
  });

  // Time Duration Selector Pills
  DOM.timePills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.timePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedDuration = parseInt(pill.dataset.time, 10);
      resetTest();
    });
  });

  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Keyboard Shortcuts: Tab + Enter or Escape to restart
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      resetTest();
    }
  });
}

// Run on load
document.addEventListener('DOMContentLoaded', initApp);
