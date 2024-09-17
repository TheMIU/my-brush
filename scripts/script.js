const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let painting = false;
let currentColor = '#ff0000';
let currentBrushSize = 5;  // Initialize brush size
let undoStack = [];
let redoStack = [];

function startPosition(e) {
    // Only start drawing if the left mouse button (button 0) is clicked
    if (e.button === 0) {
        painting = true;
        saveState(undoStack); // Save the state only for left-click actions
        draw(e); // Call the draw function immediately after saving state
    }
}

function endPosition() {
    if (painting) {
        painting = false;
        ctx.beginPath();
    }
}

function draw(e) {
    // Check if the left mouse button is pressed (button === 0)
    if (e.buttons !== 1) return; // e.buttons indicates which buttons are being pressed (1 = left)

    if (!painting) return;

    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    // Get the coordinates of the mouse relative to the canvas
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();

    // Start a new path for smooth drawing
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function setColor(color) {
    currentColor = color;
}

function setBrushSize(size) {
    currentBrushSize = size;  // Update brush size
    document.getElementById('brushSizeValue').textContent = size;  // Update displayed size value
}

function clearCanvas() {
    saveState(undoStack, redoStack);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveState(undoStack, redoStack, keepRedo = false) {
    if (!keepRedo) {
        redoStack = 0;
    }
    undoStack.push(canvas.toDataURL());
}

function undo() {
    restoreState(undoStack, redoStack);
}

function redo() {
    restoreState(redoStack, undoStack);
}

function restoreState(popStack, pushStack) {
    if (popStack.length) {
        saveState(pushStack, popStack, true);
        const restoreState = popStack.pop();
        const img = new Image();
        img.src = restoreState;
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// Add key bindings for Ctrl+Z (undo) and Ctrl+Shift+Z (redo)
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    } else if (e.ctrlKey && e.key === 'Z' && e.shiftKey) {
        e.preventDefault();
        redo();
    }
});

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

////  Drawing tab input
canvas.addEventListener('pointerdown', startPosition);
canvas.addEventListener('pointerup', endPosition);
canvas.addEventListener('pointermove', draw);

// Prevent default touch actions for better pen support (like scrolling)
canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false });

/////////////////////////////////
// Initialize the iro.js color wheel
let colorPicker = new iro.ColorPicker("#colorWheel", {
    width: 200,
    color: "#ff0000", // Initial color
    borderWidth: 1,
    borderColor: "#fff",
    layout: [
        {
            component: iro.ui.Wheel, // The color wheel
            options: {
                width: 200
            }
        },
        {
            component: iro.ui.Slider, // A slider to adjust the hue
            options: {
                sliderType: 'hue',
                width: 200
            }
        },
        {
            component: iro.ui.Slider, // A slider to adjust saturation
            options: {
                sliderType: 'saturation',
                width: 200
            }
        },
        {
            component: iro.ui.Slider, // A slider to adjust brightness
            options: {
                sliderType: 'value', // value represents brightness in iro.js
                width: 200
            }
        }
    ]
});


// Update the drawing color when the color wheel changes
colorPicker.on('color:change', function (color) {
    setColor(color.hexString);
});

/////////////////////////////////


/////////////////////////////////
const toggleBtn = document.getElementById('toggleToolsBtn');
const topBar = document.querySelector('.topBar');
const toolbar = document.querySelector('.toolbar');
let isOpen = false;

toggleBtn.addEventListener('click', () => {
    // Toggle rotation
    if (isOpen) {
        toggleBtn.style.transform = 'rotate(0deg)';
    } else {
        toggleBtn.style.transform = 'rotate(135deg)';
    }
    isOpen = !isOpen;

    // Toggle visibility of topBar and toolbar
    topBar.style.display = isOpen ? 'flex' : 'none';
    toolbar.style.display = isOpen ? 'block' : 'none';
});

/////////////////////////////////
// Export
function exportAsPNG() {
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportAsJPG() {
    // Create a temporary canvas to add a background color
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Set the canvas size to match the original canvas
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill the background with white or any other color
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas on top of the background
    tempCtx.drawImage(canvas, 0, 0);

    // Create the download link
    const link = document.createElement('a');
    link.download = 'canvas-drawing.jpg';
    link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
    link.click();
}
