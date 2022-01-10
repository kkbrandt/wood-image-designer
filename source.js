 ///////////////////////// CONSTANTS /////////////////////////////////
 var BirchColor = [169, 108, 53];
 var CherryColor = [177, 130, 99];
 var MapleColor = [202, 183, 162];
 var WalnutColor = [76, 45, 36];
 var PadaukColor = [89, 16, 0];
 var WengeColor = [46, 22, 11];
 var ColorPalette = [MapleColor];

 var ColorMap = {'birch': BirchColor, 'cherry': CherryColor, 'maple': MapleColor, 'walnut': WalnutColor, 'padauk': PadaukColor, 'wenge': WengeColor};

 console.log('wtf');
 var inputImage = new Image();
 function OnLoad() {
    // Image Selection: Result is stored in variable "rgbArray".
    const image_input = document.getElementById("image_input");
    image_input.addEventListener("change", function () {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        let result = reader.result;
        inputImage.src = result;
        document.querySelector("#display_image").style.backgroundImage = `url(${reader.result})`;
        inputImage.onload = LoadNewInput;
    });
    reader.readAsDataURL(this.files[0]);
    });
    console.log('wtf2');
    $('#board_color').change(updateBoard);
    $('#board_size').change(updateBoard);
    console.log('wtf3');
}

 function loadFilters() {
     console.log('loadFilters');
     let blur = document.getElementById('blur'),
         brightness = document.getElementById('brightness'),
         contrast = document.getElementById('contrast');

     let canvas = document.getElementById('display_input');
     let context = canvas.getContext('2d');
     context.filter = `blur(${$('#blur').val()}px) brightness(${brightness.value}%) contrast(${contrast.value}%)`
     context.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);
     ReloadRGBArray();
 }


 function LoadNewInput() {
     let canvas = document.getElementById('display_input');
     canvas.width = inputImage.width;
     canvas.height = inputImage.height;
     var context = canvas.getContext('2d')
     context.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);
     ReloadRGBArray();
 }

 function BlurImage(pixels) {
     let canvas = document.getElementById('display_input');
     let context = canvas.getContext('2d');
     context.filter = `blur(${pixels}px)`;
     context.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);
     ReloadRGBArray();
 }

 function ReloadRGBArray() {
     let canvas = document.getElementById('display_input');
     let context = canvas.getContext('2d')
     var data = context.getImageData(0, 0, inputImage.width, inputImage.height).data;
     // Convert to rgb values for every pixel
     rgbArray = []
     for (var px = 0; px < data.length; px+=4) {
             rgbArray.push([data[px], data[px+1], data[px+2]-10]);
     }
 }
 var result = [];

function findClosestMatch(pixel) { 
    let closestColor = [];
    let closestDistance = 1000;
    ColorPalette.forEach(color => {
        let distance = deltaE(pixel, color);
        if (distance < closestDistance) {
        closestColor = color; 
        closestDistance = distance;
        }
    });
    return closestColor;
}

function updateBoard() {
    let size_map = {'12x14': {height: 12, width: 14}, '12x16': {height: 12, width: 16}, '12x18': {height: 12, width: 18}};
    let dimensions = size_map[$('#board_size').val()];
    $('#board_canvas').width(dimensions.width*50).height(dimensions.height*50);
    let canvas = document.getElementById("board_canvas");
    let ctx = canvas.getContext("2d");
    let color = ColorMap[$('#board_color').val()]
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function CalculateResult() {
    ColorPalette = [];
    if ($('#maple').is(":checked")) ColorPalette.push(MapleColor);
    if ($('#birch').is(":checked")) ColorPalette.push(BirchColor);
    if ($('#cherry').is(":checked")) ColorPalette.push(CherryColor);
    if ($('#walnut').is(":checked")) ColorPalette.push(WalnutColor);
    if ($('#padauk').is(":checked")) ColorPalette.push(PadaukColor);
    if ($('#wenge').is(":checked")) ColorPalette.push(WengeColor);
    result = [];
    rgbArray.forEach(pixel => {
        result.push(findClosestMatch(pixel));
    });
    DisplayResult();
}
function DisplayResult() {
    var arr = new Uint8ClampedArray(result.length*4);
    for (var i = 0; i < result.length; i++) {
        arr[i*4] = result[i][0];
        arr[i*4+1] = result[i][1];
        arr[i*4+2] = result[i][2];
        arr[i*4+3] = 255;
    }
    let canvas = document.getElementById('display_input');
    canvas.width = inputImage.width;
    canvas.height = inputImage.height;
    var context = canvas.getContext('2d')
    context.putImageData(new ImageData(arr, canvas.width), 0, 0);

    let board_canvas = document.getElementById("board_canvas");
    let ctx = board_canvas.getContext("2d");
    let inlay = new Image();
    inlay.src = document.getElementById('display_input').toDataURL();
    ctx.drawImage(inlay, board_canvas.width*0.125, board_canvas.height*0.125, board_canvas.width*0.75, board_canvas.height*0.75);
    // ctx.putImageData(new ImageData(arr, canvas.width), board_canvas.width*0.125, board_canvas.height*0.125, 0, 0, board_canvas.width*0.75, board_canvas.height*0.75);
}
function DownloadImage() {
    // Convert canvas to image
    document.getElementById('btn-download').addEventListener("click", function(e) {
        var canvas = document.querySelector('#display_input');

        var dataURL = canvas.toDataURL("image/jpeg", 1.0);

        downloadImage(dataURL, 'my-canvas.jpeg');
    });

    // Save | Download image
    function downloadImage(data, filename = 'untitled.jpeg') {
        var a = document.createElement('a');
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    }
}