import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.11';

const hero = document.querySelector('.hero');

if (hero) {
  const style = document.createElement('style');
  style.textContent = `
    .hero::after{z-index:1!important}
    .hero .wrap{z-index:3!important}
    .evil-eye-container{z-index:2!important;opacity:.95!important;mix-blend-mode:screen}
    .evil-eye-container canvas{width:100%!important;height:100%!important;display:block}
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'evil-eye-container';
  layer.style.zIndex = '2';
  layer.style.opacity = '0.95';
  layer.style.pointerEvents = 'none';
  hero.prepend(layer);

  const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, antialias: true });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const vertex = `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;
  const fragment = `precision highp float; uniform float uTime; uniform vec3 uResolution; uniform vec2 uMouse; void main(){vec2 uv=(gl_FragCoord.xy*2.0-uResolution.xy)/uResolution.y;float t=uTime*.42;vec2 p=uv;float d=length(p);float a=atan(p.y,p.x);float rings=sin(d*20.0-t*3.5+a*2.2)*.5+.5;float eye=exp(-pow(abs(p.x)*3.0,2.0)-pow(abs(p.y)*1.7,2.0));float pupil=exp(-pow(length((p-uMouse*.10)*vec2(3.2,1.35)),2.0)*6.5);float iris=smoothstep(.92,.18,eye)*(.35+.65*rings);float glow=eye*(.30+.70*rings)*(1.0-pupil*.65);vec3 cyan=vec3(.08,.72,1.0);vec3 gold=vec3(1.0,.62,.08);vec3 c=cyan*iris*.85+gold*pow(eye,3.0)*.55;float edge=smoothstep(1.75,.28,d);gl_FragColor=vec4(c*edge,glow*.82*edge);}`;

  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { uTime:{value:0}, uResolution:{value:[1,1,1]}, uMouse:{value:[0,0]} }
  });

  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  layer.appendChild(gl.canvas);
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  gl.canvas.style.display = 'block';

  const mouse = { x:0, y:0, tx:0, ty:0 };
  const onMove = (e) => { const r=hero.getBoundingClientRect(); mouse.tx=((e.clientX-r.left)/r.width)*2-1; mouse.ty=-(((e.clientY-r.top)/r.height)*2-1); };
  const onLeave = () => { mouse.tx=0; mouse.ty=0; };
  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', onLeave);

  const resize = () => { renderer.setSize(layer.clientWidth,layer.clientHeight); program.uniforms.uResolution.value=[gl.canvas.width,gl.canvas.height,gl.canvas.width/gl.canvas.height]; };
  addEventListener('resize', resize);
  resize();

  let raf;
  const loop = (t) => { mouse.x+=(mouse.tx-mouse.x)*.045; mouse.y+=(mouse.ty-mouse.y)*.045; program.uniforms.uMouse.value=[mouse.x,mouse.y]; program.uniforms.uTime.value=t*.001; renderer.render({scene:mesh}); raf=requestAnimationFrame(loop); };
  raf=requestAnimationFrame(loop);

  addEventListener('beforeunload', () => { cancelAnimationFrame(raf); removeEventListener('resize',resize); hero.removeEventListener('mousemove',onMove); hero.removeEventListener('mouseleave',onLeave); });
}
