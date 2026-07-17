const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const coordsDisplay = document.getElementById('coords');
const palette = document.getElementById('palette');
const color1Preview = document.getElementById('color1-preview');
const lineWidthSelect = document.getElementById('line-width');

// State Variables
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let snapshot = null;

// Initial Canvas Background Setup
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = currentColor; // Reset back

// Track Mouse Movement for Status Bar Coords
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    coordsDisplay.textContent = `📍 ${x}, ${y}px`;
});

// Tool Selection Mechanism
document.querySelectorAll('.tool-btn, .shape-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from everywhere
        document.querySelectorAll('.tool-btn, .shape-btn').forEach(b => b.classList.remove('active'));
        
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool') || btn.getAttribute('data-shape');
    });
});

// Color Picker Setup
palette.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-item')) {
        currentColor = e.target.getAttribute('data-color');
        color1Preview.style.background = currentColor;
    }
});

// Drawing Engine Rules
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.lineWidth = lineWidthSelect.value;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;

    if (currentTool === 'pencil') {
        ctx.moveTo(startX, startY);
    }
    // Take snapshot for perfect shapes
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (currentTool === 'pencil') {
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff'; // White for eraser
        ctx.lineWidth = 20; // Hardcoded thick brush for quick erasing
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else {
        // Shapes rendering (Restores previous snapshot so shapes draw cleanly)
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        
        if (currentTool === 'line') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
        } else if (currentTool === 'rectangle') {
            ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
        } else if (currentTool === 'circle') {
            let radius = Math.sqrt(Math.pow(startX - currentX, 2) + Math.pow(startY - currentY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (currentTool === 'triangle') {
            ctx.moveTo(startX + (currentX - startX) / 2, startY);
            ctx.lineTo(startX, currentY);
            ctx.lineTo(currentX, currentY);
            ctx.closePath();
            ctx.stroke();
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Simple Fill Tool Implementation (Bucket)
canvas.addEventListener('click', (e) => {
    if (currentTool === 'bucket') {
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.floor(e.clientX - rect.left);
        const clickY = Math.floor(e.clientY - rect.top);
        
        // Simple canvas overlay filling for ease of design
        ctx.fillStyle = currentColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});
