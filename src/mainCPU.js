
export const CreateParticlesCPU = async (numParticles=100, numThreads=1) => {
    
    const canvasWebGPU = document.getElementById('canvasWebGPU');
    const canvasCPU = document.getElementById('canvasCPU');
    const context = canvasCPU.getContext("2d");

    // Switch canvas
    canvasWebGPU.style.display = "none";
    canvasCPU.style.display = "block";

    context.fillStyle = "black";
    context.fillRect(0, 0, canvasCPU.width, canvasCPU.height);

    const initialParticleData = new Float32Array(numParticles * 4);
    for (let i = 0; i < numParticles; ++i) {
        initialParticleData[4 * i + 0] = Math.random() * canvasCPU.width; // posX
        initialParticleData[4 * i + 1] = Math.random() * canvasCPU.height; // posY
        initialParticleData[4 * i + 2] = 0; // velX
        initialParticleData[4 * i + 3] = 0; // velY

        // Draw particle to canvas
        context.fillStyle = "white"
        context.fillRect(initialParticleData[4 * i + 0], initialParticleData[4 * i + 1], 1, 1);
    }




}