// Code Source: https://github.com/austinEng/webgpu-samples/blob/main/src/sample/computeBoids/updateSprites.wgsl
struct Particle {
    pos : vec2<f32>;
    vel : vec2<f32>;
};

struct SimParams {
    r0 : f32;
    dt : f32;
    G: f32;
    eps: f32;
};
struct Particles {
    particles : array<Particle>;
};
@binding(0) @group(0) var<uniform> params : SimParams;
@binding(1) @group(0) var<storage, read_write> particlesA : Particles;
@binding(2) @group(0) var<storage, read_write> particlesB : Particles;

@stage(compute) @workgroup_size(256)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
  // Computation Source: https://github.com/taichi-dev/taichi/blob/3b81d2d30f5e8a0016d0dc01f9db2fef9e2571c4/examples/simulation/nbody_oscillator.py
  var index : u32 = GlobalInvocationID.x;

  var vPos = particlesA.particles[index].pos;
  var vVel = particlesA.particles[index].vel;

  var pos : vec2<f32>;

  var distance : vec2<f32>;
  var acc = vec2<f32>(0.0, 0.0);

  for (var i : u32 = 0u; i < arrayLength(&particlesA.particles); i = i + 1u) {
    if (i == index) {
      continue;
    }

    pos = particlesA.particles[i].pos.xy;

    distance = vPos - pos;

    var x : f32= params.r0 / sqrt(dot(distance, distance) + params.eps);

    // Molecular force
    acc = acc + (params.eps * (pow(x, 13.0) - pow(x, 7.0)) * distance);

    // Long-distance gravity force
    acc = acc + (params.G * (pow(x, 3.0)) * distance);
  }

  vVel = vVel + (acc * params.dt);
  vPos = vPos + (vVel * params.dt);

  // Reflect if at boundary
  //if (vPos.x < -1.0) { // neg x
     // vPos.x = -1.0 - (vPos.x + 1.0);
     //vVel.x = vVel.x * -1.0;
  //}
  //if (vPos.x > 1.0) { // pos x
      //vPos.x = 1.0 - (vPos.x - 1.0);
      //vVel.x = vVel.x * -1.0;
  //}
  //if (vPos.y < -1.0) { // neg y
      //vPos.y = -1.0 - (vPos.y + 1.0);
      //vVel.y = vVel.y * -1.0;
  //}
  //if (vPos.y > 1.0) { // pos y
     // vPos.y = 1.0 - (vPos.y - 1.0);
      //vVel.y = vVel.y * -1.0;
 // }

  // Write back
  particlesB.particles[index].pos = vPos;
  particlesB.particles[index].vel = vVel;
}