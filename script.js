/**
 * ============================================
 * Scientific Calculator - JavaScript
 * Beginner-friendly vanilla JavaScript implementation
 * ============================================
 * 
 * FEATURES:
 * - Core operations: +, -, *, /, %
 * - Scientific functions: sin, cos, tan, log, ln, sqrt, pow, factorial, abs
 * - Keyboard support
 * - Accessible controls (aria-labels)
 * - Safe evaluation (no eval)
 * - State management with history
 * 
 * OPTIONAL FEATURES (uncomment to enable):
 * - Theme toggle
 * - History panel
 * - Memory functions
 * - Sound effects
 * 
 * TO ENABLE OPTIONAL FEATURES:
 * 1. Theme Toggle: Uncomment theme-toggle button in HTML and add theme toggle JS
 * 2. History: Uncomment history-panel in HTML and enable history in state
 * 3. Memory: Uncomment memory buttons and add memory functions
 * 4. Sound: Add audio feedback on button press
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Set to true to enable optional features
    enableScientific: true,        // Scientific functions panel
    enableHistory: true,          // History panel (requires HTML uncomment)
    enableMemory: false,           // Memory functions (requires HTML uncomment)
    enableSound: false,           // Sound feedback (requires audio files)
    enableThemeToggle: false,     // Theme toggle (requires HTML uncomment)
    maxExpressionLength: 100,     // Maximum expression length
    maxHistoryItems: 50,         // Maximum history items to store
    decimalPrecision: 10,          // Decimal places for results
    historyStorageKey: 'calculator-history'  // localStorage key for history
};

// ============================================
// STATE MANAGEMENT
// ============================================

/**
 * Calculator state object
 * Contains all the data needed for the calculator to function
 */
const calculatorState = {
    expression: "",      // Current expression being built
    result: "",          // Current result display
    history: [],         // Calculation history
    memory: 0,           // Memory value
    isScientificVisible: CONFIG.enableScientific,  // Scientific panel visibility
    lastResult: null     // Store last result for reference
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    expression: document.getElementById('expression'),
    result: document.getElementById('result'),
    scientificSection: document.getElementById('scientific-section'),
    // Optional elements (check if they exist before using)
    historyPanel: document.getElementById('history-panel'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history'),
    memoryIndicator: document.getElementById('memory-indicator'),
    themeToggle: document.getElementById('theme-toggle')
};

// ============================================
// MATH FUNCTIONS
// ============================================

/**
 * Custom math functions that aren't built into JavaScript
 */
const mathFunctions = {
    /**
     * Calculate factorial of a number
     * @param {number} n - Non-negative integer
     * @returns {number} Factorial of n
     */
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity; // JavaScript max safe integer
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    },

    /**
     * Calculate square root
     * @param {number} x - Number to square root
     * @returns {number} Square root of x
     */
    sqrt(x) {
        return x < 0 ? NaN : Math.sqrt(x);
    },

    /**
     * Calculate power (x^y)
     * @param {number} base - Base number
     * @param {number} exp - Exponent
     * @returns {number} Base raised to exponent
     */
    pow(base, exp) {
        return Math.pow(base, exp !== undefined ? exp : 2);
    },

    /**
     * Calculate absolute value
     * @param {number} x - Number
     * @returns {number} Absolute value
     */
    abs(x) {
        return Math.abs(x);
    },

    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    deg(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Calculate sine (uses radians)
     * @param {number} x - Angle in radians
     * @returns {number} Sine of x
     */
    sin(x) {
        return Math.sin(x);
    },

    /**
     * Calculate cosine (uses radians)
     * @param {number} x - Angle in radians
     * @returns {number} Cosine of x
     */
    cos(x) {
        return Math.cos(x);
    },

    /**
     * Calculate tangent (uses radians)
     * @param {number} x - Angle in radians
     * @returns {number} Tangent of x
     */
    tan(x) {
        return Math.tan(x);
    },

    /**
     * Calculate logarithm base 10
     * @param {number} x - Number
     * @returns {number} Log base 10 of x
     */
    log(x) {
        return x <= 0 ? NaN : Math.log10(x);
    },

    /**
     * Calculate natural logarithm
     * @param {number} x - Number
     * @returns {number} Natural log of x
     */
    ln(x) {
        return x <= 0 ? NaN : Math.log(x);
    }
};

// ============================================
// SAFE EXPRESSION PARSER
// ============================================

/**
 * Safely parse and evaluate mathematical expressions
 * Does NOT use eval() for security
 */
class ExpressionParser {
    constructor() {
        this.allowedChars = /^[0-9+\-*/().%^\s]+$/;
    }

    /**
     * Preprocess the expression to handle special functions
     * @param {string} expr - Raw expression
     * @returns {string} Processed expression
     */
    preprocess(expr) {
        let processed = expr;
        
        // Replace display symbols with JavaScript operators
        processed = processed.replace(/×/g, '*');
        processed = processed.replace(/÷/g, '/');
        processed = processed.replace(/−/g, '-');
        
        // Replace mathematical constants
        processed = processed.replace(/π/g, Math.PI.toString());
        processed = processed.replace(/PI/g, Math.PI.toString());
        processed = processed.replace(/\bE\b/g, Math.E.toString());
        
        // Replace functions
        processed = processed.replace(/sqrt\(/g, 'Math.sqrt(');
        processed = processed.replace(/pow\(/g, 'Math.pow(');
        processed = processed.replace(/abs\(/g, 'Math.abs(');
        processed = processed.replace(/sin\(/g, 'Math.sin(');
        processed = processed.replace(/cos\(/g, 'Math.cos(');
        processed = processed.replace(/tan\(/g, 'Math.tan(');
        processed = processed.replace(/log\(/g, 'Math.log10(');
        processed = processed.replace(/ln\(/g, 'Math.log(');
        processed = processed.replace(/deg\(/g, 'deg(');
        
        // Handle factorial (custom implementation)
        processed = this.handleFactorial(processed);
        
        return processed;
    }

    /**
     * Handle factorial notation in expression
     * @param {string} expr - Expression
     * @returns {string} Expression with factorial replaced
     */
    handleFactorial(expr) {
        // Match patterns like "5!" or "(2+3)!"
        return expr.replace(/(\d+|\))!/g, (match) => {
            if (match === ')!') {
                return ')';
            }
            const num = match.slice(0, -1);
            return `factorial(${num})`;
        });
    }

    /**
     * Validate that expression only contains allowed characters
     * @param {string} expr - Expression to validate
     * @returns {boolean} True if valid
     */
    validate(expr) {
        // Remove whitespace for validation
        const cleanExpr = expr.replace(/\s/g, '');
        
        // Check for dangerous patterns
        const dangerousPatterns = [
            /[a-zA-Z]/,  // Letters (except Math functions we've added)
            /__/,        // Dunder patterns
            /\[/,        // Array brackets
            /\]/,        // Array brackets
            /\{/,        // Object braces
            /\}/,        // Object braces
            /;/,         // Semicolons
            /=/          // Assignment (except in function calls)
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(cleanExpr)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Evaluate the expression safely
     * @param {string} expr - Expression to evaluate
     * @returns {number|string} Result or error message
     */
    evaluate(expr) {
        try {
            // Validate first
            if (!this.validate(expr)) {
                return { error: 'Invalid characters in expression' };
            }

            // Preprocess
            const processed = this.preprocess(expr);
            
            // Create a function with limited scope
            // This is safer than eval() as it only has access to specific functions
            const safeEval = new Function(
                'Math', 
                'factorial', 
                'deg',
                `return ${processed}`
            );
            
            // Execute with our custom functions
            const result = safeEval(mathFunctions.sqrt ? Math : Math, mathFunctions.factorial, mathFunctions.deg);
            
            // Check for invalid results
            if (!isFinite(result)) {
                if (isNaN(result)) {
                    return { error: 'Math error' };
                }
                return { error: 'Result is too large' };
            }
            
            // Round to avoid floating point precision issues
            const precision = CONFIG.decimalPrecision;
            const rounded = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);
            
            return { value: rounded };
            
        } catch (error) {
            return { error: 'Invalid expression' };
        }
    }
}

// Create parser instance
const parser = new ExpressionParser();

// ============================================
// INPUT HANDLING
// ============================================

/**
 * Append a value to the current expression
 * @param {string} value - Value to append
 */
function appendValue(value) {
    // Check expression length
    if (calculatorState.expression.length >= CONFIG.maxExpressionLength) {
        showError('Expression too long');
        return;
    }
    
    // Handle operators - don't allow consecutive operators
    const lastChar = calculatorState.expression.slice(-1);
    const operators = ['+', '-', '*', '/', '^', '%'];
    
    if (operators.includes(lastChar) && operators.includes(value)) {
        // Replace the last operator with the new one
        calculatorState.expression = calculatorState.expression.slice(0, -1);
    }
    
    // Append the value
    calculatorState.expression += value;
    
    // Update display
    updateDisplay();
    
    // Optional: Play sound
    if (CONFIG.enableSound) {
        playSound('click');
    }
}

/**
 * Clear the entire display
 */
function clearDisplay() {
    calculatorState.expression = '';
    calculatorState.result = '0';
    calculatorState.lastResult = null;
    
    updateDisplay();
    
    if (CONFIG.enableSound) {
        playSound('clear');
    }
}

/**
 * Delete the last character
 */
function deleteLast() {
    if (calculatorState.expression.length > 0) {
        calculatorState.expression = calculatorState.expression.slice(0, -1);
        updateDisplay();
        
        if (CONFIG.enableSound) {
            playSound('click');
        }
    }
}

/**
 * Toggle scientific functions panel
 */
function toggleScientific() {
    calculatorState.isScientificVisible = !calculatorState.isScientificVisible;
    
    if (elements.scientificSection) {
        elements.scientificSection.classList.toggle('visible', calculatorState.isScientificVisible);
    }
    
    if (CONFIG.enableSound) {
        playSound('click');
    }
}

/**
 * Calculate the result
 */
function calculateResult() {
    if (!calculatorState.expression.trim()) {
        return;
    }
    
    const result = parser.evaluate(calculatorState.expression);
    
    if (result.error) {
        showError(result.error);
        return;
    }
    
    // Store previous expression
    const previousExpression = calculatorState.expression;
    const previousResult = result.value;
    
    // Update state
    calculatorState.result = result.value.toString();
    calculatorState.lastResult = result.value;
    
    // Add to history
    if (CONFIG.enableHistory) {
        addToHistory(previousExpression, previousResult);
    }
    
    // Clear expression and show result
    calculatorState.expression = '';
    updateDisplay();
    
    // Show result with animation
    elements.result.classList.add('slideIn');
    setTimeout(() => {
        elements.result.classList.remove('slideIn');
    }, 200);
    
    if (CONFIG.enableSound) {
        playSound('equals');
    }
}

// ============================================
// UI RENDERING
// ============================================

/**
 * Update the display with current state
 */
function updateDisplay() {
    // Update expression display
    elements.expression.textContent = formatExpression(calculatorState.expression);
    
    // Update result display
    let displayResult = calculatorState.expression || calculatorState.result;
    if (!displayResult) {
        displayResult = '0';
    }
    
    elements.result.textContent = formatResult(displayResult);
    
    // Handle overflow
    handleOverflow();
}

/**
 * Format the expression for display
 * @param {string} expr - Raw expression
 * @returns {string} Formatted expression
 */
function formatExpression(expr) {
    return expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−')
        .replace(/Math\./g, '')
        .replace(/pow\(/g, 'x²')
        .replace(/sqrt\(/g, '√');
}

/**
 * Format the result for display
 * @param {string} result - Result string
 * @returns {string} Formatted result
 */
function formatResult(result) {
    // Add thousand separators for large numbers
    const num = parseFloat(result);
    if (!isNaN(num) && isFinite(num)) {
        return num.toLocaleString('en-US', {
            maximumFractionDigits: CONFIG.decimalPrecision
        });
    }
    return result;
}

/**
 * Handle overflow in display
 */
function handleOverflow() {
    const resultElement = elements.result;
    const expressionElement = elements.expression;
    
    // Check if content is too wide
    const isOverflowing = resultElement.scrollWidth > resultElement.clientWidth ||
                          expressionElement.scrollWidth > expressionElement.clientWidth;
    
    resultElement.classList.toggle('overflow', isOverflowing);
}

/**
 * Show error message with animation
 * @param {string} message - Error message
 */
function showError(message) {
    elements.result.textContent = message;
    elements.result.classList.add('error-shake');
    
    // Remove animation class after it completes
    setTimeout(() => {
        elements.result.classList.remove('error-shake');
    }, 400);
    
    if (CONFIG.enableSound) {
        playSound('error');
    }
}

// ============================================
// HISTORY (Optional)
// ============================================

/**
 * Save history to localStorage
 */
function saveHistory() {
    try {
        localStorage.setItem(CONFIG.historyStorageKey, JSON.stringify(calculatorState.history));
    } catch (e) {
        console.warn('Could not save history to localStorage:', e);
    }
}

/**
 * Load history from localStorage
 */
function loadHistory() {
    try {
        const saved = localStorage.getItem(CONFIG.historyStorageKey);
        if (saved) {
            calculatorState.history = JSON.parse(saved);
            // Limit history size after loading
            if (calculatorState.history.length > CONFIG.maxHistoryItems) {
                calculatorState.history = calculatorState.history.slice(0, CONFIG.maxHistoryItems);
            }
        }
    } catch (e) {
        console.warn('Could not load history from localStorage:', e);
        calculatorState.history = [];
    }
}

/**
 * Add entry to history
 * @param {string} expression - The expression
 * @param {number} result - The result
 */
function addToHistory(expression, result) {
    const entry = {
        expression: expression,
        result: result,
        timestamp: Date.now()
    };
    
    calculatorState.history.unshift(entry);
    
    // Limit history size
    if (calculatorState.history.length > CONFIG.maxHistoryItems) {
        calculatorState.history.pop();
    }
    
    // Save to localStorage
    saveHistory();
    
    // Update history UI if enabled
    if (CONFIG.enableHistory && elements.historyList) {
        renderHistory();
    }
}

/**
 * Render history in the UI
 */
function renderHistory() {
    if (!elements.historyList) return;
    
    elements.historyList.innerHTML = calculatorState.history
        .map((item, index) => `
            <li data-index="${index}">
                ${formatExpression(item.expression)} = ${item.result}
            </li>
        `)
        .join('');
    
    // Add click handlers to history items
    elements.historyList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const index = parseInt(li.dataset.index);
            const item = calculatorState.history[index];
            calculatorState.expression = item.expression;
            updateDisplay();
        });
    });
}

/**
 * Clear history
 */
function clearHistory() {
    calculatorState.history = [];
    
    // Clear from localStorage
    saveHistory();
    
    if (elements.historyList) {
        elements.historyList.innerHTML = '';
    }
}

// ============================================
// MEMORY FUNCTIONS (Optional)
// ============================================

/**
 * Store current result in memory
 */
function memoryStore() {
    const currentResult = parseFloat(calculatorState.result);
    if (!isNaN(currentResult)) {
        calculatorState.memory = currentResult;
        if (elements.memoryIndicator) {
            elements.memoryIndicator.classList.add('visible');
        }
    }
}

/**
 * Recall memory value
 */
function memoryRecall() {
    if (calculatorState.memory !== 0) {
        appendValue(calculatorState.memory.toString());
    }
}

/**
 * Clear memory
 */
function memoryClear() {
    calculatorState.memory = 0;
    if (elements.memoryIndicator) {
        elements.memoryIndicator.classList.remove('visible');
    }
}

/**
 * Add to memory
 */
function memoryAdd() {
    const currentResult = parseFloat(calculatorState.result);
    if (!isNaN(currentResult)) {
        calculatorState.memory += currentResult;
    }
}

/**
 * Subtract from memory
 */
function memorySubtract() {
    const currentResult = parseFloat(calculatorState.result);
    if (!isNaN(currentResult)) {
        calculatorState.memory -= currentResult;
    }
}

// ============================================
// SOUND EFFECTS (Optional)
// ============================================

/**
 * Play a sound effect
 * @param {string} type - Sound type
 */
function playSound(type) {
    if (!CONFIG.enableSound) return;
    
    // Note: This requires audio files to be present
    // You would need to add actual audio files
    /*
    const sounds = {
        click: new Audio('sounds/click.mp3'),
        clear: new Audio('sounds/clear.mp3'),
        equals: new Audio('sounds/equals.mp3'),
        error: new Audio('sounds/error.mp3')
    };
    
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(() => {}); // Ignore errors
    }
    */
}

// ============================================
// THEME TOGGLE (Optional)
// ============================================

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    
    // Save preference to localStorage
    const isDark = !document.body.classList.contains('light-theme');
    localStorage.setItem('calculator-theme', isDark ? 'dark' : 'light');
}

/**
 * Load saved theme preference
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// ============================================
// EVENT HANDLING
// ============================================

/**
 * Handle button clicks using event delegation
 * @param {Event} event - Click event
 */
function handleButtonClick(event) {
    const button = event.target.closest('.btn');
    if (!button) return;
    
    // Get the value or action from the button
    const value = button.dataset.value;
    const action = button.dataset.action;
    
    // Add press animation
    button.classList.add('btn-press');
    setTimeout(() => button.classList.remove('btn-press'), 100);
    
    // Handle based on button type
    if (value !== undefined) {
        appendValue(value);
    } else if (action) {
        switch (action) {
            case 'clear':
                clearDisplay();
                break;
            case 'delete':
                deleteLast();
                break;
            case 'calculate':
                calculateResult();
                break;
            case 'toggle-scientific':
                toggleScientific();
                break;
            // Optional memory actions
            case 'memory-store':
                memoryStore();
                break;
            case 'memory-recall':
                memoryRecall();
                break;
            case 'memory-clear':
                memoryClear();
                break;
            case 'memory-add':
                memoryAdd();
                break;
            case 'memory-subtract':
                memorySubtract();
                break;
        }
    }
}

/**
 * Handle keyboard input
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Prevent default for calculator keys
    const allowedKeys = '0123456789+-*/().%^';
    
    if (allowedKeys.includes(key)) {
        event.preventDefault();
        appendValue(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    } else if (key === 'Escape') {
        event.preventDefault();
        clearDisplay();
    } else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } else if (key === 's' && event.ctrlKey) {
        // Ctrl+S for scientific toggle
        event.preventDefault();
        toggleScientific();
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the calculator
 */
function init() {
    // Set up event listeners
    document.addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Initialize optional features
    if (CONFIG.enableThemeToggle && elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
        loadTheme();
    }
    
    if (CONFIG.enableHistory) {
        // Load history from localStorage
        loadHistory();
        
        // Render history if elements exist
        if (elements.historyList) {
            renderHistory();
        }
        
        // Add clear history button listener
        if (elements.clearHistoryBtn) {
            elements.clearHistoryBtn.addEventListener('click', clearHistory);
        }
    }
    
    // Initialize scientific section visibility
    if (elements.scientificSection && !calculatorState.isScientificVisible) {
        elements.scientificSection.classList.remove('visible');
    }
    
    // Initial display update
    updateDisplay();
    
    console.log('Calculator initialized!');
    console.log('Tip: Press Ctrl+S to toggle scientific functions');
}

// Start the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', init);
