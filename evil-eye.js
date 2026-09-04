import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.11';

const hero=document.querySelector('.hero');
if(hero){
  const layer=document.createElement('div');
  layer.className='evil-eye-container';
  hero.prepend(layer);
  const renderer=new Renderer({alpha:true,premultipliedAlpha:false});
  const gl=renderer.gl; gl.clearColor(0,0,0,0);
  const vertex=`attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0,1);}`;
  const fragment=`precision highp float;uniform float uTime;uniform vec3 uResolution;uniform vec2 uMouse;void main(){vec2 uv=(gl_FragCoord.xy*2.0-uResolution.xy)/uResolution.y;float t=uTime*.35;vec2 p=uv;float d=length(p);float a=atan(p.y,p.x);float rings=sin(d*18.0-t*3.0+a*2.0)*.5+.5;float eye=exp(-pow(abs(p.x)*3.2,2.0)-pow(abs(p.y)*1.8,2.0));float pupil=exp(-pow(length((p-uMouse*.08)*vec2(3.0,1.2)),2.0)*7.0);float glow=eye*(.35+.65*rings)*(1.0-pupil);vec3 c=vec3(.02,.55,.95)*glow+vec3(1.0,.55,.04)*pow(eye,3.0)*.35;float edge=smoothstep(1.7,.25,d);gl_FragColor=vec4(c*edge,glow*.72);}`;
  const program=new Program(gl,{vertex,fragment,transparent:true,depthTest:false,depthWrite:false,uniforms:{uTime:{value:0},uResolution:{value:[1,1,1]},uMouse:{value:[0,0]}}});
  const mesh=new Mesh(gl,{geometry:new Triangle(gl),program});
  layer.appendChild(gl.canvas);
  const mouse={x:0,y:0,tx:0,ty:0};
  hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();mouse.tx=((e.clientX-r.left)/r.width)*2-1;mouse.ty=-(((e.clientY-r.top)/r.height)*2-1)});
  hero.addEventListener('mouseleave',()=>{mouse.tx=mouse.ty=0});
  const resize=()=>{renderer.setSize(layer.clientWidth,layer.clientHeight);program.uniforms.uResolution.value=[gl.canvas.width,gl.canvas.height,gl.canvas.width/gl.canvas.height]};
  addEventListener('resize',resize); resize();
  const loop=t=>{mouse.x+=(mouse.tx-mouse.x)*.04;mouse.y+=(mouse.ty-mouse.y)*.04;program.uniforms.uMouse.value=[mouse.x,mouse.y];program.uniforms.uTime.value=t*.001;renderer.render({scene:mesh});requestAnimationFrame(loop)};
  requestAnimationFrame(loop);
}
