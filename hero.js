/* =============================================================================
   BLOCKZILLA — "The Eternal Ledger"
   A full-screen WebGL scene: a vast futuristic space plane holding a neon
   blockchain/AI cityscape under streaming glyph-rain, wrapped in a deep-space
   skybox so the world feels endless. The word BLOCKZILLA floats mid-scene.

   Controls (custom fly/orbit rig):
     • drag (mouse / trackpad click-drag) ....... look / steer
     • WASD or arrows ........................... fly (moves where you look —
                                                  so dragging while holding
                                                  forward steers the movement)
     • pinch (trackpad) / two-finger (touch) .... zoom in / out
     • idle ..................................... slow cinematic auto-tour that
                                                  drifts and eases to new vantage
                                                  points over time

   Perf: capped DPR + ~32fps render + single rAF loop, pauses when the hero is
   scrolled away or the tab is hidden, integrated-GPU friendly.
============================================================================= */
import * as THREE from 'three';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ---- palette -------------------------------------------------------------- */
const C = {
  bg:    new THREE.Color('#05070a'),
  green: new THREE.Color('#1CF09A'),
  teal:  new THREE.Color('#0EA5A0'),
  cyan:  new THREE.Color('#5BE9FF'),
  pale:  new THREE.Color('#BFEFD9'),
};
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const canvas  = document.getElementById('bg');
const MOBILE  = Math.min(innerWidth, innerHeight) < 720;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- renderer (integrated-GPU friendly, capped DPR) ----------------------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'default' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.3 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ---- scene + fog (lighter, so the world reads as vast) -------------------- */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(C.bg.getHex(), 0.0062);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000);

scene.add(new THREE.AmbientLight(0x18324a, 0.6));
const key = new THREE.DirectionalLight(0x2a6f6a, 0.8);
key.position.set(40, 80, 20); scene.add(key);

/* =============================================================================
   SKYBOX — deep-space gradient sphere with faint nebula + horizon glow.
   fog:false so it always reads as the distant sky the city fades into.
============================================================================= */
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1800, 40, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){ vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      precision highp float; varying vec3 vDir; uniform float uTime;
      float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=.5;} return v; }
      void main(){
        float h = clamp(vDir.y*0.5+0.5, 0.0, 1.0);
        vec3 top = vec3(0.010,0.016,0.028);
        vec3 hor = vec3(0.020,0.070,0.058);
        vec3 col = mix(hor, top, smoothstep(0.34, 0.95, h));
        col += vec3(0.0,0.11,0.075) * smoothstep(0.34,0.0,abs(h-0.33)) * 0.55;   // horizon band
        float neb = fbm(vDir.xz*3.0 + vDir.y*2.0 + uTime*0.006);
        col += vec3(0.03,0.075,0.06) * smoothstep(0.42,0.95,h) * (neb*neb) * 0.9; // nebula
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
);
scene.add(sky);

/* =============================================================================
   GROUND — "infinite" glowing grid plane, crisp via shader, fading to fog,
   with a slow pulse rippling outward.
============================================================================= */
const groundMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: { uTime: { value: 0 }, uGreen: { value: C.green }, uCyan: { value: C.cyan } },
  vertexShader: /* glsl */`
    varying vec3 vWorld;
    void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */`
    precision highp float; varying vec3 vWorld;
    uniform float uTime; uniform vec3 uGreen, uCyan;
    float gridLine(vec2 p, float s){ vec2 c=p/s; vec2 g=abs(fract(c-0.5)-0.5)/fwidth(c);
      return 1.0 - min(min(g.x,g.y),1.0); }
    void main(){
      vec2 p = vWorld.xz; float dist = length(p);
      float g = clamp(gridLine(p,4.0)*0.5 + gridLine(p,24.0), 0.0, 1.0);
      float ring = smoothstep(6.0,0.0, abs(mod(dist*0.35 - uTime*6.0, 120.0) - 60.0) - 2.0);
      vec3 col = mix(uGreen, uCyan, smoothstep(0.0, 340.0, dist)) + uCyan*ring*0.6;
      float fade = 1.0 - smoothstep(80.0, 520.0, dist);
      float centre = smoothstep(6.0, 60.0, dist);
      float a = g*fade*centre;
      if (a < 0.01) discard;
      gl_FragColor = vec4(col*(0.6+ring), a);
    }`,
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2200, 2200), groundMat);
ground.rotation.x = -Math.PI/2; ground.position.y = -0.02;
scene.add(ground);

/* =============================================================================
   CITYSCAPE — instanced towers with lit-window facades. Spread wide & tall so
   the plane feels massive; centre kept clear for the floating wordmark.
============================================================================= */
function facadeTexture(){
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#02040a'; g.fillRect(0,0,64,128);
  for (let y=6; y<128; y+=9) for (let x=6; x<64; x+=11){
    const r = Math.random(); if (r < 0.34) continue;
    g.fillStyle = r > 0.86 ? '#7dffd0' : `rgba(28,240,154,${0.18+Math.random()*0.5})`;
    g.fillRect(x, y, 6, 5);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const facade = facadeTexture();
const COUNT = MOBILE ? 260 : 560;
const cityMat = new THREE.MeshStandardMaterial({
  color: 0x05080d, roughness: 0.55, metalness: 0.4,
  emissive: 0xffffff, emissiveMap: facade, emissiveIntensity: 1.3, map: facade,
});
const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), cityMat, COUNT);
const dummy = new THREE.Object3D(), tint = new THREE.Color();
for (let i=0; i<COUNT; i++){
  const ang = Math.random()*Math.PI*2;
  const rad = 44 + Math.pow(Math.random(), 0.7) * 430;
  const x = Math.cos(ang)*rad + (Math.random()-0.5)*14;
  const z = Math.sin(ang)*rad + (Math.random()-0.5)*14;
  const w = 3 + Math.random()*7, d = 3 + Math.random()*7;
  const h = 6 + Math.pow(Math.random(), 2.1) * (rad > 160 ? 92 : 50);
  dummy.position.set(x, h/2, z);
  dummy.scale.set(w, h, d);
  dummy.rotation.y = (Math.random()*4|0) * Math.PI/2;
  dummy.updateMatrix(); city.setMatrixAt(i, dummy.matrix);
  const t = Math.random();
  tint.copy(t>0.8 ? C.cyan : t>0.5 ? C.green : C.teal).multiplyScalar(0.5 + Math.random()*0.6);
  city.setColorAt(i, tint);
}
city.instanceMatrix.needsUpdate = true;
scene.add(city);

/* =============================================================================
   FLOATING ELEMENTS — brand icosahedra + an AI node-graph.
============================================================================= */
const floaters = new THREE.Group(); scene.add(floaters);
const icoGeo = new THREE.IcosahedronGeometry(1, 0);
for (let i=0; i<(MOBILE?5:9); i++){
  const m = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({
    color: i%2 ? C.cyan : C.green, wireframe: true, transparent: true, opacity: 0.7 }));
  m.scale.setScalar(2 + Math.random()*4.5);
  m.position.set((Math.random()-0.5)*240, 20 + Math.random()*90, (Math.random()-0.5)*240);
  m.userData.spin = (Math.random()-0.5)*0.4; m.userData.bob = Math.random()*Math.PI*2;
  floaters.add(m);
}
const nodes = [], nodeGeo = new THREE.OctahedronGeometry(1.1, 0);
const nodeMat = new THREE.MeshBasicMaterial({ color: C.pale });
for (let i=0; i<(MOBILE?10:18); i++){
  const n = new THREE.Mesh(nodeGeo, nodeMat);
  n.position.set((Math.random()-0.5)*180, 30 + Math.random()*70, (Math.random()-0.5)*180);
  nodes.push(n); floaters.add(n);
}
const linkPos = [];
for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++)
  if (nodes[i].position.distanceTo(nodes[j].position) < 74)
    linkPos.push(nodes[i].position.x,nodes[i].position.y,nodes[i].position.z,
                 nodes[j].position.x,nodes[j].position.y,nodes[j].position.z);
const linkGeo = new THREE.BufferGeometry();
linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
floaters.add(new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
  color: C.green, transparent: true, opacity: 0.26 })));

/* =============================================================================
   GLYPH RAIN — katakana / latin / crypto+AI symbols / reversed chars.
   Each column streams down AND drifts along a slow random arc + sway. Fog keeps
   distant columns hazy, so the field reads with depth/blur.
============================================================================= */
const GLYPHS = ('アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
  + 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789₿Ξ⟠⛓◇◆△▽#{}<>/\\|=+*').split('');
function glyphStrip(rows, reversed){
  const cell = 40, cv = document.createElement('canvas');
  cv.width = cell; cv.height = cell*rows;
  const g = cv.getContext('2d');
  g.font = '600 28px "IBM Plex Mono", monospace';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (reversed){ g.translate(cell,0); g.scale(-1,1); }
  for (let r=0; r<rows; r++){
    const lead = r > rows-4, a = lead ? 1.0 : 0.28 + (r/rows)*0.55;
    g.fillStyle = lead ? `rgba(200,255,230,${a})` : `rgba(28,240,154,${a})`;
    g.fillText(GLYPHS[(Math.random()*GLYPHS.length)|0], cell/2, r*cell + cell/2);
  }
  const t = new THREE.CanvasTexture(cv); t.wrapT = THREE.RepeatWrapping; return t;
}
const rainGroup = new THREE.Group(); scene.add(rainGroup);
const columns = [];
const COLN = MOBILE ? 34 : 68;
for (let i=0; i<COLN; i++){
  const rows = 18 + (Math.random()*14|0), reversed = Math.random()<0.32;
  const tex = glyphStrip(rows, reversed);
  const h = 26 + Math.random()*30;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(h*(1/rows)*1.6, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  plane.rotation.order = 'YXZ';
  plane.userData = {
    tex, speed: 0.05 + Math.random()*0.14,
    bx: (Math.random()-0.5)*380, by: 12 + Math.random()*80, bz: (Math.random()-0.5)*380,
    ax: 6 + Math.random()*22, az: 6 + Math.random()*22,      // arc amplitudes
    fx: 0.05 + Math.random()*0.09, ph: Math.random()*Math.PI*2, // slow arc freq/phase
  };
  columns.push(plane); rainGroup.add(plane);
}

/* ---- fine rain streaks ---------------------------------------------------- */
const DROPS = MOBILE ? 500 : 1200;
const dropGeo = new THREE.BufferGeometry();
const dpos = new Float32Array(DROPS*6), dvel = new Float32Array(DROPS);
for (let i=0; i<DROPS; i++){
  const x=(Math.random()-0.5)*520, z=(Math.random()-0.5)*520, y=Math.random()*200;
  const len = 1.4 + Math.random()*3.2;
  dpos[i*6]=x; dpos[i*6+1]=y; dpos[i*6+2]=z; dpos[i*6+3]=x; dpos[i*6+4]=y-len; dpos[i*6+5]=z;
  dvel[i] = 0.5 + Math.random()*1.4;
}
dropGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
const rain = new THREE.LineSegments(dropGeo, new THREE.LineBasicMaterial({
  color: C.cyan, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending }));
scene.add(rain);

/* =============================================================================
   FLOATING WORDMARK — glowing BLOCKZILLA embedded mid-scene + ghosted echo.
============================================================================= */
function wordTexture(text){
  const w=2048, h=512, cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  const g = cv.getContext('2d');
  g.font = '800 220px "Chakra Petch","Arial Black",sans-serif';
  g.textAlign='center'; g.textBaseline='middle';
  g.shadowColor='#1CF09A'; g.shadowBlur=60; g.fillStyle='#EAFFF6';
  g.fillText(text, w/2, h/2+8);
  g.lineWidth=3; g.strokeStyle='rgba(91,233,255,0.9)'; g.strokeText(text, w/2, h/2+8);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const wordMat = new THREE.MeshBasicMaterial({ map: wordTexture('BLOCKZILLA'),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.92 });
const word = new THREE.Mesh(new THREE.PlaneGeometry(170, 42), wordMat);
word.position.set(0, 50, -34); scene.add(word);
const wordGhost = new THREE.Mesh(word.geometry, wordMat.clone());
wordGhost.material.opacity = 0.14; wordGhost.position.set(0, 50, -96);
wordGhost.scale.setScalar(1.7); scene.add(wordGhost);

/* ---- distant starfield (fog:false so it survives the haze) ---------------- */
const starGeo = new THREE.BufferGeometry();
const sp = new Float32Array(1400*3);
for (let i=0; i<1400; i++){
  const r = 900 + Math.random()*600, a = Math.random()*Math.PI*2, b = Math.random()*Math.PI;
  sp[i*3]=Math.sin(b)*Math.cos(a)*r; sp[i*3+1]=Math.abs(Math.cos(b))*r*0.5+40; sp[i*3+2]=Math.sin(b)*Math.sin(a)*r;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: C.pale, size: 1.4, transparent: true, opacity: 0.5, sizeAttenuation: false, fog: false })));

/* =============================================================================
   POST — bloom (desktop only), higher threshold so fewer pixels bloom (cheaper)
============================================================================= */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.6, 0.10);
if (!MOBILE) composer.addPass(bloom);

/* =============================================================================
   CUSTOM CONTROL RIG — orbit (drag) + fly (WASD, moves where you look) +
   pinch zoom, with a slow wandering auto-tour when idle.
============================================================================= */
const target = new THREE.Vector3(0, 30, 0);
const tgtGoal = target.clone();
let az = 0.6, pol = 1.05, rad = 150;               // current spherical (around target)
let azT = az, polT = pol, radT = rad;              // goals (drag/zoom/auto set these)
const POL_MIN = 0.24, POL_MAX = 1.46, RAD_MIN = 36, RAD_MAX = 420;

const vel = new THREE.Vector3();                   // fly velocity (damped)
const keys = {};
const MOVE_KEYS = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);

let lastInput = -999, dragging = false, px = 0, py = 0, simTime = 0, pinch = 0, touchN = 0;
const mark = () => { lastInput = simTime; };

addEventListener('keydown', e => { const k=e.key.toLowerCase();
  if (MOVE_KEYS.has(k)){ keys[k]=true; mark(); } });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// mouse / trackpad click-drag → look & steer (mouse pointers only; leaves touch
// scrolling free)
canvas.addEventListener('pointerdown', e => { if (e.pointerType==='touch') return;
  dragging=true; px=e.clientX; py=e.clientY; mark(); });
addEventListener('pointermove', e => { if (!dragging) return;
  azT -= (e.clientX-px)*0.005; polT = clamp(polT - (e.clientY-py)*0.005, POL_MIN, POL_MAX);
  px=e.clientX; py=e.clientY; mark(); });
addEventListener('pointerup', () => { dragging=false; });

// wheel: only pinch (ctrl+wheel on trackpads) zooms — plain scroll pages down
canvas.addEventListener('wheel', e => { if (!e.ctrlKey) return;
  radT = clamp(radT * Math.exp(e.deltaY*0.01), RAD_MIN, RAD_MAX); mark(); e.preventDefault(); },
  { passive: false });

// touch: two-finger pinch zooms; single-finger left free for page scroll
const tdist = t => Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY);
canvas.addEventListener('touchstart', e => { touchN=e.touches.length;
  if (touchN===2){ pinch=tdist(e.touches); mark(); } }, { passive: true });
canvas.addEventListener('touchmove', e => { if (e.touches.length===2){
  const d=tdist(e.touches); radT = clamp(radT * (pinch/d), RAD_MIN, RAD_MAX); pinch=d; mark();
  e.preventDefault(); } }, { passive: false });
canvas.addEventListener('touchend', e => { touchN=e.touches.length; }, { passive: true });

let autoTimer = 4, wasActive = false;
function updateControls(dt){
  const active = (simTime - lastInput < 3.2) || dragging ||
    keys['w']||keys['a']||keys['s']||keys['d'] ||
    keys['arrowup']||keys['arrowdown']||keys['arrowleft']||keys['arrowright'];

  // ---- fly: move the whole rig where the camera looks (drag steers it) ----
  let mf=0, ms=0;
  if (keys['w']||keys['arrowup'])    mf+=1;
  if (keys['s']||keys['arrowdown'])  mf-=1;
  if (keys['a']||keys['arrowleft'])  ms-=1;
  if (keys['d']||keys['arrowright']) ms+=1;
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
  const rightV = new THREE.Vector3().crossVectors(fwd, UP).normalize();
  const desired = new THREE.Vector3().addScaledVector(fwd, mf).addScaledVector(rightV, ms);
  if (desired.lengthSq()>0) desired.normalize().multiplyScalar(58);   // units/sec
  vel.lerp(desired, 1 - Math.pow(0.0009, dt));
  target.addScaledVector(vel, dt);
  target.y = clamp(target.y, 8, 130);

  // ---- idle auto-tour: slow drift + occasional eased jump to a new vantage --
  if (!active){
    if (wasActive){ azT=az; polT=pol; radT=rad; tgtGoal.copy(target); autoTimer=5; }
    azT += 0.028 * dt;                                     // gentle constant arc
    autoTimer -= dt;
    if (autoTimer <= 0){
      autoTimer = 9 + Math.random()*8;                    // 9–17s between moves
      azT += (Math.random()-0.5)*1.5;                     // small heading jump
      polT = 0.66 + Math.random()*0.55;
      radT = 96 + Math.random()*170;
      tgtGoal.set((Math.random()-0.5)*150, 22 + Math.random()*34, (Math.random()-0.5)*150);
    }
    target.lerp(tgtGoal, 1 - Math.pow(0.55, dt));
  }
  wasActive = active;

  // ---- ease current spherical toward goals (snappy when active, slow idle) --
  const k = active ? (1 - Math.pow(1e-4, dt)) : (1 - Math.pow(0.4, dt));
  az  += (azT - az) * k;
  pol  = clamp(pol + (polT - pol) * k, POL_MIN, POL_MAX);
  rad += (radT - rad) * k;

  const sinP = Math.sin(pol);
  camera.position.set(
    target.x + rad*sinP*Math.sin(az),
    target.y + rad*Math.cos(pol),
    target.z + rad*sinP*Math.cos(az));
  camera.lookAt(target);
  sky.position.copy(camera.position);   // sky follows so it stays "infinite"
}

/* =============================================================================
   RENDER LOOP — single rAF, ~32fps cap, pauses off-screen / tab-hidden
============================================================================= */
const clock = new THREE.Clock();
const FRAME_MIN = 1/32;
let onScreen = true, visible = true, looping = false, acc = 0;

function startLoop(){ if (looping || !onScreen || !visible) return; looping = true; clock.getDelta(); requestAnimationFrame(frame); }
function frame(){
  if (!onScreen || !visible){ looping = false; return; }
  requestAnimationFrame(frame);
  acc += Math.min(clock.getDelta(), 0.05);
  if (acc < FRAME_MIN) return;                 // throttle to the cap
  const dt = Math.min(acc, 0.05); acc = 0; simTime += dt;

  groundMat.uniforms.uTime.value = simTime;
  sky.material.uniforms.uTime.value = simTime;
  updateControls(dt);

  for (const c of columns){
    const u = c.userData;
    u.tex.offset.y = (u.tex.offset.y - u.speed*dt) % 1;
    c.position.set(
      u.bx + Math.sin(simTime*u.fx + u.ph) * u.ax,
      u.by + Math.sin(simTime*u.fx*0.5 + u.ph) * 3.0,
      u.bz + Math.cos(simTime*u.fx*0.8 + u.ph) * u.az);
    c.rotation.y = Math.atan2(camera.position.x - c.position.x, camera.position.z - c.position.z);
    c.rotation.z = Math.sin(simTime*0.2 + u.ph) * 0.16;    // slow sway
  }

  const arr = dropGeo.attributes.position.array;
  for (let i=0; i<DROPS; i++){
    const dy = dvel[i]*dt*40; arr[i*6+1]-=dy; arr[i*6+4]-=dy;
    if (arr[i*6+4] < 0){ const top=170+Math.random()*40, len=arr[i*6+1]-arr[i*6+4];
      arr[i*6+1]=top; arr[i*6+4]=top-len; }
  }
  dropGeo.attributes.position.needsUpdate = true;

  floaters.children.forEach(m => { if (m.userData.spin!==undefined){
    m.rotation.x += m.userData.spin*dt; m.rotation.y += m.userData.spin*dt*0.7;
    m.position.y += Math.sin(simTime*0.6 + m.userData.bob)*dt*1.3; } });
  word.position.y = 50 + Math.sin(simTime*0.5)*1.8;
  wordGhost.position.y = 50 + Math.sin(simTime*0.5+1)*2.4;

  composer.render();
}

const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window && hero){
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; startLoop(); },
    { threshold: 0.01 }).observe(hero);
}
document.addEventListener('visibilitychange', () => { visible = !document.hidden; startLoop(); });
startLoop();

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloom.setSize(innerWidth, innerHeight);
}, { passive: true });

document.documentElement.classList.add('webgl-ready');
