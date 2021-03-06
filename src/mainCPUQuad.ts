import { simParams } from './main';
import $ from 'jquery';

var cpuContextIsConfigured;

export const CreateParticlesCPUQuad = async (numParticles=150, thetaValue=1) => {

    const canvasWebGPU = document.getElementById('canvasWebGPU');
    const canvasCPU = document.getElementById('canvasCPU') as HTMLCanvasElement;
    const context = canvasCPU.getContext("2d");

    // Switch canvas
    canvasWebGPU.style.display = "none";
    canvasCPU.style.display = "block";
    
    // Draw canvas background
    context.fillStyle = "black";
    context.fillRect(0, 0, canvasCPU.width, canvasCPU.height);

    cpuContextIsConfigured = true;

    // Create Particles
    var particlesBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * (numParticles * 4));
    var particlesData = new Float32Array(particlesBuffer);

    for (let i = 0; i < numParticles; ++i) {
        particlesData[4 * i + 0] = 2 * (Math.random() - 0.5); // posX
        particlesData[4 * i + 1] = 2 * (Math.random() - 0.5); // posY
        particlesData[4 * i + 2] = 0; // velX
        particlesData[4 * i + 3] = 0; // velY

        // Draw particle to canvass
        drawParticles(particlesData[4 * i + 0], particlesData[4 * i + 1], "white");
    }

    // Draw particles by converting particlesData coordinates to canvas coordinates
    function drawParticles(x, y, color) {
        var canvasHalfWidth = canvasCPU.width / 2;
        var canvasHalfHeight = canvasCPU.height / 2;
        context.fillStyle = color;
        context.fillRect(x * canvasHalfWidth + canvasHalfWidth, y * canvasHalfHeight + canvasHalfHeight, 1, 1);
    }

    // Variables for performance measurement (fps)
    let updatePerformance = true;
    var currentTime, previousTime;
    currentTime = previousTime = performance.now();
    var totalFramePerSecond = 0;
    var frameCounter = 0;

    // Variables for performance measurement (fps), specifically for test results
    var currentFrame = 0;
    var endFrame = 10000;
    var totalFPS = 0;
    var startTime = performance.now();

    // Initialize a worker
    var worker = new Worker('./src/cpuQuadWorker.js');

    // Update Particles
    function frame() {
        // Return if context is not configured
        if(!cpuContextIsConfigured) return;

        var transferData = {
            numParticles: numParticles,
            simParams: simParams,
            particlesBuffer: particlesBuffer,
            canvasSize: [canvasCPU.width, canvasCPU.height],
            thetaValue : thetaValue
        }

        // Assign computation work with range to worker
        worker.postMessage(transferData);

        // Update particlesData with received data
        worker.onmessage = function(event) {
            // Erase all particles
            context.clearRect(0, 0, canvasCPU.width, canvasCPU.height);

            // Draw canvas background
            context.fillStyle = "black";
            context.fillRect(0, 0, canvasCPU.width, canvasCPU.height);

            // Draw new particles
            for (let i = 0; i < numParticles; ++i) {
                drawParticles(particlesData[4 * i + 0], particlesData[4 * i + 1], "white");
                /*if(particlesData[4 * i + 0] > 1 || particlesData[4 * i + 0] < -1) {
                    console.log("OUT OF BOUNDS");
                }*/
            }

            // Measure performance
            currentTime = performance.now();
            var elapsedTime = currentTime - previousTime;
            previousTime = currentTime;
            var framePerSecond = Math.round(1 / (elapsedTime / 1000));
            totalFramePerSecond += framePerSecond;
            frameCounter++;

            if(updatePerformance) {
                updatePerformance = false;

                let averageFramePerSecond = Math.round(totalFramePerSecond / frameCounter);
                
                frameCounter = 0;
                totalFramePerSecond = 0;

                document.getElementById("fps")!.innerHTML = `FPS:  ${averageFramePerSecond}`;

                setTimeout(() => {
                    updatePerformance = true;
                }, 50); // update FPS every 50ms
            }

            // Test result
            totalFPS += framePerSecond;
            currentFrame++;

            if(currentFrame == endFrame) {
                console.log("Average FPS after " + endFrame + " frames: " + totalFPS / endFrame);
                console.log("Duration Time: " + ((performance.now() - startTime)/1000) + "seconds");

                startTime = performance.now();

                currentFrame = 0;
                totalFPS = 0;
            }

            requestAnimationFrame(frame);
        }
    }
    requestAnimationFrame(frame);

    // Delte canvas context for redrawing canvas
    $('#updateButton').on('click', () => {
        cpuContextIsConfigured = false;

        // Clear canvas' context
        context.clearRect(0, 0, canvasCPU.width, canvasCPU.height);

        // Terminate worker
        worker.terminate();
    });
}