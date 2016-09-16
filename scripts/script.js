/////////////
/* General */
/////////////

// Page load
$(function() {
  "use strict";


  // Set feature background image based on time of day.
  var time = new Date().getHours(), path;

  path = time >= 18 || time < 6 ? "imgs/bgNight.jpg" : "imgs/bgDay2.jpg";

  document.getElementById("featureBackground").style.backgroundImage = "url('" + path +  "')";

});

// Event handler that checks if the value of the element with id 'idFrom' is a hexadecimal colour code, and applies it to the value of the element with id 'idTo'.
function updateColour(idFrom, idTo) {
  "use strict";

  var text = document.getElementById(idFrom).value,
      regex = new RegExp("^#[0-9a-f]{6}$");

  if (regex.test(text)) {
    document.getElementById(idTo).value = text;
  }
}

// Returns a hexadecimal string (values 0-255) matching the given integral value, with at least two characters in the resulting string.
function intToHex(n) {
  "use strict";

  if (n > 255) {
    n = 255;
  }

  var hex = n.toString(16);
  if (hex.length === 1) {
    return "0" + hex;
  } else {
    return hex;
  }
}

// Returns an integer matching the given hexadecimal value.
function hexToInt(str, startIndex, endIndex) {
  "use strict";
  startIndex = typeof startIndex !== 'undefined' ? startIndex : 0;
  endIndex = typeof endIndex !== 'undefined' ? endIndex : str.length;

  return parseInt(str.substring(startIndex, endIndex), 16);
}

// Returns a random hexadecimal colour (#RRGGBB)
function randomColour() {
  "use strict";

  var hex = "0123456789abcdef".split(""),
      result = "#";

  for (var i = 0; i < 6; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }

  return result;
}

// Returns the mouse position of the mouse event, relative to the given canvas.
// http://stackoverflow.com/questions/17343358/canvas-get-points-on-mouse-events
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(evt.clientX - rect.left),
    y: Math.round(evt.clientY - rect.top)
  };
}

// Loads all images from the URLs in sources, and passes the images to the callback function when done loading.
// http://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
function loadImages(sources, callback) {
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  for(var src in sources) {
    numImages++;
  }
  for(var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = sources[src];
  }
}

function colorToHex(color) {
  var colors = {};

  colors[0] = Number(color[0]).toString(16);
  colors[1] = Number(color[1]).toString(16);
  colors[2] = Number(color[2]).toString(16);
  colors[3] = Number(color[3]).toString(16);

  if (colors[0].length == 1)
    colors[0] = "0" + colors[0];
  if (colors[1].length == 1)
    colors[1] = "0" + colors[1];
  if (colors[2].length == 1)
    colors[2] = "0" + colors[2];
  if (colors[3].length == 1)
    colors[3] = "0" + colors[3];
  return colors[0] + colors[1] + colors[2] + colors[3];
}
