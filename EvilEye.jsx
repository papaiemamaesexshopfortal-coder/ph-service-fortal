import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { useEffect, useRef } from 'react';
import './EvilEye.css';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
}

export default function EvilEye({ eyeColor='#FFB000', intensity=1.5, pupilSize=0.6, irisWidth=0.25, glowIntensity=0.35, scale=0.8, noiseScale=1, pupilFollow=1, flameSpeed=1, backgroundColor='#06111f', lightMode=false }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer({ alpha:true, premultipliedAlpha:false });
    const gl = renderer.gl;
    gl.clearColor(0,0,0,0);
    const noiseData = new Uint8Array(256*256*4);
    for(let i=0;i<noiseData.length;i+=4){ const v=Math.floor(Math.random()*255); noiseData[i]=noiseData[i+1]=noiseData[i+2]=v; noiseData[i+3]=255; }
    const noiseTexture = new Texture(gl,{image:noiseData,width:256,height:256,generateMipmaps:false,flipY:false});
    noiseTexture.minFilter=gl.LINEAR; noiseTexture.magFilter=gl.LINEAR; noiseTexture.wrapS=gl.REPEAT; noiseTexture.wrapT=gl.REPEAT;
    const mouse={x:0,y:0,tx:0,ty:0};
    const onMove=e=>{const r=container.getBoundingClientRect();mouse.tx=((e.clientX-r.left)/r.width)*2-1;mouse.ty=-(((e.clientY-r.top)/r.height)*2-1)};
    const onLeave=()=>{mouse.tx=0;mouse.ty=0};
    container.addEventListener('mousemove',onMove); container.addEventListener('mouseleave',onLeave);
    const vertex=`attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0,1);}`;
    const fragment=`precision highp float;uniform float uTime;uniform vec3 uResolution;uniform sampler2D uNoiseTexture;uniform float uPupilSize;uniform float uIrisWidth;uniform float uGlowIntensity;uniform float uIntensity;uniform float uScale;uniform float uNoiseScale;uniform vec2 uMouse;uniform float uPupilFollow;uniform float uFlameSpeed;uniform vec3 uEyeColor;uniform vec3 uBgColor;void main(){vec2 uv=(gl_FragCoord.xy*2.0-uResolution.xy)/uResolution.y;uv/=uScale;float ft=uTime*uFlameSpeed;float d=length(uv);float mask=1.0-d;vec2 p=uv-uMouse*uPupilFollow*.12;float pupil=clamp(1.0-length(p*vec2(9.0,2.3)),0.0,1.0)*uPupilSize/.35;float n=texture2D(uNoiseTexture,(uv+vec2(ft*.03,ft*.02))*uNoiseScale*.5).r;float iris=smoothstep(.78,.42,mask)+smoothstep(.48,.16,mask)*.65+n*.25;float glow=pow(max(0.0,1.0-d),2.0)*uGlowIntensity;float energy=max(0.0,iris+glow-pupil)*uIntensity;vec3 c=uBgColor+uEyeColor*energy;float vignette=smoothstep(1.5,.15,d);c=mix(uBgColor,c,vignette);gl_FragColor=vec4(c,1.0);}`;
    let program;
    const resize=()=>{renderer.setSize(container.offsetWidth,container.offsetHeight);if(program)program.uniforms.uResolution.value=[gl.canvas.width,gl.canvas.height,gl.canvas.width/gl.canvas.height]};
    window.addEventListener('resize',resize); resize();
    program=new Program(gl,{vertex,fragment,uniforms:{uTime:{value:0},uResolution:{value:[gl.canvas.width,gl.canvas.height,gl.canvas.width/gl.canvas.height]},uNoiseTexture:{value:noiseTexture},uPupilSize:{value:pupilSize},uIrisWidth:{value:irisWidth},uGlowIntensity:{value:glowIntensity},uIntensity:{value:intensity},uScale:{value:scale},uNoiseScale:{value:noiseScale},uMouse:{value:[0,0]},uPupilFollow:{value:pupilFollow},uFlameSpeed:{value:flameSpeed},uEyeColor:{value:hexToVec3(eyeColor)},uBgColor:{value:hexToVec3(backgroundColor)}}});
    const mesh=new Mesh(gl,{geometry:new Triangle(gl),program}); container.appendChild(gl.canvas); let raf;
    const update=t=>{raf=requestAnimationFrame(update);mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;program.uniforms.uMouse.value=[mouse.x,mouse.y];program.uniforms.uTime.value=t*.001;renderer.render({scene:mesh})}; raf=requestAnimationFrame(update);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);container.removeEventListener('mousemove',onMove);container.removeEventListener('mouseleave',onLeave);if(gl.canvas.parentNode===container)container.removeChild(gl.canvas);gl.getExtension('WEBGL_lose_context')?.loseContext()};
  },[eyeColor,intensity,pupilSize,irisWidth,glowIntensity,scale,noiseScale,pupilFollow,flameSpeed,backgroundColor,lightMode]);
  return <div ref={containerRef} className="evil-eye-container" />;
}
