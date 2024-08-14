const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext('2d');
const clear = document.getElementById("Clear");
const download = document.getElementById("Download");
const retrieve = document.getElementById("Retrieve");
const textColorPicker = document.getElementById("colorpicker");
const bgColorPicker = document.getElementById("Bgpicker");
const fontpicker = document.getElementById("fontsize");

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

ctx.lineWidth = parseInt(fontpicker.value);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

textColorPicker.addEventListener("change", (e) => {
    ctx.strokeStyle = e.target.value;
});

bgColorPicker.addEventListener("change", (e) => {
    canvas.style.backgroundColor = e.target.value;
});

fontpicker.addEventListener("change", (e) => {
    ctx.lineWidth = parseInt(e.target.value);
});

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

function stopDrawing() {
    isDrawing = false;
}

function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
      // Store the drawing action
      drawingActions.push({
        type: 'line',
        startX: lastX,
        startY: lastY,
        endX: x,
        endY: y,
        color: ctx.strokeStyle,
        lineWidth: ctx.lineWidth
    });
    [lastX, lastY] = [x, y];
}

function getCoordinates(e) {
    let x, y;
    if (e.type.includes('mouse')) {
        x = e.offsetX;
        y = e.offsetY;
    } else {
        const rect = canvas.getBoundingClientRect();
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    }
    return [x, y];
}

// Mouse events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Touch events
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrawing(e);
}, { passive: false });
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e);
}, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

clear.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawingActions = []; 
});

download.addEventListener("click", () => {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = canvas.style.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    localStorage.setItem('canvasContents', canvas.toDataURL());
    let link = document.createElement('a');
    link.download = "my-canvas.png";
    link.href = canvas.toDataURL();
    link.click();

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

retrieve.addEventListener("click", () => {
    let saveData = localStorage.getItem('canvasContents');
    if (saveData) {
        let img = new Image();
        img.src = saveData;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }
});

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });


let drawingActions = [];
let animationIndex = 0;
let isAnimating = false;

function animateSignature() {
    if (animationIndex >= drawingActions.length) {
        isAnimating = false;
        return;
    }

    const action = drawingActions[animationIndex];
    ctx.beginPath();
    ctx.moveTo(action.startX, action.startY);
    ctx.lineTo(action.endX, action.endY);
    ctx.strokeStyle = action.color;
    ctx.lineWidth = action.lineWidth;
    ctx.stroke();

    animationIndex++;
    requestAnimationFrame(animateSignature);
}
const animateButton = document.getElementById("animate");

animateButton.addEventListener("click", () => {
    if (isAnimating) return;
    
    isAnimating = true;
    animationIndex = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animateSignature();
});