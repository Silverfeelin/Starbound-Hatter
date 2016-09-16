/**
 * Hatter (http://www.silvermods.com/Hatter)
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License.
 * https://creativecommons.org/licenses/by/3.0/
 */

var drawableImage, imageCharacter, imageHair, previousHeight = 172;

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
 * @param {object} [offset=[0,0]] Array with two numbers which represent the horizontal and vertical offset of the image relative to the canvas.
 * @param {object} [resizeCanvas] Array with two numbers which represent the horizontal and vertical dimensions of the canvas. Defaults to image dimensions multiplied by the scale.
 */
function drawResizedImage(canvas, image, scale, offset, resizeCanvas) {
  if (scale === undefined || scale == null)
    scale = 1;
  if (offset === undefined || offset == null)
    offset = [0,0];
  if (resizeCanvas === undefined || resizeCanvas == null)
    resizeCanvas = [image.width * scale, image.height * scale];

  if (canvas.width != resizeCanvas[0] || canvas.height != resizeCanvas[1])
  {
    $(canvas).css("width", resizeCanvas[0]);
    $(canvas).css("height", resizeCanvas[1]);
    canvas.setAttribute("width", resizeCanvas[0]);
    canvas.setAttribute("height", resizeCanvas[1]);
  }

  var context = canvas.getContext('2d');

  context.mozImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0 + offset[0], 0 + offset[1], image.width * scale, image.height * scale);
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

  if (!avoidRestrictions && (image.height > 85 || image.width > 85)) {
    drawableImage = null;
    $("#selectImage").val('');
    alert("A dimension of the selected image exceeds 86 pixels. The selection has been cleared.\n\nIf you know what you're doing, feel free to hack your way past this message by setting 'avoidRestrictions' to true.");

    $("#cvsPreviewHat").fadeOut(100, function() {
      clearCanvas($("#cvsPreviewHat").get(0));
    });

    return;
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

      drawResizedImage($("#cvsPreviewHat").get(0), drawableImage, 4);
      var bot = (86-drawableImage.height)*2,
          lef = (86-drawableImage.width)*2
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
    var directives = generateDirectives(drawableImage, {setWhite : true});

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

    var blob = new Blob([ JSON.stringify(obj, null, 2)], {type: "text/plain;charset=utf8"});
    saveAs(blob, "CustomHat.json");
  }
}

/**
 * Generates a hat export for the current image, and starts a download for it.
 */
function generateCommand() {

  if (confirmDrawable(true)) {
    var directives = generateDirectives(drawableImage, {setWhite : true});

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

    obj.shortdescription = $("#itemName").get(0).value;
    obj.description = $("#itemDescription").get(0).value;
    obj.rarity = $("#itemRarity").get(0).value;
    obj.directives = directives;

    if ($("#checkMask").get(0).checked)
    {
      var mask = "?submask=/items/armors/decorative/hats/eyepatch/mask.png";
      obj.mask = mask;
    }

    var cmd = "/spawnitem eyepatchhead 1 '" + JSON.stringify(obj) + "'";
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
 * @param {object} image - Image to create directives for.
 * @param {object} [imageOptions] - JSON table containing supported image options.
 * @returns {string} Formatted directives string.
 */
function generateDirectives(image, imageOptions) {
  if (image == null)
    return;

  if (imageOptions === undefined || imageOptions == null)
    imageOptions = {};

  // Fetch color codes for the signplaceholder asset.
  var colors = getSignPlaceHolder();

  // Draw the selected image on a canvas, to fetch the pixel data.
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var canvasContext = canvas.getContext("2d");

  // Flip image upside down, to compensate for the 'inverted' y axis.
  canvasContext.translate(0, image.height);
  canvasContext.scale(1,-1);
  canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
  canvasContext.scale(1,1);

  var drawables = "";

  // Set the source image white before starting.
  if (imageOptions.hasOwnProperty('setWhite') && imageOptions.setWhite)
    drawables = "?setcolor=ffffff?replace;00000000=ffffff;ffffff00=ffffff?setcolor=ffffff" + drawables;

  // Scale and crop
  var maxDimension = image.height > image.width ? image.height : image.width;
  var scale = Math.ceil(maxDimension / 43);
  drawables = drawables + "?scalenearest=" + scale + "?crop=0;0;" + image.width + ";" + image.height;

  var drawableTemplate = "?blendmult=/objects/outpost/customsign/signplaceholder.png"

  // Calculate amount of signplaceholder frames needed horizontally and vertically to form the image.
  var frameCount = [
    Math.ceil(image.width / 32),
    Math.ceil(image.height / 8)
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
