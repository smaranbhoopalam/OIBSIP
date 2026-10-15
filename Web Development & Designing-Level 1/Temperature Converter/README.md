# Temperature Converter

A clean, accessible temperature converter supporting Celsius, Fahrenheit, and Kelvin. Built with HTML5, CSS3, and vanilla JavaScript for the OASIS Infobyte Web Development & Designing internship.

Part of the **OASIS Infobyte Web Development & Designing Internship — Level 1, Task 3: Temperature Converter**.

---

## Features

- **Three-unit support** — convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K) in any direction, including same-unit conversion.
- **Live results** — the result updates on every keystroke without a submit button.
- **Swap button** — exchanges the source and destination units and recalculates immediately.
- **Reset button** — clears the input, restores default units, and removes validation messages.
- **Physical validation** — rejects values below absolute zero for each unit; accepts exactly absolute zero.
- **Accessible** — semantic HTML5, associated labels, `aria-live` result region, `aria-describedby` for validation messages, visible keyboard focus states.
- **Responsive** — usable on desktop, tablet, and mobile; no horizontal scrolling.
- **No external dependencies** — system font stack, no CDN links, no frameworks.
- **Respects `prefers-reduced-motion`** — all transitions are disabled for users who request it.

---

## Supported Units and Validation Rules

| Unit        | Symbol | Absolute Zero |
|-------------|--------|---------------|
| Celsius     | °C     | −273.15 °C    |
| Fahrenheit  | °F     | −459.67 °F    |
| Kelvin      | K      | 0 K           |

**Validation rules (enforced in JavaScript, not relying on the browser's `min` attribute):**

- Empty input is silently cleared — not treated as zero.
- Non-numeric strings are rejected with an error message.
- Values below the absolute-zero limit for the selected source unit are rejected.
- Exactly the absolute-zero limit is accepted.
- Negative Celsius and Fahrenheit values are accepted.
- Kelvin values below 0 are rejected.
- A small floating-point tolerance (1 × 10⁻⁹) is applied only to the accept/reject boundary decision, never to clamp or round the result.

---

## Conversion Formulas

All conversions route through Celsius as an intermediate value.

```
Fahrenheit to Celsius:   °C = (°F − 32) × 5/9
Kelvin to Celsius:       °C = K − 273.15

Celsius to Fahrenheit:   °F = (°C × 9/5) + 32
Celsius to Kelvin:       K  = °C + 273.15
```

---

## Technologies

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Markup    | HTML5 — semantic elements, ARIA attributes          |
| Styling   | CSS3 — Custom Properties, Flexbox, Grid, media queries |
| Scripting | Vanilla JavaScript (ES6+, `'use strict'`, IIFE scope) |

No build tools, no frameworks, no external fonts or icon libraries.

---

## File Structure

```text
Temperature Converter/
├── index.html   — Page structure, form controls, ARIA attributes
├── style.css    — Design tokens, layout, component styles, responsive rules
├── script.js    — Conversion functions, validation, swap/reset, UI controller
└── README.md    — This file
```

### Code organisation inside `script.js`

1. **Conversion functions** (`toCelsius`, `fromCelsius`, `convert`) — pure functions; no DOM access; each does one thing.
2. **Validation** (`validate`) — returns `{ value }` on success or `{ error }` on failure; no DOM access.
3. **Formatting** (`formatResult`) — strips trailing zeros and appends the unit symbol.
4. **UI controller** (IIFE) — reads the DOM, calls the above functions, updates the display.

---

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/smaranbhoopalam/OIBSIP.git
   ```

2. Navigate to the project folder:
   ```
   Web Development & Designing-Level 1/Temperature Converter/
   ```

3. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

> **Tip:** Use the **Live Server** extension in VS Code for automatic reload on save.

No installation, no build step, no internet connection required.

---

## Manual Test Checklist

Run these checks by opening `index.html` in a browser. A tolerance of ±0.001 is sufficient for all floating-point comparisons below.

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Enter `0`, from °C, to °F | Result: **32 °F** |
| 2 | Enter `100`, from °C, to °F | Result: **212 °F** |
| 3 | Enter `32`, from °F, to °C | Result: **0 °C** |
| 4 | Enter `273.15`, from K, to °C | Result: **0 °C** |
| 5 | Enter `0`, from K, to °C | Result: **−273.15 °C** |
| 6 | Enter `−273.15`, from °C, to K | Result: **0 K** — accepted (exact absolute zero) |
| 7 | Enter `−274`, from °C | Error message shown; result cleared |
| 8 | Enter `−460`, from °F | Error message shown; result cleared |
| 9 | Enter `−1`, from K | Error message shown; result cleared |
| 10 | Clear the input field | Result resets to **—**; no error shown |
| 11 | Enter `100` °C → °F (212), then click **Swap** | Units switch to °F → °C; result updates for 100 °F → 37.7778 °C |
| 12 | Click **Reset** | Input cleared, units back to °C → °F, result **—**, no error |
| 13 | Enter `25`, from °C, to °C | Result: **25 °C** |
| 14 | View on a mobile screen (≤ 480 px wide) | Card is readable, controls are full-width, no horizontal overflow |

> **Note:** Tests 1–13 are manual instructions. They have not been run in an automated test harness. No automated test runner is included in this project.

---

## Internship Details

| Field        | Value                               |
|--------------|-------------------------------------|
| Organization | OASIS Infobyte                      |
| Track        | Web Development & Designing         |
| Level        | Level 1                             |
| Task         | Task 3 — Temperature Converter      |

---

## Author

**Smaran Bhoopalam**
GitHub: [@smaranbhoopalam](https://github.com/smaranbhoopalam)
