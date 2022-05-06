// Renders a particle at its position
@stage(vertex)
fn vert_main(@location(0) particlePos : vec2<f32>) -> @builtin(position) vec4<f32> {  
    return vec4<f32>(particlePos, 0.0, 1.0);
}

// Determines color of each object
@stage(fragment)
fn frag_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 1.0, 1.0, 1.0);
}