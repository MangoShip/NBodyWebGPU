import $ from 'jquery';
import { CreateParticlesWebGPU } from './mainWebGPU';
import { CreateParticlesCPU } from './mainCPU';

const main = async (numParticles=1500) => {
    // Error check on numParticles
    if (numParticles <= 0 || numParticles == null) {
        console.warn("Need at least 1 particle!");
        return;
    }

    var numThreads = 0;
    
    // Launch simulation
    if ($('input[name=typeButton]:checked').val() == "CPU"){
        numThreads = $('#numThreads').val() as number;
        console.log("Launching CPU with " + numParticles + " particles and " + numThreads + " threads");
        CreateParticlesCPU(numParticles, numThreads);
    }
    else if ($('input[name=typeButton]:checked').val() == "WebGPU"){
        console.log("Launching WebGPU with " + numParticles + " particles");
        CreateParticlesWebGPU(numParticles);
    }
    else { // No selection on simulation type.
        console.warn("Choose simulation type");
        return;
    }

    // Update simulation type and number of particles texts
    $('#currentType').text($('input[name=typeButton]:checked').val() as string);
    $('#currentNumParticles').text(numParticles);

    if(numThreads == 0) {
        $('#currentNumThreads').text("");
    }
    else {
        $('#currentNumThreads').text(numThreads);
    }
    
}

main();

// Variables used for computation
export const simParams = {
    r0: 0.05,
    dt: 0.005000,
    G: -10,
    eps: 0.001,
}

// Make number of threads visible when "CPU(Multi-Threads") has been pressed
$('input[name=typeButton]:radio').change(function(){
    // Read current value of radio button
    var buttonType = $('input[name=typeButton]:checked').val();
    if(buttonType == "CPU") {
        var elements = document.querySelectorAll<HTMLElement>('.numThreads');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.visibility = "visible"; 
        }
        (<HTMLInputElement>document.getElementById("numParticles")).value = "150";

    }
    else {
        var elements = document.querySelectorAll<HTMLElement>('.numThreads');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.visibility = "hidden"; 
        }
        (<HTMLInputElement>document.getElementById("numParticles")).value = "1500";
    }
})

// Restarts main with new simulation type and particle number.
$('#updateButton').on('click', () => {
    // Read new number of particles
    var numParticles = $('#numParticles').val() as number;

    // Delay before calling main to make sure canvas gets cleared first
    setTimeout(function() {
        main(numParticles);
    }, 100); // Call main after 100 ms
});
