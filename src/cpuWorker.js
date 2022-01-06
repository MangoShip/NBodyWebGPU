// Helper function for dot product
const dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

// Computation Source: https://github.com/taichi-dev/taichi/blob/3b81d2d30f5e8a0016d0dc01f9db2fef9e2571c4/examples/simulation/nbody_oscillator.py
self.onmessage = function(event) {
    // Perform computation at specific start and end index
    var particlesData = new Float32Array(event.data.particlesBuffer);
    var simParams = event.data.simParams;

    for (let i = event.data.startIndex; i < event.data.endIndex; ++i) {
        var vPos = [particlesData[4 * i + 0], particlesData[4 * i + 1]];
        var vVel = [particlesData[4 * i + 2], particlesData[4 * i + 3]];

        var pos, distance;
        var acc = [0.0, 0.0];

        for (let j = 0; j < event.data.numParticles; ++j) {
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

        // Reflect if at boundary
        if (vPos[0] < -1.0) { // neg x
            vPos[0] = -1.0 - (vPos[0] + 1.0);
            vVel[0] = vVel[0] * -1.0;
        }
        if (vPos[0] > 1.0) { // pos x
            vPos[0] = 1.0 - (vPos[0] - 1.0);
            vVel[0] = vVel[0] * -1.0;
        }
        if (vPos[1] < -1.0) { // neg y
            vPos[1] = -1.0 - (vPos[1] + 1.0);
            vVel[1] = vVel[1] * -1.0;
        }
        if (vPos[1] > 1.0) { // pos y
            vPos[1] = 1.0 - (vPos[1] - 1.0);
            vVel[1] = vVel[1] * -1.0;
        }

        particlesData[4 * i + 0] = vPos[0]; // posX
        particlesData[4 * i + 1] = vPos[1]; // posY
        particlesData[4 * i + 2] = vVel[0]; // velX
        particlesData[4 * i + 3] = vVel[1]; // velY
    }
    
    // Send back data
    postMessage(particlesData);
};

