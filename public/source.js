///////////////////////// CONSTANTS ///////////////////////////////
const BirchColor = [169, 108, 53];
const CherryColor = [177, 130, 99];
const MapleColor = [202, 183, 162];
const WalnutColor = [76, 45, 36];
const PadaukColor = [89, 16, 0];
const WengeColor = [46, 22, 11];
const ColorMap = {'birch': BirchColor, 'cherry': CherryColor, 'maple': MapleColor, 'walnut': WalnutColor, 'padauk': PadaukColor, 'wenge': WengeColor};

const reader = new FileReader();

////////////////////////// GLOBALS ////////////////////////////////
var ColorPalette = [MapleColor];
var inputImage = new Image();
var result = [];

////////////////////////// FUNCTIONS //////////////////////////////
function OnLoad() {
    // Register extra event handlers here
}

function GetContext() {
    return document.getElementById('display_input').getContext('2d');
}

function ReadNewInput() {
    reader.addEventListener("load", () => {
        let result = reader.result;
        inputImage.src = result;
        document.querySelector("#display_image").style.backgroundImage = `url(${reader.result})`;
        inputImage.onload = LoadNewInput;
    });
    reader.readAsDataURL(document.getElementById("image_input").files[0]);
}

function LoadNewInput() {
    let canvas = document.getElementById('display_input');
    canvas.width = inputImage.width;
    canvas.height = inputImage.height;
    var context = canvas.getContext('2d')
    context.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);
    ReloadRGBArray();
}

function ReloadRGBArray() {
    var data = GetContext().getImageData(0, 0, inputImage.width, inputImage.height).data;
    // Convert to rgb values for every pixel
    rgbArray = []
    for (var px = 0; px < data.length; px+=4) {
            rgbArray.push([data[px], data[px+1], data[px+2]-10]);
    }
}

function loadFilters() {
    console.log('loadFilters');
    let blur = document.getElementById('blur'),
        brightness = document.getElementById('brightness'),
        contrast = document.getElementById('contrast');

    GetContext().filter = `blur(${$('#blur').val()}px) brightness(${brightness.value}%) contrast(${contrast.value}%)`
    GetContext().drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);
    ReloadRGBArray();
}

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

function UpdateBoard() {
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

}
function DownloadImage() {
    console.log('DownloadImage');
    // Convert canvas to image
    var canvas = document.querySelector('#display_input');
    var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    downloadImage(dataURL, 'my-design.jpeg');

    // Save | Download image
    function downloadImage(data, filename = 'untitled.jpeg') {
        var a = document.createElement('a');
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    }
}