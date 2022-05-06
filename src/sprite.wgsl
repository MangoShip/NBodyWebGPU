// Renders a particle at its position
@stage(vertex)
fn vert_main(@location(0) particlePos : vec2<f32>,
             @builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {  

    var shape = array<vec2<f32>, 6> (
    vec2<f32>(-0.0025, 0.0025),
    vec2<f32>(-0.0025, -0.0025),
    vec2<f32>(0.0025, 0.0025),
    vec2<f32>(0.0025, -0.0025),
    vec2<f32>(-0.0025, -0.0025),
    vec2<f32>(0.0025, 0.0025));

    return vec4<f32>(particlePos + shape[VertexIndex], 0.0, 1.0);
}

// Determines color of each object
@stage(fragment)
fn frag_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 1.0, 1.0, 0.0);
}