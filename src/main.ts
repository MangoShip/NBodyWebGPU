import $ from 'jquery';
import { ContextExclusionPlugin } from 'webpack';
import { CreateParticlesWebGPU } from './mainWebGPU';

const main = async (simulationType='WebGPU', numParticles=1500) => {
    // Update simulation type and number of particles texts
    $('#currentType').text(simulationType);
    $('#currentNumParticles').text(numParticles);

    // Error check
    if (numParticles <= 0) {
        console.warn("Need at least 1 particle!");
        return;
    }

    // Launch simulation
    if (simulationType == 'WebGPU') {
        console.log("Launching WebGPU with " + numParticles + " particles");
        CreateParticlesWebGPU(numParticles);
    }
    else if (simulationType == 'CPU(Single-Thread)'){
        console.log("Launching CPU(Single-Thread) with " + numParticles + " particles");
    }
    else {
        console.log("Launching CPU(Multi-Thread) with " + numParticles + " particles");
    }
}

main();

// Changes Text for indicate next simulation type
$('.typeButton').on('click', (event) => {
    $('#changeType').text(event.target.innerText); 
});

// Restarts main with new simulation type and particle number.
$('#startButton').on('click', () => {
    // Read simulation type and number of particles
    var simulationType = $('#changeType').text();
    var numParticles = $('#numParticles').val() as number;

    // Launch main with new simulation type and number of particles
    main(simulationType, numParticles);
});
