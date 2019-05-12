/**
 * Hatter (http://www.silvermods.com/Hatter)
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License.
 * https://creativecommons.org/licenses/by/3.0/
 */


 // Page load
 $(function() {
   "use strict";

   // Set feature background image based on time of day.
   var time = new Date().getHours(), path;
   path = time >= 18 || time < 6 ? "imgs/bgNight.jpg" : "imgs/bgDay2.jpg";
   document.getElementById("featureBackground").style.backgroundImage = "url('" + path +  "')";
 });

function colorToHex(color) {
  var colors = [];
  colors.push(digitToHex(color[0]));
  colors.push(digitToHex(color[1]));
  colors.push(digitToHex(color[2]));
  colors.push(digitToHex(color[3]));
  if (colors[3] === 'ff') { delete colors[3] }

  const long = colors.some((s) => s[0] !== s[1]);
  return long ? colors.join('') : `${colors[0][0]}${colors[1][0]}${colors[2][0]}${colors[3] ? colors[3][0] : ''}`;
}

function digitToHex(digit) {
  const h = Number(digit).toString(16);
  return h.length === 1 ? `0${h}` : h;
}

var drawableImage, imageCharacter, imageHair, previousHeight = 172;
var autoCropFrame = false;

/**
 * On load
 */
$(function() {
  loadFeatureLogo();

  // Bind select image
  $("#btnSelectImage").click(function() {
    $("#selectImage").trigger("click");
  });

  $("#selectImage").change(function() {
    drawableImage = null;
    readDrawableInput(this, drawableLoaded);
    this.value = "";
  });

  // Bind generate output
  $("#btnPlainText").click(generatePlainText);
  $("#btnCommand").click(generateCommand);

  // Load preview
  imageCharacter = new Image();
  imageCharacter.onload = function() {
    drawResizedImage($("#cvsPreviewCharacter").get(0), imageCharacter, 4);
  };
  imageCharacter.src = "imgs/hatterCharacter.png";

  imageHair = new Image();
  imageHair.onload = function() {
    drawResizedImage($("#cvsPreviewHair").get(0), imageHair, 4);
  };
  imageHair.src = "imgs/hatterHair.png";

  let checkMask = $("#checkMask")[0];
  let checkHideBody = $("#checkHideBody")[0];
  let canvasHair = $("#cvsPreviewHair");
  let canvasBody = $("#cvsPreviewCharacter");

  // Bind hair mask
  $(checkMask).change(function() {
    if (checkMask.checked) {
      canvasHair.fadeOut(100);
    } else if (!checkHideBody.checked) {
      canvasHair.fadeIn(100);
    }
  });

  // Bind hide body
  $(checkHideBody).change(function() {
    if (this.checked) {
      canvasBody.fadeOut(100);
      canvasHair.fadeOut(100);
    } else {
      canvasBody.fadeIn(100);
      if (!checkMask.checked) canvasHair.fadeIn(100);
    }
  });
});

/**
 * Loads and draws the hat icon in the jumbotron feature.
 * Should be called on page load.
 */
function loadFeatureLogo() {
  var canvas = $("#logoHat").get(0);
  var canvasContext = canvas.getContext('2d');

  var image = new Image();
  image.onload = function() {
    canvas.setAttribute("width", image.width * 3 + 2);
    canvas.setAttribute("height", image.height * 3 + 2);

    canvasContext.mozImageSmoothingEnabled = false;
    canvasContext.msImageSmoothingEnabled = false;
    canvasContext.imageSmoothingEnabled = false;
    canvasContext.shadowColor = "#000";
    canvasContext.shadowBlur = 2;
    canvasContext.shadowOffsetX = 1;
    canvasContext.shadowOffsetY = 1;
    canvasContext.drawImage(image, 0, 0, image.width * 3, image.height * 3);
  };

  image.src = "imgs/hat.png";
}

/**
 * Validates the current image selection.
 * @param {boolean} alertUser - Value indicating whether the user should be alerted if there's no drawable selected.
 * @returns {boolean} Value indicating whether a drawable is selected or not.
 */
function confirmDrawable(alertUser) {
  if (!drawableImage && alertUser)
    alert("Please select a valid image first!");
  return !!drawableImage;
}

/**
 * Clears the given canvas, or a part of it.
 * @param {object} canvas - DOM element to clear.
 * @param {number} [dx=0] - X-coordinate of the upper left corner of the area to clear.
 * @param {number} [dy=0] - Y-coordinate of the upper left corner of the area to clear.
 * @param {number} [width=canvas.width] - Width of area to clear.
 * @param {number} [height=canvas.height] - Height of area to clear.
 */
function clearCanvas(canvas, dx, dy, width, height) {
  if (dx === undefined || dx == null)
    dx = 0;
  if (dy === undefined || dy == null)
    dy = 0;
  if (width === undefined || width == null)
    width = canvas.width;
  if (height === undefined || height == null)
    height = canvas.height;

  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws the given image on the canvas. Scaling is done without smoothing.
 * Sets the canvas to to the desired width and height, or calculate these values from the image dimensions and scale.
 * @param {object} canvas - Canvas DOM element to draw the image on.
 * @param {object} image - Image to draw.
 * @param {number} [scale=1] Scale of image, 1 is original size.
 * @param {object} [srcStart=[0,0]] Start point of the source image.
 * @param {object} [srcSize] Size of the region to capture from the source image. Defaults to (image size - srcStart).
 * @param {object} [destStart=[0,0]] Destination point of the drawn image.
 * @param {object} [destSize] Size of drawn image. Defaults to srcSize * scale.
 */
function drawResizedImage(canvas, image, scale, srcStart, srcSize, destStart, destSize) {
  if (scale === undefined || scale == null)
    scale = 1;
  if (srcStart === undefined || srcStart == null)
    srcStart = [0,0];
  if (srcSize === undefined || srcSize == null)
    srcSize = [image.width - srcStart[0], image.height - srcStart[1]];
  if (destStart === undefined || destStart == null)
    destStart = [0,0];
  if (destSize === undefined || destSize == null)
    destSize = [srcSize[0] * scale, srcSize[1] * scale];

  if (canvas.width != destSize[0] || canvas.height != destSize[1])
  {
    $(canvas).css("width", destSize[0]);
    $(canvas).css("height", destSize[1]);
    canvas.setAttribute("width", destSize[0]);
    canvas.setAttribute("height", destSize[1]);
  }

  var context = canvas.getContext('2d');

  context.mozImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, srcStart[0], srcStart[1], srcSize[0], srcSize[1], destStart[0], destStart[1], destSize[0], destSize[1]);
}

/**
 * Reads the first file of the given input, and sets it's onload function to the given callback.
 * @param {object} input - File input DOM element with an image file selected.
 * @param {function} callback - Image onload function.
 */
function readDrawableInput(input, callback) {
  if (input.files && input.files.length > 0) {
    // Use first file. By default, users shouldn't be able to select multiple files.
    var file = input.files[0];

    var fr = new FileReader();
    fr.onload = function() {
      var img = new Image;
      img.onload = callback;
      img.src = this.result;
    };
    fr.readAsDataURL(file);
  }
}

/**
 * Called when the selected drawable is loaded.
 * Validates the dimensions and renders the image on the preview.
 */
function drawableLoaded() {
  var image = this;

  // With the scale method we can't go over 256x256
  if (image.width > 256 || image.height > 256) {
    alert('Image dimension exceeded width or height of 256 pixels. The Hatter does not support these dimensions.');
    drawableImage = null;
    $("#selectImage").val('');
    $("#cvsPreviewHat").fadeOut(100, function() { clearCanvas($("#cvsPreviewHat").get(0)); });
    return;
  }

  autoCropFrame = (image.width == 86 && image.height == 215);

  // Animate the preview update in three steps.
  var step = -1;
  var steps = [
    // Step one: Fade out the previous hat, if there is one.
    function() {
      if ($("#cvsPreviewHat").is(":visible"))
        $("#cvsPreviewHat").fadeOut(100, nextStep);
      else
        nextStep();
    },
    // Step two: Draw the new hat, and animate the preview dimensions if the new hat is bigger or smaller than the previous hat.
    function() {
      drawableImage = image;
      clearCanvas($("#cvsPreviewHat").get(0));
      var bot, lef;
      if (!autoCropFrame) {
        drawResizedImage($("#cvsPreviewHat").get(0), drawableImage, 4);
        bot = (86-drawableImage.height)*2,
        lef = (86-drawableImage.width)*2;
      } else {
        drawResizedImage($("#cvsPreviewHat").get(0), drawableImage, 4, [43, 0], [43, 43]);
        bot = 86;
        lef = 86;
      }
        $("#cvsPreviewHat").animate({bottom: bot, left: lef}, 200, nextStep);
    },
    // Step three: Fade in the new hat.
    function() { $("#cvsPreviewHat").fadeIn(100); }
  ];

  var nextStep = function() {
    if (typeof(steps[++step]) == "function")
      steps[step]();
  };

  nextStep();
}


function generateItem() {
  if (!confirmDrawable(true)) { return; }

  let directives = generateDirectives(drawableImage, {crop : autoCropFrame});
  let hideBody = $("#checkHideBody")[0].checked;

  var obj = {
    name: hideBody ? "frogghead" : "eyepatchhead",
    count: 1,
    parameters: {
      directives : "",
      description : "This is my hat! Give it back!",
      femaleFrames : "head.png",
      inventoryIcon : "head.png",
      maleFrames : "head.png",
      mask : "mask.png",
      maxStack : 1,
      price : 0,
      rarity : "common",
      shortdescription : "Custom Hat",
      statusEffects : [],
      tooltipKind : "armor"
    }
  };

  if ($("#checkMask").get(0).checked)
    obj.parameters.mask = "?submask=/items/armors/decorative/hats/eyepatch/mask.png";

  // Double escaping to work around the escaping done by the chat processor (ew).
  obj.parameters.shortdescription = $("#itemName").get(0).value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  obj.parameters.description = $("#itemDescription").get(0).value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  obj.parameters.rarity = $("#itemRarity").get(0).value;
  obj.parameters.directives = directives;

  return obj;
}
/**
 * Generates a hat export for the current image, and starts a download for it.
 */
function generatePlainText() {
  var obj = generateItem();

  var blob = new Blob([ JSON.stringify(obj, null, 2) ], {type: "text/plain;charset=utf8"});
  saveAs(blob, "CustomHat.json");
}

/**
 * Generates a hat export for the current image, and starts a download for it.
 */
function generateCommand() {
  var obj = generateItem();

  // Escape quotes in JSON parameters to prevent early end of stream (since parameters are wrapped in ' in the chat processor).
  var cmd = "/spawnitem " + obj.name + " 1 '" + JSON.stringify(obj.parameters).replace(/'/g, "\\'") + "'";

  var blob = new Blob([ cmd ], {type: "text/plain;charset=utf8"});
  saveAs(blob, "CustomHatCommand.txt");
}

/**
 * Creates and returns a two dimensional table containing all color values for the 'signplaceholder' asset.
 * @returns {object} Two dimensional array ([x][y]) containing integral color values formatted [R,G,B,A] for every pixel.
 */
function getSignPlaceHolder() {
  var colors = [];

  for(var i = 0; i < 32; i++) {
    colors[i] = [];
    var x = i;

    // Compensate for missing hexadecimal values (A/F).
    if (i >= 9)
      x += 6;
    if (i >= 19)
      x += 6;
    if (i >= 29)
      x += 6;

    for (var j = 0; j < 8; j++) {
      colors[i][j] = [x+1,0,j+1,1];
    }
  }

  return colors;
}

/**
 * Generate and returns a directives string to form the given image.
 * Uses the blendmult on white pixels method to concatenate signplaceholder assets.
 * Supported imageOptions:
 * setWhite : true // Sets the base image white (including transparent pixels) before applying the image. Clears white pixels at the end of the directives.
 * crop : true // Crops a hat frame from a 86x215 source image (top right 43x43).
 * @param {object} image - Image to create directives for.
 * @param {object} [imageOptions] - JSON table containing supported image options.
 * @returns {string} Formatted directives string.
 */
function generateDirectives(image, imageOptions) {
  if (image == null)
    return;

  if (imageOptions === undefined || imageOptions == null)
    imageOptions = {};

  var width = imageOptions.crop ? 43 : image.width,
      height = imageOptions.crop ? 43 : image.height;

  // Fetch color codes for the signplaceholder asset.
  var colors = getSignPlaceHolder();

  // Draw the selected image on a canvas, to fetch the pixel data.
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  var canvasContext = canvas.getContext("2d");

  // Flip image upside down, to compensate for the 'inverted' y axis.
  if (!imageOptions.crop) {
    canvasContext.translate(0, image.height);
    canvasContext.scale(1,-1);
    canvasContext.drawImage(image, 0, 0, width, height);
    canvasContext.scale(1,1);
  } else {
    canvasContext.translate(0, 43);
    canvasContext.scale(1,-1);
    canvasContext.drawImage(image, 43, 0, 43, 43, 0, 0, 43, 43);
    canvasContext.scale(1,1);
  }

  const r = digitToHex(width - 1);
  const t = digitToHex(height - 1);

  const bottomRight = `${r}010000`;
  const topLeft = `0001${t}00`;
  const topRight = `${r}01${t}00`;

  drawables = "?setcolor=fff?replace;fff0=fff?crop;0;0;2;2" +
    "?blendmult=/items/active/weapons/protectorate/aegisaltpistol/beamend.png;0;0" +
    `?replace;A355C0A5=00010000;A355C07B=${bottomRight};FFFFFFA5=${topLeft};FFFFFF7B=${topRight}` +
    `?scale=${width};${height}` +
    `?crop;1;1;${width + 1};${height + 1}` +
    "?replace";

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const c = canvasContext.getImageData(x, y, 1, 1).data;
      if (c[3] <= 1) continue;
      drawables += `;${digitToHex(x)}01${digitToHex(y)}00=${colorToHex(c)}`;
    }
  }

  return drawables;
}
