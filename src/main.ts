import $ from 'jquery';
import { CheckWebGPU } from './helper';
import spriteWGSL from './sprite.wgsl';
import updateSpriteWGSL from './updateSprite.wgsl';

const CreateParticles = async (numParticles=1500) => {
    const checkgpu = CheckWebGPU();
    if(checkgpu.includes('Your current browser does not support WebGPU!')){
        console.log(checkgpu);
        throw('Your current browser does not support WebGPU!');
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;        
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;       
    const device = await adapter.requestDevice() as GPUDevice;
    const context = canvas.getContext('gpupresent') as GPUPresentationContext;

    const format = 'bgra8unorm';
    context.configure({
        device: device,
        format: format,
    });

    const spriteShaderModule = device.createShaderModule({ code: spriteWGSL });
    const renderPipeline = device.createRenderPipeline({
        vertex: {
            module: spriteShaderModule,
            entryPoint: 'vert_main',
            buffers: [
              {
                // instanced particles buffer
                arrayStride: 4 * 4,
                stepMode: 'instance',
                attributes: [
                  {
                    // instance position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x2',
                  },
                  {
                    // instance velocity
                    shaderLocation: 1,
                    offset: 2 * 4,
                    format: 'float32x2',
                  },
                ],
              },
              {
                // vertex buffer
                arrayStride: 2 * 4,
                stepMode: 'vertex',
                attributes: [
                  {
                    // vertex positions
                    shaderLocation: 2,
                    offset: 0,
                    format: 'float32x2',
                  },
                ],
              },
            ],
          },
          fragment: {
            module: spriteShaderModule,
            entryPoint: 'frag_main',
            targets: [
              {
                format: format as GPUTextureFormat
              },
            ],
          },
          primitive: {
            topology: 'point-list'
          },
    })

    const computePipeline = device.createComputePipeline({
        compute: {
            module: device.createShaderModule({
                code: updateSpriteWGSL,
            }),
            entryPoint: 'main',
        }
    })

    const vertexBufferData = new Float32Array([
         0.0, 0.0
    ]);
    
    const spriteVertexBuffer = device.createBuffer({
        size: vertexBufferData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(spriteVertexBuffer.getMappedRange()).set(vertexBufferData);
    spriteVertexBuffer.unmap();

    const simParams = {
        r0: 0.05,
        dt: 0.005000,
        G: -10,
        eps: 0.001,
    };

    const simParamBufferSize = 4 * Float32Array.BYTES_PER_ELEMENT;
    const simParamBuffer = device.createBuffer({
        size: simParamBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    function updateSimParams() {
        device.queue.writeBuffer(
            simParamBuffer,
            0,
            new Float32Array([
                simParams.r0,
                simParams.dt,
                simParams.G,
                simParams.eps
            ])
        );
    }

    updateSimParams();

    //const numParticles = 1500;
    const initialParticleData = new Float32Array(numParticles * 4);
    for (let i = 0; i < numParticles; ++i) {
        initialParticleData[4 * i + 0] = 2 * (Math.random() - 0.5); // posX
        initialParticleData[4 * i + 1] = 2 * (Math.random() - 0.5); // posY
        initialParticleData[4 * i + 2] = 0; // velX
        initialParticleData[4 * i + 3] = 0; // velY
    }

    //console.log(initialParticleData);

    const particleBuffers: GPUBuffer[] = new Array(2);
    const particleBindGroups: GPUBindGroup[] = new Array(2);
    for (let i = 0; i < 2; i++) {
        particleBuffers[i] = device.createBuffer({
            size: initialParticleData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });
        new Float32Array(particleBuffers[i].getMappedRange()).set(
            initialParticleData
        );
        particleBuffers[i].unmap();
    }

    //console.log(particleBuffers);

    for (let i = 0; i < 2; i++) {
        particleBindGroups[i] = device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: simParamBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: particleBuffers[i],
                        offset: 0,
                        size: initialParticleData.byteLength
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: particleBuffers[(i + 1) % 2],
                        offset: 0,
                        size: initialParticleData.byteLength
                    }
                }
            ]
        });
    }

    var currentTime, previousTime;
    currentTime = previousTime = performance.now();

    let t = 0;
    function frame() {
        const textureView = context.getCurrentTexture().createView();
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, //background color
                    storeOp: 'store'
                }
            ]
        }
        
        const commandEncoder = device.createCommandEncoder();
        {
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(computePipeline);
            passEncoder.setBindGroup(0, particleBindGroups[t % 2]);
            passEncoder.dispatch(Math.ceil(numParticles / 64));
            passEncoder.endPass();
        }
        {
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(renderPipeline);
            passEncoder.setVertexBuffer(0, particleBuffers[(t+1)%2]);
            passEncoder.setVertexBuffer(1, spriteVertexBuffer);
            passEncoder.draw(1, numParticles, 0, 0);
            passEncoder.endPass();      
        }
        device.queue.submit([commandEncoder.finish()]); 
        ++t;

        currentTime = performance.now();
        var elapsedTime = currentTime - previousTime;
        previousTime = currentTime;
        var framePerSecond = Math.round(1 / (elapsedTime / 1000));

        document.getElementById("fps")!.innerHTML = `FPS:  ${framePerSecond}`;


        requestAnimationFrame(frame);
        
    }
    requestAnimationFrame(frame);
}

CreateParticles();
$('#id-btn').on('click', ()=>{
    const numParticles = $('#id-numParticles').val() as number;
    CreateParticles(numParticles);
});
