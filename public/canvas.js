// const { Socket } = require("engine.io");

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");


let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraseWidth = eraserWidthElem.value;

let undoRedoTracker = [];

let track = 0; //represent which action from tracker array

let mouseDown = false;
// API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mouse down -> start new path
// mouse move -> fill color

canvas.addEventListener("mousedown"  ,(e) => {
    mouseDown = true;
    // beginPath({
    //     x : e.clientX,
    //     y : e.clientY
    // })
    let data = {
        x: e.clientX ,
        y: e.clientY 
    }
    // send data to server
    socket.emit("beginPath" , data);
})
canvas.addEventListener("mousemove" , (e) => {
    if(mouseDown) {
        let data = {
            x : e.clientX,
            y : e.clientY,
            color : eraserFlag ? eraserColor : penColor,
            width : eraserFlag ? eraseWidth : penWidth
        }
        socket.emit("drawStroke" , data);
    }
     
})

canvas.addEventListener("mouseup" , (e) => {
    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

undo.addEventListener("click" , (e) => {
   if(track > 0) track--;

   let data = {
    trackValue : track,
    undoRedoTracker
    }
    socket.emit("redoUndo" , data);

})

redo.addEventListener("click" , (e) => {
   if(track < undoRedoTracker.length-1) track++;
   //action
   let data = {
      trackValue : track,
      undoRedoTracker
      }
  socket.emit("redoUndo" , data);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;
    
    let url = undoRedoTracker[track];
    let img = new Image(); //new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.clearRect(0 ,0 , canvas.width  , canvas.height);
        tool.drawImage(img , 0 ,0 , canvas.width , canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x , strokeObj.y);
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x , strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click" , (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change" , (e) => {
   penWidth = pencilWidthElem.value;
   tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change" , (e) => {
   eraseWidth = eraserWidthElem.value;
   tool.lineWidth = eraseWidth;
})

eraser.addEventListener("click" , (e) => {
    if(eraserFlag){
       tool.strokeStyle = eraserColor;
       tool.lineWidth = eraseWidth
    }else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click" , (e) => {
   let url = canvas.toDataURL();


    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})


socket.on("beginPath" , (data) => {
  //data from server
  beginPath(data);
})

socket.on("drawStroke" , (data) => {
  //data from server
  drawStroke(data);
})

socket.on("redoUndo" , (data) => {
  //data from server
  undoRedoCanvas(data);
})












// tool.beginPath();  //new graphic path
// tool.moveTo(10,10); //start point
// tool.lineTo(100,150); //end point
// tool.stroke(); // fill graphic

// tool.strokeStyle = "red";
// tool.beginPath();  //start new path otherwise continue from prev point
// tool.moveTo(10,10);

// tool.lineTo(200,250); //end point 
// tool.stroke(); // fill graphic


