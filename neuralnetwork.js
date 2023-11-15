globalVideoPlay = false;
globalBoxTop = 65;
globalBoxLeft = 150;
globalBoxWidth = 350;
globalBoxLineWidth = 20;
globalBoxLineHalf = Math.round(globalBoxLineWidth / 2);
globalParamX1 = 0;
globalParamX2 = 0;
globalParamWidth = 0;
globalParamHeight = 0;
globalMatrix = [];
const video = document.querySelector('#camera-stream');
const hiddenCanvas = document.querySelector('#hidden-canvas');
const outputCanvas = document.querySelector('#output-canvas');
const hiddenBoxCanvas = document.querySelector('#hidden-box-canvas');
const hiddenContext = hiddenCanvas.getContext('2d');
const outputContext = outputCanvas.getContext('2d');
const hiddenBoxContext = hiddenBoxCanvas.getContext('2d');
const constraints = {
video: {
width: 640,
height: 480
}
};
const processFrame = () => {
if (globalVideoPlay || globalVideoPlay == undefined) {
return;
}
globalVideoPlay = true;
const { videoWidth: width, videoHeight: height } = video;
if (width && height) {
hiddenCanvas.width = width;
hiddenCanvas.height = height;
outputCanvas.width = width;
outputCanvas.height = height;
hiddenContext.drawImage(video, 0, 0, width, height);
outputContext.drawImage(video, 0, 0, width, height);
var imageData0 = hiddenContext.getImageData(globalBoxLeft, globalBoxTop, globalBoxWidth,
globalBoxWidth);
var pixels0 = imageData0.data;
var imageData = hiddenContext.createImageData(globalBoxWidth, globalBoxWidth);
var pixels = imageData.data;
var txh = 90;
for (var i = 0; i < pixels0.length; i += 4) {
var grayscalePixel = ((0.3*pixels0[i]) + (0.59*pixels0[i+1]) + (0.11*pixels0[i+2]));
if (grayscalePixel > txh) {
pixels[i] = grayscalePixel;
pixels[i+1] = grayscalePixel;
pixels[i+2] = grayscalePixel;
pixels[i+3] = 255;
}
}
outputContext.putImageData(imageData, globalBoxLeft, globalBoxTop);
outputContext.lineWidth = globalBoxLineWidth;
outputContext.strokeStyle = "rgba(0,255,0,0.3)";
outputContext.lineCap = "square";
outputContext.moveTo(globalBoxLeft - globalBoxLineHalf, globalBoxTop);
outputContext.lineTo(globalBoxLeft - globalBoxLineHalf, globalBoxTop + globalBoxWidth -
globalBoxLineHalf);
outputContext.moveTo(globalBoxLeft - globalBoxLineHalf, globalBoxTop - globalBoxLineHalf);
outputContext.lineTo(globalBoxLeft + globalBoxWidth - globalBoxLineHalf, globalBoxTop -
globalBoxLineHalf);
outputContext.moveTo(globalBoxLeft + globalBoxWidth + globalBoxLineHalf, globalBoxTop -
globalBoxLineHalf);
outputContext.lineTo(globalBoxLeft + globalBoxWidth + globalBoxLineHalf, globalBoxTop +
globalBoxWidth - globalBoxLineHalf);
outputContext.moveTo(globalBoxLeft - globalBoxLineHalf, globalBoxTop + globalBoxWidth +
globalBoxLineHalf);
outputContext.lineTo(globalBoxLeft + globalBoxWidth + globalBoxLineHalf, globalBoxTop +
globalBoxWidth + globalBoxLineHalf);
outputContext.stroke();
}
globalVideoPlay = false;
window.requestAnimationFrame(processFrame);
};
if (navigator.webkitGetUserMedia) {
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
video.srcObject = stream;
video.play();
}, function (err) {
console.error(err);
});
} else {
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
video.srcObject = stream;
video.play();
})
.catch(function (err) {
console.error(err);
});
}
video.addEventListener('play', function () {
window.requestAnimationFrame(processFrame);
console.log('Live video!');
});
function snapVideo() {
var canvas = document.querySelector('#output-box-canvas');
var context = canvas.getContext('2d');
var raw = {width: globalBoxWidth, height: globalBoxWidth};
hiddenBoxCanvas.width = raw.width;
hiddenBoxCanvas.height = raw.height;
canvas.width = raw.width;
canvas.height = raw.height;
var imageData0 = outputContext.getImageData(globalBoxLeft, globalBoxTop, globalBoxWidth,
globalBoxWidth);
var pixels0 = imageData0.data;
var imageData = hiddenBoxContext.createImageData(globalBoxWidth, globalBoxWidth);
var pixels = imageData.data;
var boxMatrix = [];
for (var i = 0; i < raw.height; i++) {
var vector = [];
for (var j = 0; j < raw.width; j++) {
vector.push(0);
}
boxMatrix.push(vector);
}
var d = 4 * raw.width;
for (var i = 0; i < pixels0.length; i += 4) {
var y0 = Math.floor(i/d);
var x0 = Math.floor((i - d*y0)/4);
if (pixels0[i] != 0 ) {
pixels[i] = 255;
pixels[i+1] = 255;
pixels[i+2] = 255;
pixels[i+3] = 255;
boxMatrix[y0][x0]=0;
} else {
boxMatrix[y0][x0]=1;
}
}
context.putImageData(imageData, 0, 0);
var tx = 3;
var segment = {Top: 5, Left: 5, Bottom: raw.height - 5, Right: raw.width - 5};
var histogramX = vectorSumX({width: raw.width, height: raw.height, array: boxMatrix});
for (var i = 0; i < histogramX.length; i++) { if (histogramX[i] > tx) { segment.Left = i;
break; } };
for (var i = histogramX.length - 1; i > -1 ; i--) { if (histogramX[i] > tx) { segment.Right =
i; break; } };
var histogramY = vectorSumY({width: raw.width, height: raw.height, array: boxMatrix});
for (var i = 0; i < histogramY.length; i++) { if (histogramY[i] > tx) { segment.Top = i;
break; } };
for (var i = histogramY.length - 1; i > -1 ; i--) { if (histogramY[i] > tx) { segment.Bottom
= i; break; } };
var measure = (segment.Bottom - segment.Top) * (segment.Right - segment.Left);
var sum = 0;
var segmentMatrix = [];
for (var i = segment.Top; i < segment.Bottom + 1; i++) {
var vector = [];
for (var j = segment.Left; j < segment.Right + 1; j++) {
var a = boxMatrix[i][j];
sum = sum + a;
vector.push(a);
}
segmentMatrix.push(vector);
}
globalMatrix = segmentMatrix;


Read(function(weights) {
  globalParamX1 = sum;
  globalParamX2 = measure;
  globalParamWidth = segment.Right - segment.Left;
  globalParamHeight = segment.Bottom - segment.Top;;
  var panelOut = document.getElementById('panel0');
  fetch("weights1.txt")
    .then(function(response) {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Error: " + response.status);
      }
    })
    .then(function(content) {
      var values = content.split(";");
      var w0 = parseFloat(values[0].replace(",", ".")); 
      var wx = parseFloat(values[1].replace(",", ".")); 
      var wy = parseFloat(values[2].replace(",", ".")); 
    console.log("w0 = " + w0);
    console.log("wx = " + wx);
    console.log("wy = " + wy);
  var S = w0 + wx * ((sum - 4518) / (113939 - 4518)) + wy * ((measure - 53544) / (121801 - 53544));
  console.log("S = " + S);
  if(S < 0)
  {
    var scaledMatrix = Scale(globalMatrix);
    console.log(scaledMatrix);

    var predictedIndex = Predict(scaledMatrix, weights);
    console.log(predictedIndex);
    var constellation;
switch (predictedIndex) {
  case 0:
    show_image('images/0.png', 512, 512);
    constellation = "Большая медведица";
    break;
  case 1:
    show_image('images/1.png', 512, 512);
    constellation = "Малая медведица";
    break;
  case 2:
    show_image('images/2.png', 512, 512);
    constellation = "Кассиопея";
    break;
  case 3:
    show_image('images/3.png', 512, 512);
    constellation = "Лира";
    break;
  case 4:
    show_image('images/4.png', 512, 512);
    constellation = "Лебедь";
    break;
  case 5:
    show_image('images/5.png', 512, 512);
    constellation = "Орла";
    break;
  case 6:
    show_image('images/6.png', 512, 512);
    constellation = "Северная корона";
    break;
  case 7:
    show_image('images/7.png', 512, 512);
    constellation = "Волопас";
    break;
  case 8:
    show_image('images/8.png', 512, 512);
    constellation = "Весов";
    break;
  default:
    constellation = "...";
}

    var patternNoteElement = document.getElementById("idPatternNote");
    patternNoteElement.innerHTML = "Обнаружен образ созвездия " + constellation;
    panelOut.innerHTML = 'Параметры Х1 "Сумма единичных пикселей": ' + sum + '<br>' +
  'Параметры Х2 "Площадь сегмента, пикселей": ' + measure +'<br>';
  } 
  else 
  {
    var patternNoteElement = document.getElementById("idPatternNote");
    patternNoteElement.innerHTML = "Обнаружен фон.";
    panelOut.innerHTML = 'Параметры Х1 "Сумма единичных пикселей": ' + sum + '<br>' +
  'Параметры Х2 "Площадь сегмента, пикселей": ' + measure +'<br>';
  var previousImage = document.getElementById("dynamic-image");
    if (previousImage) {
        previousImage.remove(); // Удаляем предыдущий элемент картинки
    }
  }
})
.catch(function(error) {
  console.error("Error:", error);
});


});

context.lineWidth = 5;
context.strokeStyle = "rgba(0,0,255,0.3)";
context.lineCap = "square";
context.moveTo(segment.Left, segment.Top);
context.lineTo(segment.Right, segment.Top);
context.moveTo(segment.Left, segment.Bottom);
context.lineTo(segment.Right, segment.Bottom);
context.moveTo(segment.Left, segment.Top);
context.lineTo(segment.Left, segment.Bottom);
context.moveTo(segment.Right, segment.Top);
context.lineTo(segment.Right, segment.Bottom);
context.stroke();
}

function show_image(src, width, height) {
    // Проверяем, существует ли предыдущий элемент картинки
    var previousImage = document.getElementById("dynamic-image");
    if (previousImage) {
        previousImage.remove(); // Удаляем предыдущий элемент картинки
    }

    var img = document.createElement("img");
    img.id = "dynamic-image"; // Устанавливаем уникальный идентификатор для нового элемента картинки
    img.src = src;
    img.width = width;
    img.height = height;

    // Добавляем новую картинку в <body> тег
    document.body.appendChild(img);
}
function vectorSumY (data) {
var vector = [];
for (var y = 0; y < data.height; y++) {
var sum = 0;
for (var x = 0; x < data.width; x++) {
sum = sum + data.array[y][x];
}
vector.push(sum);
}
return vector;
}
function vectorSumX (data) {
var vector = [];
for (var x = 0; x < data.width; x++) {
var sum = 0;
for (var y = 0; y < data.height; y++) {
sum = sum + data.array[y][x];
}
vector.push(sum);
}
return vector;
}

function Read(callback) {
  fetch("weights2.txt")
    .then(function(response) {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Error: " + response.status);
      }
    })
    .then(function(content) {
      var lines = content.split("\n");

      var inWeight = [];
      var hidWeight = [];
      var hidBias = [];
      var outBias = [];

      for (var i = 0; i < lines.length; i++) {
        var values = lines[i].split(";");

        if (i < 1024) {
          var inputRow = [];
          for (var j = 0; j < values.length; j++) {
            inputRow.push(parseFloat(values[j].replace(",", ".")));
          }
          inWeight.push(inputRow);
        } else if (i >= 1024 && i < 1216) {
          var hiddenRow = [];
          for (var j = 0; j < values.length; j++) {
            hiddenRow.push(parseFloat(values[j].replace(",", ".")));
          }
          hidWeight.push(hiddenRow);
        } else if (i === 1216) {
          for (var j = 0; j < values.length; j++) {
            hidBias.push(parseFloat(values[j].replace(",", ".")));
          }
        } else if (i === 1217) {
          for (var j = 0; j < values.length; j++) {
            outBias.push(parseFloat(values[j].replace(",", ".")));
          }
        }
      }

      var weights = {
        inWeight: inWeight,
        hidWeight: hidWeight,
        hidBias: hidBias,
        outBias: outBias
      };

      callback(weights);
    })
    .catch(function(error) {
      console.error("Error:", error);
    });
}

function Scale(globalMatrix) {
  var originalRows = globalMatrix.length;
  var originalCols = globalMatrix[0].length;
  
  var targetRows = 32;
  var targetCols = 32;
  
  var scaledMatrix = [];
  
  for (var i = 0; i < targetRows; i++) {
    var row = [];
    for (var j = 0; j < targetCols; j++) {
      var originalRow = Math.floor(i * originalRows / targetRows);
      var originalCol = Math.floor(j * originalCols / targetCols);
      
      var value = 0;
      if (originalRow >= 0 && originalRow < originalRows && originalCol >= 0 && originalCol < originalCols) {
        value = globalMatrix[originalRow][originalCol];
      }
      
      row.push(value);
    }
    scaledMatrix.push(row);
  }
  
  return scaledMatrix;
}

function MatrixToArray(matrix) {
  var width = matrix.length;
  var height = matrix[0].length;
  var normalized = new Array(width * height);
  
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      normalized[i * 32 + j] = matrix[i][j];
    }
  }
  
  return normalized;
}

function Run(input, weights) {
  var inWeight = weights.inWeight;
  var hidWeight = weights.hidWeight;
  var hidBias = weights.hidBias;
  var outBias = weights.outBias;

  var hidOutput = new Array(192);
  var output = new Array(9);

  // Вычисление выходов скрытого слоя
  for (var i = 0; i < hidOutput.length; i++) {
    var sum = 0;
    for (var j = 0; j < input.length; j++) {
      sum += input[j] * inWeight[j][i];
    }
    hidOutput[i] = Sigmoid(sum + hidBias[i]);
  }

  // Вычисление выходов сети
  for (var i = 0; i < output.length; i++) {
    var sum = 0;
    for (var j = 0; j < hidOutput.length; j++) {
      sum += hidOutput[j] * hidWeight[j][i];
    }
    output[i] = Sigmoid(sum + outBias[i]);
  }

  return output;
}

function Sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function Predict(image, weights) {
  var input = MatrixToArray(image);
  var output = Run(input, weights);
  var maxOutput = 0;
  var predictedIndex = 0;

  for (var i = 0; i < output.length; i++) {
    if (output[i] > maxOutput) {
      maxOutput = output[i];
      predictedIndex = i;
    }
  }

  return predictedIndex;
}