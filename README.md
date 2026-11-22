# TypeCraft — Speed Typing Test Application ⌨️
**Curriculum Level:** B.Tech CSAI / CS 1st Year  
**Category:** Practical Project (#18 from Curriculum List)

---

## 📌 Project Overview
**TypeCraft** is an interactive, real-time typing speed and accuracy testing web application. Inspired by modern developer tools like MonkeyType, it tracks live keystrokes, provides visual character-level feedback, calculates standard **WPM (Words Per Minute)** and **Accuracy %**, and persists the user's personal best speed in `localStorage`.

---

## 🚀 Key Features

1. **Character-by-Character Visual Feedback:**
   - Real-time highlight: correct characters turn blue/cyan, while incorrect characters turn red with background tinting.
   - Smooth animated caret/cursor tracking the active character.

2. **Dual Speed & Accuracy Metrics:**
   - **Net WPM (Words Per Minute):** Standard typing formula penalized for uncorrected mistakes:
     $$\text{Net WPM} = \frac{(\text{Correct Characters} / 5) - (\text{Wrong Characters} / 5)}{\text{Time in Minutes}}$$
   - **Raw WPM:** Measures raw keystroke speed without error penalty.
   - **Accuracy Percentage:**
     $$\text{Accuracy (\%)} = \left(\frac{\text{Correct Characters}}{\text{Total Typed Characters}}\right) \times 100$$

3. **Multiple Test Modes & Durations:**
   - **Categories:** Famous Computer Science Quotes, Common Words, and Real Code Snippets (C language & JavaScript).
   - **Durations:** 15s, 30s, and 60s tests.

4. **Automated Timer & High Score System:**
   - Starts automatically on the user's very first keystroke.
   - Saves personal best WPM across browser reloads using `window.localStorage`.
   - Congratulatory alert when a new high score is broken.

5. **Keyboard Accessibility & Shortcuts:**
   - Press <kbd>Escape</kbd> to instantly restart a test without reaching for the mouse.

6. **Dual Light/Dark Theme:**
   - Developer-friendly dark mode (default) and crisp high-contrast light mode.

---

## 🛠️ Tech Stack & Architecture

- **Markup:** Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<dialog>`)
- **Styling:** CSS3 variables, Flexbox, CSS Grid, monospace fonts (`JetBrains Mono`).
- **Core Logic:** Pure ES6 JavaScript (`setInterval`, `Event Listeners`, DOM string manipulations).
- **Data Persistence:** `window.localStorage` API.

---

## 📂 File Structure

```text
typing-speed-test/
├── index.html       # Application UI & modal layout
├── styles.css       # Monospace typography, caret animations & themes
├── app.js           # Real-time typing engine, timer, & WPM formulas
└── README.md        # Comprehensive documentation & Viva Q&A
```

---

## 💻 How to Run the Project

1. Simply double-click [`index.html`](index.html) to run it in any browser (Chrome, Edge, Firefox, Safari).
2. Or use Python to start a local server:
   ```bash
   python -m http.server 5000
   ```
   Then open `http://localhost:5000`.

---

## 🎯 Viva & Practical Exam Questions (Preparation Guide)

### Q1. Why is 1 word considered 5 characters in typing tests?
> **Answer:** In standardized typing evaluation (such as typewriter and keyboard benchmarking), words vary in length. Standard industry formula defines a "word" as **5 keystrokes** (including letters, punctuation, and spaces) to ensure fair comparisons regardless of text difficulty.

### Q2. How is Net WPM different from Gross (Raw) WPM?
> **Answer:**
> - **Gross (Raw) WPM** calculates all characters typed divided by 5 per minute, regardless of errors.
> - **Net WPM** subtracts the error count from the total keystrokes before dividing by 5. It measures productive, mistake-free typing speed.

### Q3. How does the application capture keystrokes smoothly?
> **Answer:** It uses an off-screen, focused `<input>` element listening for `input` events. Each input event retrieves the latest character typed, compares it against the expected character in the text array at `currentIndex`, and applies `.correct` or `.incorrect` CSS classes dynamically.

### Q4. How do you prevent memory leaks with `setInterval()`?
> **Answer:** Whenever the timer hits 0 or the user clicks "Restart", we call `clearInterval(timerInterval)` and reset the reference to `null`. This prevents orphaned timer threads from running in the browser background.
