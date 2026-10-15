/**
 * Temperature Converter — script.js
 * OASIS Infobyte, Level 1, Task 3
 *
 * Architecture overview
 * ─────────────────────
 * All temperatures are converted through Celsius as an intermediate value:
 *
 *   source → toCelsius(value, fromUnit) → Celsius → fromCelsius(celsius, toUnit) → result
 *
 * The code is split into three layers:
 *   1. Pure conversion functions  – no DOM access, easily testable
 *   2. Validation functions       – no DOM access, return error strings or null
 *   3. UI controller              – wires the DOM to the conversion/validation layer
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   1. CONVERSION FUNCTIONS
   ───────────────────────────────────────────────────────────────── */

/**
 * Convert any temperature value to Celsius.
 *
 * @param {number} value    - The numeric temperature in the source unit.
 * @param {string} fromUnit - 'celsius' | 'fahrenheit' | 'kelvin'
 * @returns {number} The equivalent temperature in Celsius.
 */
function toCelsius(value, fromUnit) {
  switch (fromUnit) {
    case 'celsius':
      return value;

    case 'fahrenheit':
      // °C = (°F − 32) × 5/9
      return (value - 32) * (5 / 9);

    case 'kelvin':
      // °C = K − 273.15
      return value - 273.15;

    default:
      throw new Error('Unknown source unit: ' + fromUnit);
  }
}

/**
 * Convert a Celsius value to any target unit.
 *
 * @param {number} celsius  - Temperature in Celsius.
 * @param {string} toUnit   - 'celsius' | 'fahrenheit' | 'kelvin'
 * @returns {number} The equivalent temperature in the target unit.
 */
function fromCelsius(celsius, toUnit) {
  switch (toUnit) {
    case 'celsius':
      return celsius;

    case 'fahrenheit':
      // °F = (°C × 9/5) + 32
      return celsius * (9 / 5) + 32;

    case 'kelvin':
      // K = °C + 273.15
      return celsius + 273.15;

    default:
      throw new Error('Unknown target unit: ' + toUnit);
  }
}

/**
 * Full conversion: source unit → target unit.
 * This is the single entry point for all conversions.
 *
 * @param {number} value    - Numeric temperature in the source unit.
 * @param {string} fromUnit - Source unit key.
 * @param {string} toUnit   - Target unit key.
 * @returns {number}
 */
function convert(value, fromUnit, toUnit) {
  const celsius = toCelsius(value, fromUnit);
  return fromCelsius(celsius, toUnit);
}


/* ─────────────────────────────────────────────────────────────────
   2. VALIDATION
   ───────────────────────────────────────────────────────────────── */

/**
 * Absolute-zero limits expressed in each unit's own scale.
 * These are the lowest physically meaningful temperatures.
 */
const ABSOLUTE_ZERO = {
  celsius:    -273.15,
  fahrenheit: -459.67,
  kelvin:       0,
};

/**
 * A small tolerance used only when comparing a user-supplied value to the
 * absolute-zero boundary. This avoids rejecting −273.15 °C when floating-point
 * arithmetic produces something like −273.14999999999998.
 *
 * It is NOT used to clamp or round the result; it only affects the accept/reject
 * decision for boundary inputs.
 */
const ABSOLUTE_ZERO_TOLERANCE = 1e-9;

/**
 * Validate a temperature string against the selected source unit.
 *
 * @param {string} rawValue - The raw string from the input element.
 * @param {string} unit     - 'celsius' | 'fahrenheit' | 'kelvin'
 * @returns {{ value: number } | { error: string }}
 *   Returns an object with a `value` property on success, or an `error`
 *   string on failure. This makes the two outcomes unambiguous.
 */
function validate(rawValue, unit) {
  // 1. Reject empty or whitespace-only input explicitly.
  if (rawValue.trim() === '') {
    return { error: 'Please enter a temperature.' };
  }

  // 2. Convert to a number and reject anything that isn't a real finite number.
  const num = Number(rawValue);
  if (!Number.isFinite(num)) {
    return { error: 'Please enter a valid numeric temperature.' };
  }

  // 3. Reject values below absolute zero (with a tiny tolerance at the boundary).
  const limit = ABSOLUTE_ZERO[unit];
  if (num < limit - ABSOLUTE_ZERO_TOLERANCE) {
    const unitLabel = unitDisplayName(unit);
    return {
      error: `Temperature cannot be below absolute zero (${limit} ${unitLabel}).`,
    };
  }

  // All checks passed.
  return { value: num };
}


/* ─────────────────────────────────────────────────────────────────
   3. FORMATTING
   ───────────────────────────────────────────────────────────────── */

/** Unit symbols displayed in the result text. */
const UNIT_SYMBOL = {
  celsius:    '°C',
  fahrenheit: '°F',
  kelvin:     'K',
};

/** Full display name used in error messages. */
function unitDisplayName(unit) {
  return UNIT_SYMBOL[unit] || unit;
}

/**
 * Format a numeric result for display.
 *
 * Rules:
 *  - Up to 4 decimal places.
 *  - Trailing zeros after the decimal point are removed.
 *  - The unit symbol is appended.
 *
 * Examples:  32 → "32 °F",  -273.15 → "-273.15 °C",  373.1500 → "373.15 K"
 *
 * @param {number} value
 * @param {string} unit
 * @returns {string}
 */
function formatResult(value, unit) {
  // toFixed(4) gives us at most 4 decimal places as a string.
  // parseFloat then strips trailing zeros: "32.0000" → 32 → "32".
  const rounded = parseFloat(value.toFixed(4));
  return `${rounded} ${UNIT_SYMBOL[unit]}`;
}


/* ─────────────────────────────────────────────────────────────────
   4. UI CONTROLLER
   ───────────────────────────────────────────────────────────────── */

(function initUI() {
  /* ── DOM references ───────────────────────────────────────────── */
  const tempInput     = document.getElementById('temp-input');
  const fromUnitSel   = document.getElementById('from-unit');
  const toUnitSel     = document.getElementById('to-unit');
  const swapBtn       = document.getElementById('swap-btn');
  const resetBtn      = document.getElementById('reset-btn');
  const resultValue   = document.getElementById('result-value');
  const validationMsg = document.getElementById('validation-msg');
  const resultCard    = resultValue.closest('.result-card');

  /* ── Initial / default state ──────────────────────────────────── */
  const DEFAULT_FROM = 'celsius';
  const DEFAULT_TO   = 'fahrenheit';

  /**
   * Recalculate and render the conversion result.
   *
   * Called whenever the input value or either unit selector changes.
   * The function validates the current input first; if validation fails it
   * shows the error message and clears the result, otherwise it converts
   * and displays the formatted output.
   */
  function updateResult() {
    const rawValue = tempInput.value;
    const fromUnit = fromUnitSel.value;
    const toUnit   = toUnitSel.value;

    const validation = validate(rawValue, fromUnit);

    if (validation.error) {
      // Show error — but only show the message if the user has typed something.
      // An empty input just clears the result silently.
      if (rawValue.trim() === '') {
        clearError();
        clearResult();
      } else {
        showError(validation.error);
        clearResult();
      }
      return;
    }

    // Valid input: convert and display.
    clearError();

    const result = convert(validation.value, fromUnit, toUnit);

    // Guard against unexpected NaN or Infinity reaching the display.
    if (!Number.isFinite(result)) {
      showError('Conversion produced an invalid result. Please check your input.');
      clearResult();
      return;
    }

    resultValue.textContent = formatResult(result, toUnit);
    resultCard.classList.add('result--valid');
  }

  /* ── Error helpers ────────────────────────────────────────────── */

  function showError(message) {
    validationMsg.textContent = message;
    tempInput.classList.add('input--error');
    tempInput.setAttribute('aria-invalid', 'true');
  }

  function clearError() {
    validationMsg.textContent = '';
    tempInput.classList.remove('input--error');
    tempInput.removeAttribute('aria-invalid');
  }

  /* ── Result helpers ───────────────────────────────────────────── */

  function clearResult() {
    resultValue.textContent = '—';
    resultCard.classList.remove('result--valid');
  }

  /* ── Swap ─────────────────────────────────────────────────────── */

  /**
   * Swap the source and destination units.
   *
   * After swapping, we recalculate using the same numeric value in the input
   * field but now treating it as being in the new source unit. This means
   * the physical temperature represented may change — which is correct behaviour
   * when the user swaps units on an already-entered number.
   *
   * If the user's intent is to "reverse" a completed conversion (i.e., take the
   * result and make it the new input), they would need to copy the result manually.
   * This keeps the UI simple and unambiguous.
   */
  function handleSwap() {
    const previousFrom = fromUnitSel.value;
    const previousTo   = toUnitSel.value;

    fromUnitSel.value = previousTo;
    toUnitSel.value   = previousFrom;

    // Revalidate and recalculate with the new unit pairing.
    updateResult();
  }

  /* ── Reset ────────────────────────────────────────────────────── */

  /**
   * Reset all fields to their initial state:
   *  - Clear the numeric input.
   *  - Restore from-unit to 'celsius' and to-unit to 'fahrenheit'.
   *  - Clear any validation message and error styling.
   *  - Reset the result display to '—'.
   */
  function handleReset() {
    tempInput.value    = '';
    fromUnitSel.value  = DEFAULT_FROM;
    toUnitSel.value    = DEFAULT_TO;

    clearError();
    clearResult();

    // Return focus to the input so the user can start again without mousing.
    tempInput.focus();
  }

  /* ── Event listeners ──────────────────────────────────────────── */

  // Convert on every keystroke in the input.
  tempInput.addEventListener('input', updateResult);

  // Re-validate and re-convert whenever a unit changes.
  fromUnitSel.addEventListener('change', updateResult);
  toUnitSel.addEventListener('change', updateResult);

  swapBtn.addEventListener('click', handleSwap);
  resetBtn.addEventListener('click', handleReset);

})(); // end initUI — IIFE keeps all UI variables out of global scope
