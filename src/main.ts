import $ from 'jquery';
import { CreateParticlesWebGPU } from './mainWebGPU';
import { CreateParticlesCPU } from './mainCPU.js';

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

// Make number of threads visible when "CPU(Multi-Threads") has been pressed
$('input[name=typeButton]:radio').change(function(){
    // Read current value of radio button
    var buttonType = $('input[name=typeButton]:checked').val();
    if(buttonType == "CPU") {
        var elements = document.querySelectorAll<HTMLElement>('.numThreads');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.visibility = "visible"; 
        }
    }
    else {
        var elements = document.querySelectorAll<HTMLElement>('.numThreads');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.visibility = "hidden"; 
        }
    }
})

// Restarts main with new simulation type and particle number.
$('#updateButton').on('click', () => {
    // Read new number of particles
    var numParticles = $('#numParticles').val() as number;

    // Add a delay to clear up canvas first
    //setTimeout(function() {
        // Launch main with new number of particles
        main(numParticles);
    //}, 1000);
    
});
