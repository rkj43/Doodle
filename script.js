//credits: https://stackoverflow.com/questions/39050460/drawing-on-canvas-using-touchscreen-devices
/*~~~~~~~~~~~~~~~~~~~~~ Doodlepad code starts here~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var canvas, ctx;

// Variables to keep track of the mouse position and left-button status 
var mouseX, mouseY, mouseDown = 0;

// Variables to keep track of the touch position
var touchX, touchY;
var doodlePenSize = 10; // Change this to change the size of the doodle pen

// Draws a dot at a specific position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function drawDot(ctx, x, y, size) {
    // Settings values for black dot and alpha value 255 for opaque
    //Credit: https://rgbacolorpicker.com/
    r = 0;
    g = 0;
    b = 0;
    a = 255;

    // Select a fill style
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";

    // Draw a filled circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// Clear the canvas context using the canvas width and height
function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Keep track of the mouse button being pressed and draw a dot at current location
function doodlepad_mouseDown() {
    mouseDown = 1;
    drawDot(ctx, mouseX, mouseY, doodlePenSize);
}

// Keep track of the mouse button being released
function doodlepad_mouseUp() {
    mouseDown = 0;
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function doodlepad_mouseMove(e) {
    // Update the mouse co-ordinates when moved
    getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (mouseDown == 1) {
        drawDot(ctx, mouseX, mouseY, doodlePenSize);
    }
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    } else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
}

// Draw something when a touch start is detected
function doodlepad_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    drawDot(ctx, touchX, touchY, 12);

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

// Draw something and prevent the default scrolling when touch movement is detected
function doodlepad_touchMove(e) {
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    drawDot(ctx, touchX, touchY, 12);

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if (e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX = touch.pageX - touch.target.offsetLeft;
            touchY = touch.pageY - touch.target.offsetTop;
        }
    }
}


// Set-up the canvas and add our event handlers after the page has loaded
function init() {
    // Get the specific canvas element from the HTML document
    canvas = document.getElementById('doodlepad');

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    // Check that we have a valid context to draw on/with before adding event handlers
    if (ctx) {
        // React to mouse events on the canvas, and mouseup on the entire document
        canvas.addEventListener('mousedown', doodlepad_mouseDown, false);
        canvas.addEventListener('mousemove', doodlepad_mouseMove, false);
        window.addEventListener('mouseup', doodlepad_mouseUp, false);

        // React to touch events on the canvas
        canvas.addEventListener('touchstart', doodlepad_touchStart, false);
        canvas.addEventListener('touchmove', doodlepad_touchMove, false);
    }
}

/*~~~~~~~~~~~~~~~~~~~~~ Doodlepad code ends here~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*~~~~~~~~~~~~~~~~~~~~~ The below code is for tesseract implementation~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//JavaScript Promises In 10 Minutes:
//https://www.youtube.com/watch?v=DHvZLI7Db8E
// get the recognize button  
const recognize = document.getElementById('recognize');
//get the h4 element where we will display final output
const resultHeader = document.querySelector('h4');
// Start text recognition on click of the recognize button 
recognize.onclick = () => {
    //Select the canvas using its ID    
    var canvasimage = document.querySelector('#doodlepad');
    const progress = document.querySelector('.progress');
    //convert canvas element to DataURL
    //documentation : https://github.com/naptha/tesseract.js/blob/master/docs/image-format.md
    //Tesseract.js's recognize() method accepts image as a parameter.
    //The accepted formats include image,file,blob,string with base64 encoded image(which is basically the dataURL) and Canvas
    //I misread the documentation at first so the below line is not needed, we can directly pass canvasimage! but still leaving it here
    // As it is a good example of different formats we can pass through Recognize
    var dataURI = canvasimage.toDataURL();
    resultHeader.innerHTML = '';
    //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#worker-recognize documentation
    // View the old version of the documentation by clicking the history button and viewing the 2019 version.
    const rec = new Tesseract.TesseractWorker();
    rec.recognize(dataURI) //rec.recognize(canvasimage) also works...
    .progress(function (response) {
        if(response.status == 'recognizing text'){
            progress.innerHTML = response.status + '   ' + response.progress
        }else{
            progress.innerHTML = response.status
        }
    })    
    .then(function(data) {
            console.log(data);
            data.text === '' ? resultHeader.innerHTML = "Recognition failed. Hmmm it couldn't handle the awesomeness of your doodle! ( but on a serious note check logs)" : resultHeader.innerHTML = "The doodle has been recognized as: " + data.text;
        });
}