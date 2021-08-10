import { simParams } from './main';
import $ from 'jquery';

var cpuContextIsConfigured;

export const CreateParticlesCPU = async (numParticles=100, numThreads=1) => {
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
    const particlesData = new Float32Array(numParticles * 4);
    for (let i = 0; i < numParticles; ++i) {
        particlesData[4 * i + 0] = 2 * (Math.random() - 0.5); // posX
        particlesData[4 * i + 1] = 2 * (Math.random() - 0.5); // posY
        particlesData[4 * i + 2] = 0; // velX
        particlesData[4 * i + 3] = 0; // velY

        // Draw particle to canvas
        drawParticles(particlesData[4 * i + 0], particlesData[4 * i + 1], "white");
    }

    // Helper function for dot product
    const dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

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

    let t = 0;
    // Update Particles
    function frame() {
        console.log(t);
        // Return if context is not configured;
        if(!cpuContextIsConfigured) return;

        for (let i = 0; i < numParticles; ++i) {
            var vPos = [particlesData[4 * i + 0], particlesData[4 * i + 1]];
            var vVel = [particlesData[4 * i + 2], particlesData[4 * i + 3]];

            var pos, distance;
            var acc = [0.0, 0.0];

            for (let j = 0; j < numParticles; ++j) {
                if (i == j) {
                    continue;
                }

                pos = [particlesData[4 * j + 0], particlesData[4 * j + 1]];

                distance = vPos.map((x, i) => x - pos[i]);

                var x = simParams.r0 / Math.sqrt(dotProduct(distance, distance) + simParams.eps);

                // Molecular force
                var molForce = simParams.eps * (Math.pow(x, 13.0) - Math.pow(x, 7.0));
                var molVec = distance.map((x) => x * molForce);
                acc = acc.map((x, i) => x + molVec[i]);

                // Long-distance gravity force
                var gravForce = simParams.G * (Math.pow(x, 3.0));
                var gravVec = distance.map((x) => x * gravForce);
                acc = acc.map((x, i) => x + gravVec[i]);
            }

            var accTime = acc.map((x) => x * simParams.dt);
            vVel = vVel.map((x, i) => vVel[i] + accTime[i]);

            var velTime = vVel.map((x) => x * simParams.dt);
            vPos = vPos.map((x, i) => vPos[i] + velTime[i]);

            particlesData[4 * i + 0] = vPos[0]; // posX
            particlesData[4 * i + 1] = vPos[1]; // posY
            particlesData[4 * i + 2] = vVel[0]; // velX
            particlesData[4 * i + 3] = vVel[1]; // velY
        }
        
        // Erase all particles
        context.clearRect(0, 0, canvasCPU.width, canvasCPU.height);

        // Draw canvas background
        context.fillStyle = "black";
        context.fillRect(0, 0, canvasCPU.width, canvasCPU.height);

        // Draw new particles
        for (let i = 0; i < numParticles; ++i) {
            drawParticles(particlesData[4 * i + 0], particlesData[4 * i + 1], "white");
        }

        ++t;

        // Measure performance
        currentTime = performance.now();
        var elapsedTime = currentTime - previousTime;
        previousTime = currentTime;
        var framePerSecond = Math.round(1 / (elapsedTime / 1000));
            
        if(updatePerformance) {
            updatePerformance = false;

            document.getElementById("fps").innerHTML = `FPS:  ${framePerSecond}`;

            setTimeout(() => {
                updatePerformance = true;
            }, 50); // update FPS every 50ms
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Delte canvas context for redrawing canvas
    $('#updateButton').on('click', () => {
        cpuContextIsConfigured = false;
        context.clearRect(0, 0, canvasCPU.width, canvasCPU.height);
    });
}