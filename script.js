const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let painting = false;
let currentColor = '#000000';
let currentBrushSize = 5;  // Initialize brush size
let undoStack = [];
let redoStack = [];

function startPosition(e) {
    painting = true;
    saveState(undoStack, redoStack);
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
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
        redoStack.length = 0;
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
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

/////////////////////////////////
// Initialize the iro.js color wheel
let colorPicker = new iro.ColorPicker("#colorWheel", {
    width: 150,
    color: "#000000", // Initial color
    borderWidth: 1,
    borderColor: "#fff"
});

// Update the drawing color when the color wheel changes
colorPicker.on('color:change', function (color) {
    setColor(color.hexString);
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
