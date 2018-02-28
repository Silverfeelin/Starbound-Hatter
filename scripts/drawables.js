/**
 * Hatter (http://www.silvermods.com/Hatter)
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License.
 * https://creativecommons.org/licenses/by/3.0/
 */

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

  // Bind hair mask
  $("#checkMask").change(function() {
    var canvasHair = $("#cvsPreviewHair");
    if (this.checked)
      canvasHair.fadeOut(100);
    else
      canvasHair.fadeIn(100);
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
  if (drawableImage == null) {
    if (alertUser)
      alert("Please select a valid image first!");

    return false;
  } else
    return true;
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
 * Variable that can be set to true (in console) to avoid the dimension restrictions on the input image.
 * Note: You'll have to manually adjust the (scale and) crop directive. I could probably automate this, but the offsets seemed particularly random.
 */
var avoidRestrictions = false;

/**
 * Called when the selected drawable is loaded.
 * Validates the dimensions and renders the image on the preview.
 */
function drawableLoaded() {
  var image = this;
  
  autoCropFrame = (image.width == 86 && image.height == 215);
  
  if (!autoCropFrame && !avoidRestrictions && (image.height > 85 || image.width > 85)) {
    var r = confirm("A dimension of the selected image exceeds 85 pixels.\nIt is highly discouraged you proceed and use this image, as it can easily cause performance issues for you and other players.\n\nDo you want to proceed using this image?");
    
    if (r != true)
    {
      drawableImage = null;
      $("#selectImage").val('');
      $("#cvsPreviewHat").fadeOut(100, function() {
        clearCanvas($("#cvsPreviewHat").get(0));
      });

      return;
    }
  }
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
        console.log("a");
        drawResizedImage($("#cvsPreviewHat").get(0), drawableImage, 4, [43, 0], [43, 43]);
        bot = 86;
        lef = 86;
      }
        $("#cvsPreviewHat").animate({bottom: bot, left: lef}, 200, nextStep);
    },
    // Step three: Fade in the new hat.
    function() {
      $("#cvsPreviewHat").fadeIn(100);
    }
  ];

  var nextStep = function() {
    if (typeof(steps[++step]) == "function")
      steps[step]();
  };

  nextStep();
}

/**
 * Generates a hat export for the current image, and starts a download for it.
 */
function generatePlainText() {

  if (confirmDrawable(true)) {
    var directives = generateDirectives(drawableImage, {setWhite : true, crop : autoCropFrame});

    var obj = { "count" : 1,
               "name" : "eyepatchhead",
               "parameters" :  {
                 directives : "",
                 description : "This is my hat! Give it back!",
                 femaleFrames : "head.png",
                 inventoryIcon : "head.png",
                 itemName : "eyepatchhead",
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

    obj.parameters.shortdescription = $("#itemName").get(0).value;
    obj.parameters.description = $("#itemDescription").get(0).value;
    obj.parameters.rarity = $("#itemRarity").get(0).value;
    obj.parameters.directives = directives;

    if ($("#checkMask").get(0).checked)
    {
      var mask = "?submask=/items/armors/decorative/hats/eyepatch/mask.png";
      obj.parameters.mask = mask;
    }

    var blob = new Blob([ JSON.stringify(obj, null, 2) ], {type: "text/plain;charset=utf8"});
    saveAs(blob, "CustomHat.json");
  }
}

/**
 * Generates a hat export for the current image, and starts a download for it.
 */
function generateCommand() {

  if (confirmDrawable(true)) {
    var directives = generateDirectives(drawableImage, {setWhite : true, crop : autoCropFrame});

    var obj = {
                directives : "",
                description : "This is my hat! Give it back!",
                femaleFrames : "head.png",
                inventoryIcon : "head.png",
                itemName : "eyepatchhead",
                maleFrames : "head.png",
                mask : "mask.png",
                maxStack : 1,
                price : 0,
                rarity : "common",
                shortdescription : "Custom Hat",
                statusEffects : [],
                tooltipKind : "armor"
              };
    
    // Double escaping to work around the escaping done by the chat processor (ew).
    obj.shortdescription = $("#itemName").get(0).value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    obj.description = $("#itemDescription").get(0).value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    obj.rarity = $("#itemRarity").get(0).value;
    obj.directives = directives;

    if ($("#checkMask").get(0).checked)
    {
      var mask = "?submask=/items/armors/decorative/hats/eyepatch/mask.png";
      obj.mask = mask;
    }

    // Escape quotes in JSON parameters to prevent early end of stream (since parameters are wrapped in ' in the chat processor).
    var cmd = "/spawnitem eyepatchhead 1 '" + JSON.stringify(obj).replace(/'/g, "\\'") + "'";
    
    var blob = new Blob([ cmd ], {type: "text/plain;charset=utf8"});
    saveAs(blob, "CustomHatCommand.txt");
  }
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
  
  var drawables = "";

  // Set the source image white before starting.
  if (imageOptions.hasOwnProperty('setWhite') && imageOptions.setWhite)
    drawables = "?setcolor=ffffff?replace;00000000=ffffff;ffffff00=ffffff?setcolor=ffffff" + drawables;

  // Scale and crop
  var maxDimension = height > width ? height : width;
  var scale = Math.ceil(maxDimension / 43);
  drawables = drawables + "?scalenearest=" + scale + "?crop=0;0;" + width + ";" + height;

  var drawableTemplate = "?blendmult=/objects/outpost/customsign/signplaceholder.png"

  // Calculate amount of signplaceholder frames needed horizontally and vertically to form the image.
  var frameCount = [
    Math.ceil(width / 32),
    Math.ceil(height / 8)
  ];

  // For every frame, create a new blendmult 'layer'.
  for (var frameX = 0; frameX < frameCount[0]; frameX++) {
    for (var frameY = 0; frameY < frameCount[1]; frameY++) {
      var currentX = frameX * 32;
      var currentY = frameY * 8;

      var drawable = drawableTemplate;

      drawable += ";" + (-frameX * 32) + ";" + (frameY * - 8) + "?replace";

      var containsPixels = false;

      var removeWhite = $("#checkRemoveWhite").get(0).checked;

      // For every pixel of this frame, fetch it's color code.
      for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 8; y++) {
          // Raise Y now so we can safely continue when checks fail; remember to check y-1!
          currentY++;

          if (currentX > canvas.width - 1 || currentY-1 > canvas.height - 1)
            continue;

          var pixelC = canvasContext.getImageData(currentX, currentY-1, 1, 1).data;

          if (pixelC[3] != 0)
            containsPixels = true;

          if (pixelC[0] == 255 && pixelC[1] == 255 && pixelC[2] == 255)
          {
            if (removeWhite && pixelC[3] == 255)
            {
              pixelC = [0,0,0,0];
            }
            else
            {
              pixelC[0] = 254;
              pixelC[1] = 254;
              pixelC[2] = 254;
            }

          }

          drawable += ";" + colorToHex(colors[x][y]) + "=" + colorToHex(pixelC);
        }

        currentX++;
        currentY = frameY * 8;
      }

      // If the current frame does not contain nay pixels, we don't have to add the layer.
      if (containsPixels)
        drawables += drawable;
    }
  }

  // Finally, revert the setWhite.
  if (imageOptions.hasOwnProperty('setWhite') && imageOptions.setWhite) {
    drawables += "?replace;ffffffff=00000000";
  }

  return drawables;
}
