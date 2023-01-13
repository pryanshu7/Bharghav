const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  // Placeholder function for next step. Paste over this in the next step.
  function enableCam(event) {
  }
  // Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }
  // Placeholder function for next step.
function predictWebcam() {
}

// Pretend model has loaded so we can try out the webcam code.
var model = true;
demosSection.classList.remove('invisible');
// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');
});

var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}


// bodypix.js

let start=false;

let start_btn = document.getElementById('webcamButton');
start_btn.addEventListener('click',()=>{
    start = !start;
    main();

},true)

function main() {

    function handleSuccess(stream) {
        const video = document.querySelector('video');
        video.srcObject = stream;
    }

    navigator.mediaDevices.getUserMedia({ video: {width:500},audio:false})
        .then(handleSuccess)

    const sourceVideo = document.getElementById('webcam');
    // const drawCanvas = document.getElementById('canvas-bodypix');

    sourceVideo.onplaying = async() => {

        sourceVideo.width = sourceVideo.videoWidth;
        sourceVideo.height = sourceVideo.videoHeight;

        const net = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        });

        await predictLoop(net)


    };


    async function predictLoop(net) {

        while (start) {

            const segmentation = await net.segmentPersonParts(sourceVideo, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7
            });

            if(segmentation.allPoses[0]===undefined) continue

            let parts = segmentation.allPoses[0].keypoints;
            // let overall = segmentation.allPoses[0].score

            analysis(parts)

            // for (let i=0; i<parts.length; i++) {
            //     let part = parts[i]
            //     // all.push(`${part.score} : ${part.part}`)
            //     analysis(part)
            //
            // }






            //
            //
            // const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
            // const opacity = 0.7;
            // const flipHorizontal = false;
            // const maskBlurAmount = 0;
            //
            //
            // bodyPix.drawMask(
            //     drawCanvas, sourceVideo, coloredPartImage, opacity, maskBlurAmount,
            //     flipHorizontal);



        }}
}


let output1 = document.getElementById('op1')
let output2 = document.getElementById('op2')
let div_op = document.getElementById('div-op')
function analysis(parts) {
    console.log(parts)

    n = parts[0].score;
    l = parts[3].score;
    r = parts[4].score;


    if(n<0.10){
        output1.textContent=`out of frame`
        div_op.classList.add('warning')
    } else if(n>0.80){

        if (l>0.96){
            output1.textContent=`In frame & looking left`
        }

        else if (r>0.96){
            output1.textContent=`In frame & looking right`
        }else{output1.textContent=`In frame`}



        div_op.classList.remove('warning')
    }



    // console.log(n)
    // document.getElementById('op').textContent=`${parts}`


}

//facetracking.js




(() => {
  let run = false;

  let pause_btn_face = document.getElementById("pause-btn-face");

  pause_btn_face.addEventListener('click', function (e) {
      if (run) {
          run = false
      } else run = true
      main()


  }, false);



  const sourceVideo = document.getElementById('webcam');
  const drawCanvas = document.getElementById('canvas-face');

// Drawing Mesh
  const drawMesh = (predictions, ctx) => {
      ctx.clearRect(0, 0, 300, 400)
      if (predictions.length > 0) {
          predictions.forEach((prediction) => {
              const keypoints = prediction.scaledMesh;

              //  Draw Triangles
              for (let i = 0; i < TRIANGULATION.length / 3; i++) {
                  // Get sets of three keypoints for the triangle
                  const points = [
                      TRIANGULATION[i * 3],
                      TRIANGULATION[i * 3 + 1],
                      TRIANGULATION[i * 3 + 2],
                  ].map((index) => keypoints[index]);
                  //  Draw triangle
                  drawPath(ctx, points, true);
              }

              // Draw Dots
              for (let i = 0; i < keypoints.length; i++) {
                  const x = keypoints[i][0];
                  const y = keypoints[i][1];

                  ctx.beginPath();
                  ctx.arc(x, y, 1 /* radius */, 0, 3 * Math.PI);
                  // ctx.fillStyle = "aqua";
                  ctx.fill();
              }
          });
      }
  };

// Triangle drawing method
  const drawPath = (ctx, points, closePath) => {
      const region = new Path2D();
      region.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
          const point = points[i];
          region.lineTo(point[0], point[1]);
      }

      if (closePath) {
          region.closePath();
      }
      ctx.strokeStyle = "grey";
      ctx.stroke(region);
  };




  function main() {

      function handleSuccess(stream) {
          sourceVideo.srcObject = stream;
      }

      navigator.mediaDevices.getUserMedia({video: {width: 440}, audio: false})
          .then(handleSuccess)


      sourceVideo.onplaying = async () => {
          sourceVideo.width = sourceVideo.videoWidth;
          sourceVideo.height = sourceVideo.videoHeight;

          const model = await faceLandmarksDetection.load(
              faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);

              await predictLoop(model)

      };


      async function predictLoop(model) {

          while (run) {

              const faces = await model.estimateFaces({input: sourceVideo});
              drawMesh(faces, drawCanvas.getContext('2d'))

          }
      }


  }

  main()

})()







