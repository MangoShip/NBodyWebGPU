import $ from 'jquery';
import { CreateParticlesWebGPU } from './mainWebGPU';
import { CreateParticlesCPU } from './mainCPU';
import { CreateParticlesCPUQuad } from './mainCPUQuad';

const main = async (numParticles=1500) => {
    // Error check on numParticles
    if (numParticles <= 0 || numParticles == null) {
        console.warn("Need at least 1 particle!");
        return;
    }

    var numThreads = 0;
    var thetaValue = -1;
    
    // Launch simulation
    if ($('input[name=typeButton]:checked').val() == "CPU"){
        numThreads = $('#numThreads').val() as number;
        console.log("Launching CPU with " + numParticles + " particles and " + numThreads + " threads");
        CreateParticlesCPU(numParticles, numThreads);
    }
    else if ($('input[name=typeButton]:checked').val() == "CPUQuad(SingleThread)"){
        thetaValue = $('#thetaRange').val() as number;
        console.log("Launching CPUQuad(SingleThread) with " + numParticles + " particles with " + thetaValue + " theta value");
        CreateParticlesCPUQuad(numParticles, thetaValue);
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

    if(thetaValue == -1) {
        $('#currentThetaValue').text("");
    }
    else {
        $('#currentThetaValue').text(thetaValue);
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
    // Hide all elements first
    var elements = document.querySelectorAll<HTMLElement>('.numThreads');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none"; 
    }
    elements = document.querySelectorAll<HTMLElement>('.thetaValue');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none"; 
    }

    // Read current value of radio button
    var buttonType = $('input[name=typeButton]:checked').val();

    // Update elements' display and particle numbers based on simulation type
    if(buttonType == "CPU") {
        var elements = document.querySelectorAll<HTMLElement>('.numThreads');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block"; 
        }
        (<HTMLInputElement>document.getElementById("numParticles")).value = "150";

    }
    else if(buttonType == "CPUQuad(SingleThread)") {
        var elements = document.querySelectorAll<HTMLElement>('.thetaValue');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block"; 
        }
        (<HTMLInputElement>document.getElementById("numParticles")).value = "150";
    }
    else {
        (<HTMLInputElement>document.getElementById("numParticles")).value = "1500";
    }
})

// Update text for theta value
$('#thetaRange').on('change', () => {
    var value = $('#thetaRange').val() as string;
    
    if(value.length == 1) { // 0, 1
        value += ".0";
    }
    document.getElementById("thetaText")!.innerHTML = value;
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


