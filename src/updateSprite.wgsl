struct Particle {
    pos : vec2<f32>;
    vel : vec2<f32>;
};
[[block]] struct SimParams {
    r0 : f32;
    dt : f32;
    G: f32;
    eps: f32;
};
[[block]] struct Particles {
    particles : [[stride(16)]] array<Particle>;
};
[[binding(0), group(0)]] var<uniform> params : SimParams;
[[binding(1), group(0)]] var<storage, read> particlesA : Particles;
[[binding(2), group(0)]] var<storage, read_write> particlesB : Particles;

[[stage(compute), workgroup_size(64)]]
fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
  var index : u32 = GlobalInvocationID.x;

  var vPos = particlesA.particles[index].pos;
  var vVel = particlesA.particles[index].vel;

  var pos : vec2<f32>;
  var vel : vec2<f32>;

  var distance : vec2<f32>;
  var acc = vec2<f32>(0.0, 0.0);

  for (var i : u32 = 0u; i < arrayLength(&particlesA.particles); i = i + 1u) {
    if (i == index) {
      continue;
    }

    pos = particlesA.particles[i].pos.xy;
    vel = particlesA.particles[i].vel.xy;

    distance = vPos - pos;

    var x : f32= params.r0 / sqrt(dot(distance, distance) + params.eps);

    // Molecular force
    acc = acc + (params.eps * (pow(x, 13.0) - pow(x, 7.0)) * distance);

    // Long-distance gravity force
    acc = acc + (params.G * (pow(x, 3.0)) * distance);
  }

  vVel = vVel + (acc * params.dt);
  vPos = vPos + (vVel * params.dt);

  // Write back
  particlesB.particles[index].pos = vPos;
  particlesB.particles[index].vel = vVel;
}