/* LW-D D0: genuinely rendered WebGL2 3D scene, no remote libraries, no saving/AI. */
(function(){
"use strict";
const Demo=globalThis.TrialumLivingWorldDemo;
if(!Demo)return;

const embeddedLive=new URLSearchParams(location.search).get("live")==="1"&&window.parent!==window;
let parentVisible=true;
let pauseRenderer=()=>{},resumeRenderer=()=>{};
const canRender=()=>!document.hidden&&parentVisible&&(embeddedLive||document.hasFocus());
window.addEventListener("message",event=>{
 if(!embeddedLive||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=="trialum:lw:visibility")return;
 parentVisible=Boolean(event.data.visible);
 if(parentVisible)resumeRenderer();else pauseRenderer();
});
const $=id=>document.getElementById(id);
const canvas=$("stage"), gl=canvas.getContext("webgl2",{alpha:false,antialias:true,powerPreference:"low-power"});
const fallback=$("noWebGL");
if(!gl){
  // Genuine 2D compatibility renderer. No AI, networking, saves, or background loop.
  const ctx=canvas.getContext("2d");
  let state=Demo.initial(),handle=0,yaw=.2,lastFrame=0;
  const titles={lab:["Лабораторија на животот","Менувај ги условите и види резултат."],
    flora:["Градина на новите форми","Набљудувај го растот на измислената флора."],
    biosphere:["Биосвет што живее","Истражувај го необичниот живот во твојот свет."],
    research:["Центар за откритија","Учењето е награда за секој експеримент."]};
  const stop=()=>{if(handle)cancelAnimationFrame(handle);handle=0;};
  function update(){
    $("insight").textContent=state.insight;$("trials").textContent=state.trials;
    $("sceneTitle").textContent=titles[state.scene][0];$("sceneDescription").textContent=titles[state.scene][1];
    for(const n of ["temperature","water","light"]){$(n).value=state[n];$(n+"Val").textContent=state[n];}
    document.querySelectorAll("[data-scene]").forEach(b=>{
      const selected=b.dataset.scene===state.scene;
      b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected));
    });
    $("controlPanel").hidden=state.scene!=="lab";
    if(state.log.length){$("outcomeTitle").textContent=state.log[0].title;$("outcomeText").textContent=state.log[0].science;}
  }
  function ellipse(x,y,rx,ry,color){
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  }
  function paint(now){
    if(!canRender()){stop();return;}
    handle=requestAnimationFrame(paint);
    if(now-lastFrame<40)return;lastFrame=now;
    const ratio=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const midX=w*.53+Math.sin(yaw)*w*.035,midY=h*.58,p=Math.min(w,h)/6,step=matchMedia("(prefers-reduced-motion: reduce)").matches?0:now/1000;
    ctx.clearRect(0,0,w,h);
    const bg=ctx.createRadialGradient(midX,midY,5,midX,midY,w*.9);
    bg.addColorStop(0,"#17656c");bg.addColorStop(.6,"#10384a");bg.addColorStop(1,"#071729");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ellipse(midX,midY+p*.62,p*3.3,p*.8,"#0b2236");
    ellipse(midX,midY+p*.36,p*3.2,p*.76,state.scene==="flora"?"#276754":state.scene==="biosphere"?"#2c7878":"#296574");
    ellipse(midX,midY+p*.17,p*3,p*.67,"#3d8383");
    if(state.scene==="lab"){
      ellipse(midX,midY+p*.20,p*1.2,p*.48,"#193e55");
      ellipse(midX,midY-p*.17,p*.9,p*.27,"#659b98");
      const cy=midY-p*.53+Math.sin(step*1.4)*p*.08;
      const hue=175+state.temperature*.7;
      const glow=ctx.createRadialGradient(midX-p*.22,cy-p*.23,1,midX,cy,p*.87);
      glow.addColorStop(0,"#e1ffdc");glow.addColorStop(.34,"hsl("+hue+" 86% 66%)");glow.addColorStop(1,"#247f98");
      ellipse(midX,cy,p*.68,p*.68,glow);
      for(let i=0;i<10;i++){const a=i*Math.PI/5+step*.30;ellipse(midX+Math.cos(a)*p*1.34,cy+Math.sin(a)*p*.53,p*.055,p*.055,"#ffe6a1");}
      for(const dx of [-2.35,2.35]){
        ctx.fillStyle="#2a7083";ctx.fillRect(midX+dx*p-p*.38,midY-p*.68,p*.76,p*.9);
        ellipse(midX+dx*p,midY-p*.73,p*.43,p*.19,"#9be8df");
      }
    }else if(state.scene==="flora"){
      for(let i=0;i<8;i++){const x=midX+Math.sin(i*2.5)*p*2.25,y=midY+(i%3)*p*.22;
        ctx.strokeStyle="#8de0af";ctx.lineWidth=p*.07;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-p*.98);ctx.stroke();
        ellipse(x-p*.19,y-p*.67,p*.33,p*.13,"#43a77b");ellipse(x+p*.19,y-p*.47,p*.3,p*.13,"#a1e4ad");
        ellipse(x,y-p*.98,p*.20,p*.26,"#c6f6a3");
      }
    }else if(state.scene==="biosphere"){
      for(let i=0;i<5;i++){const x=midX+(i-2)*p*.91,y=midY+(i%2)*p*.45-Math.sin(step+i)*p*.06;
        ellipse(x,y,p*.38,p*.38,["#84c9d8","#8de7c4","#f2c1c0","#d5c2fa","#f3db9b"][i]);
        ellipse(x-p*.12,y-p*.06,p*.07,p*.07,"#143348");ellipse(x+p*.12,y-p*.06,p*.07,p*.07,"#143348");
      }
    }else{
      for(let i=0;i<7;i++){const a=i*6.283/7+step*.08,x=midX+Math.cos(a)*p*2,y=midY-p*.40+Math.sin(a)*p*.65;
        ellipse(x,y,p*.22,p*.31,"#9fd6e8");ellipse(x,y-p*.32,p*.12,p*.15,"#f3ebaa");
      }
      ellipse(midX,midY-p*.4,p*.8,p*.8,"#95dfdf");
    }
  }
  function resume(){if(!handle&&canRender())handle=requestAnimationFrame(paint);}
  for(const b of document.querySelectorAll("[data-scene]"))b.addEventListener("click",()=>{state=Demo.setScene(state,b.dataset.scene);update();});
  for(const n of ["temperature","water","light"])$(n).addEventListener("input",e=>{state=Demo.setParam(state,n,Number(e.target.value));update();});
  $("runExperiment").addEventListener("click",()=>{state=Demo.runExperiment(state);update();});
  $("togglePanel").addEventListener("click",()=>{const hidden=$("controlPanel").classList.toggle("collapsed");$("togglePanel").setAttribute("aria-expanded",String(!hidden));});
  canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(e.buttons)yaw+=e.movementX*.01;});
  document.addEventListener("visibilitychange",()=>document.hidden?stop():resume());
  window.addEventListener("blur",()=>{if(!embeddedLive)stop();});window.addEventListener("focus",resume);window.addEventListener("pagehide",stop);
  fallback.hidden=true;
  const banner=document.querySelector(".scene-type .pill");if(banner)banner.textContent="D0 · 2D Fallback";
  pauseRenderer=stop;resumeRenderer=resume;update();resume();return;
}
let liveStats=null;
globalThis.addEventListener("trialum:lw:real-world",event=>{
 const d=event.detail||{};
 const numeric=name=>Math.max(0,Math.min(10000,Number.isFinite(Number(d[name]))?Number(d[name]):0));
 liveStats={compounds:numeric("compounds"),insight:numeric("insight"),pets:numeric("pets"),biomass:numeric("biomass")};
});
let s=Demo.initial(), program=null, cube=null, sphere=null, uVP=null,uModel=null,uTint=null,uGlow=null;
let yaw=.68,elevation=.42,distance=11,dragX=null,raf=0,last=0,lastPaint=0,burstAt=0,healthy=true,viewProjection=null,renderCount=0;
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const sceneTitles={
lab:["Лабораторија на животот","Менувај ги условите и гледај како се менува фиктивниот примерок."],
flora:["Градина на новите форми","Погледни ги промените на флората во твојот биосвет."],
biosphere:["Биосвет што живее","Посматрај автономен мал свет на измислени суштества."],
research:["Центар за откритија","Секој експеримент носи ново знаење — и кога не успева."]
};
function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
function initGL(){
const vertex="#version 300 es\nlayout(location=0) in vec3 pos;layout(location=1) in vec3 normal;uniform mat4 vp;uniform mat4 model;out vec3 n;out vec3 point;void main(){vec4 p=model*vec4(pos,1.0);point=p.xyz;n=mat3(model)*normal;gl_Position=vp*p;}";
const fragment="#version 300 es\nprecision mediump float;in vec3 n;in vec3 point;uniform vec3 tint;uniform float glow;out vec4 color;void main(){float lit=max(dot(normalize(n),normalize(vec3(-0.4,0.9,0.65))),0.0);float sparkle=pow(max(dot(normalize(n),vec3(0.1,0.95,0.3)),0.0),9.0);vec3 rgb=tint*(0.29+0.71*lit)+glow*vec3(0.10,0.28,0.24)+vec3(sparkle*0.10);color=vec4(rgb,1.0);}";
program=gl.createProgram();
const vs=shader(gl.VERTEX_SHADER,vertex), fs=shader(gl.FRAGMENT_SHADER,fragment);
gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
uVP=gl.getUniformLocation(program,"vp");uModel=gl.getUniformLocation(program,"model");
uTint=gl.getUniformLocation(program,"tint");uGlow=gl.getUniformLocation(program,"glow");
cube=makeCube();sphere=makeSphere(14,20);
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);
}
function makeMesh(vertices,indices){
const vao=gl.createVertexArray();gl.bindVertexArray(vao);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
const element=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,element);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
gl.bindVertexArray(null);return{vao,count:indices.length};
}
function makeCube(){
const corners=[
{n:[0,0,1],p:[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]},
{n:[0,0,-1],p:[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]},
{n:[1,0,0],p:[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]},
{n:[-1,0,0],p:[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]},
{n:[0,1,0],p:[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]},
{n:[0,-1,0],p:[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]}
];
const v=[],inds=[];for(const face of corners){const start=v.length/6;for(const p of face.p)v.push(...p,...face.n);inds.push(start,start+1,start+2,start,start+2,start+3);}return makeMesh(v,inds);
}
function makeSphere(lat,lon){
const v=[],ids=[];for(let i=0;i<=lat;i++){const a=Math.PI*i/lat;for(let j=0;j<=lon;j++){const b=2*Math.PI*j/lon;const x=Math.sin(a)*Math.cos(b),y=Math.cos(a),z=Math.sin(a)*Math.sin(b);v.push(x,y,z,x,y,z);}}
for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){const a=i*(lon+1)+j,b=a+lon+1;ids.push(a,b,a+1,b,b+1,a+1);}return makeMesh(v,ids);
}
function multiply(a,b){const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++){let n=0;for(let k=0;k<4;k++)n+=a[k*4+i]*b[j*4+k];c[j*4+i]=n;}return c;}
function perspective(fov,ratio,near,far){
const f=1/Math.tan(fov/2),nf=1/(near-far);
return new Float32Array([f/ratio,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,(2*far*near)*nf,0]);
}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function norm(v){const d=Math.hypot(...v)||1;return v.map(x=>x/d);}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function lookAt(eye,target){
const f=norm(target.map((x,i)=>x-eye[i])),side=norm(cross(f,[0,1,0])),up=cross(side,f);
return new Float32Array([side[0],up[0],-f[0],0,side[1],up[1],-f[1],0,side[2],up[2],-f[2],0,-dot(side,eye),-dot(up,eye),dot(f,eye),1]);
}
function modelMatrix(x,y,z,sx,sy,sz,r){const c=Math.cos(r),n=Math.sin(r);return new Float32Array([c*sx,0,-n*sx,0,0,sy,0,0,n*sz,0,c*sz,0,x,y,z,1]);}
function draw(mesh,x,y,z,sx,sy,sz,angle,rgb,glow=0){
gl.uniformMatrix4fv(uModel,false,modelMatrix(x,y,z,sx,sy,sz,angle));
gl.uniform3fv(uTint,rgb);gl.uniform1f(uGlow,glow);
gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);
}
function scene(t){
const mode=s.scene,bounce=Math.sin(t*1.7),swirl=t*.22;
const ground=mode==="flora"?[.075,.32,.26]:mode==="biosphere"?[.11,.35,.33]:[.11,.26,.34];
draw(cube,0,-1.46,0,3.85,.20,2.55,0,[.06,.13,.23]);
draw(cube,0,-1.17,0,3.56,.095,2.36,0,ground,.08);
for(let i=0;i<12;i++){
const a=i*Math.PI*2/12;
draw(sphere,Math.cos(a)*3.38,-.99,Math.sin(a)*2.13,.045,.07,.045,0,[.32,.98,.75],.3);
}
if(mode==="lab"){
draw(cube,0,-.84,0,1.36,.27,1.22,0,[.22,.43,.48]);
draw(cube,0,-.47,0,1.03,.13,.92,0,[.24,.62,.58]);
draw(sphere,0,.55+bounce*.075,0,.68,.68,.68,t,[.12+s.temperature/420,.45+s.water/400,.40+s.light/400],.4);
draw(sphere,0,.55+bounce*.075,0,.40,.40,.40,0,[.28,.91,.79],.45);
if(liveStats)draw(sphere,0,1.42+bounce*.04,0,.08+.006*Math.min(15,liveStats.insight),.08+.006*Math.min(15,liveStats.insight),.08+.006*Math.min(15,liveStats.insight),0,[.95,.78,.35],.35);
const moleculeCount=liveStats?Math.max(3,Math.min(16,3+Math.floor(liveStats.compounds/5))):8;
for(let i=0;i<moleculeCount;i++){const a=i*Math.PI*2/moleculeCount+swirl;draw(sphere,Math.cos(a)*1.48,.59+Math.sin(a*2)*.2,Math.sin(a)*1.13,.10,.10,.10,a,[.78,.93,.65],.7);}
for(const x of [-2.3,2.3]){
draw(cube,x,-.39,0,.53,.85,.70,0,[.13,.34,.48]);
draw(sphere,x,.54,0,.45,.35,.45,0,[.24,.75,.81],.3);
draw(cube,x,.02,.48,.30,.13,.15,0,[.78,.74,.43],.15);
}
}else if(mode==="flora"){
for(let i=0;i<9;i++){
const x=((i%3)-1)*1.8,z=(Math.floor(i/3)-1)*1.34;
const rise=.58+(i%3)*.24;
draw(cube,x,-.45,z,.075,rise,.075,0,[.27,.58,.34]);
for(let k=0;k<4;k++){const a=k*Math.PI*.5+t*.08;
draw(sphere,x+Math.cos(a)*.42,-.10+(k%2)*.33,z+Math.sin(a)*.30,.42,.13,.21,-a,[.18+.07*(i%3),.64,.36],.2);}
draw(sphere,x,.28+rise*.31+bounce*.04,z,.19,.31,.19,0,[.75,.89,.41],.1);
}
}else if(mode==="biosphere"){
const visiblePets=liveStats?Math.min(6,Math.floor(liveStats.pets)):4;
for(let i=0;i<visiblePets;i++){
const a=i*Math.PI*2/Math.max(visiblePets,1)+.35,px=Math.cos(a)*1.78,pz=Math.sin(a)*1.15;
draw(sphere,px,-.58+Math.sin(t+i)*.12,pz,.42,.43,.42,t*.25+i,[.31+i*.07,.76-i*.1,.70],.25);
draw(sphere,px-.17,-.41+Math.sin(t+i)*.12,pz+.33,.085,.12,.095,0,[.97,.96,.93]);
draw(sphere,px+.17,-.41+Math.sin(t+i)*.12,pz+.33,.085,.12,.095,0,[.97,.96,.93]);
}
for(let i=0;i<6;i++){
const a=i*6.28/6,px=Math.cos(a)*2.8,pz=Math.sin(a)*1.9;
draw(cube,px,-.53,pz,.08,.57,.08,0,[.25,.61,.40]);
draw(sphere,px,.12,pz,.55,.63,.55,t*.02,[.17,.60,.39],.13);
}
}else{
for(let i=0;i<5;i++){
const a=i*6.28/5,px=Math.cos(a)*1.95,pz=Math.sin(a)*1.26,h=.45+(i%3)*.30;
draw(cube,px,-.45+h*.3,pz,.23,h,.23,t*.18+i,[.35,.67,.83],.35);
draw(sphere,px,.35+h*.48+Math.sin(t+i)*.12,pz,.25,.25,.25,0,[.71,.79,.97],.5);
}
draw(sphere,0,.24+Math.sin(t*1.1)*.08,0,.88,.88,.88,t*.4,[.28,.72,.87],.4);
}
}
function resize(){
const ratio=Math.min(2,devicePixelRatio||1);
const w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
gl.viewport(0,0,w,h);
const eye=[Math.sin(yaw)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(yaw)*Math.cos(elevation)*distance];
viewProjection=multiply(perspective(Math.PI/4.2,w/h,.1,100),lookAt(eye,[0,-.1,0]));
}
function paint(now){
if(!healthy||!canRender()){stop();return;}
raf=requestAnimationFrame(paint);
const frameTime=reduced.matches?120:30;
if(now-lastPaint<frameTime)return;
lastPaint=now;
resize();gl.clearColor(.018,.062,.10,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.useProgram(program);gl.uniformMatrix4fv(uVP,false,viewProjection);
scene(reduced.matches?0:now/1000);renderCount++;
}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
function resume(){if(!healthy||!canRender()||raf)return;raf=requestAnimationFrame(paint);}
function ui(){
$("insight").textContent=s.insight;$("trials").textContent=s.trials;
$("sceneTitle").textContent=sceneTitles[s.scene][0];
$("sceneDescription").textContent=sceneTitles[s.scene][1];
for(const n of ["temperature","water","light"]){$(n).value=s[n];$(n+"Val").textContent=s[n];}
document.querySelectorAll("[data-scene]").forEach(b=>{const active=b.dataset.scene===s.scene;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
$("controlPanel").hidden=s.scene!=="lab";
if(s.log.length){$("outcomeTitle").textContent=s.log[0].title;$("outcomeText").textContent=s.log[0].science;}
}
for(const b of document.querySelectorAll("[data-scene]"))b.addEventListener("click",()=>{s=Demo.setScene(s,b.dataset.scene);ui();});
for(const n of ["temperature","water","light"])$(n).addEventListener("input",e=>{s=Demo.setParam(s,n,Number(e.target.value));ui();});
$("runExperiment").addEventListener("click",()=>{s=Demo.runExperiment(s);burstAt=performance.now();ui();});
$("togglePanel").addEventListener("click",()=>{const panel=$("controlPanel"),collapse=panel.classList.toggle("collapsed");$("togglePanel").setAttribute("aria-expanded",String(!collapse));});
canvas.addEventListener("pointerdown",e=>{dragX=e.clientX;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(dragX===null)return;const diff=e.clientX-dragX;dragX=e.clientX;yaw+=diff*.008;});
canvas.addEventListener("pointerup",()=>{dragX=null;});
canvas.addEventListener("pointercancel",()=>{dragX=null;});
canvas.addEventListener("wheel",e=>{e.preventDefault();distance=Math.max(7,Math.min(15,distance+e.deltaY*.009));},{passive:false});
document.addEventListener("visibilitychange",()=>document.hidden?stop():resume());
window.addEventListener("pagehide",stop);
window.addEventListener("blur",()=>{if(!embeddedLive)stop();});window.addEventListener("focus",resume);
window.addEventListener("resize",resize);
canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();healthy=false;stop();});
canvas.addEventListener("webglcontextrestored",()=>{healthy=true;initGL();resize();resume();});
try{initGL();pauseRenderer=stop;resumeRenderer=resume;ui();resize();resume();}catch(e){healthy=false;stop();fallback.hidden=false;fallback.textContent="WebGL2 прототипот не може да се стартува: "+String(e.message).slice(0,130);}
})();
