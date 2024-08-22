const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let painting = false;
let currentColor = 'black';
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

    ctx.lineWidth = 5;
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
