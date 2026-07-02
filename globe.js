/* =============================================================================
   BLOCKZILLA — Network globe
   A background WebGL layer for the #network section: a rotating, axis-tilted
   holographic planet with major data-center cities glowing at their real
   lat/long, and "transaction" packets arcing between them along great circles.

   Same universe as the hero — same deep-space skybox, accent palette (green→cyan),
   additive glow + bloom, ethereal sci-fi vibe. Sized to the section (not full
   screen) and paused when scrolled out of view so it costs nothing up top.
============================================================================= */
import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C = {
  bg:    new THREE.Color('#05070a'),
  green: new THREE.Color('#1CF09A'),
  teal:  new THREE.Color('#0EA5A0'),
  cyan:  new THREE.Color('#5BE9FF'),
  pale:  new THREE.Color('#BFEFD9'),
};
const canvas = document.getElementById('globe');
const host   = document.getElementById('network');
if (canvas && host) init();

function init(){
const MOBILE = Math.min(innerWidth, innerHeight) < 720;
const R = 100;

/* ---- renderer ------------------------------------------------------------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, alpha: true, powerPreference: 'default' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.3 : 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(C.bg.getHex(), 0.0016);
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 4000);
camera.position.set(0, 0, 300);

scene.add(new THREE.AmbientLight(0x1a3550, 0.7));
const key = new THREE.DirectionalLight(0x39a08f, 0.9);
key.position.set(-1, 0.6, 1); scene.add(key);

/* ---- skybox (shared look with the hero) ----------------------------------- */
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1900, 40, 24),
  new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `precision highp float; varying vec3 vDir; uniform float uTime;
      float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=.5;} return v; }
      void main(){ float h=clamp(vDir.y*0.5+0.5,0.,1.);
        vec3 top=vec3(0.010,0.016,0.028), hor=vec3(0.020,0.070,0.058);
        vec3 col=mix(hor,top,smoothstep(0.34,0.95,h));
        col+=vec3(0.0,0.11,0.075)*smoothstep(0.34,0.0,abs(h-0.33))*0.55;
        float neb=fbm(vDir.xz*3.0+vDir.y*2.0+uTime*0.006);
        col+=vec3(0.03,0.075,0.06)*smoothstep(0.42,0.95,h)*(neb*neb)*0.9;
        gl_FragColor=vec4(col,1.0);} `,
  })));

/* ---- starfield ------------------------------------------------------------ */
const starGeo = new THREE.BufferGeometry(); const sp = new Float32Array(900*3);
for (let i=0;i<900;i++){ const r=700+Math.random()*700, a=Math.random()*Math.PI*2, b=Math.random()*Math.PI;
  sp[i*3]=Math.sin(b)*Math.cos(a)*r; sp[i*3+1]=Math.cos(b)*r; sp[i*3+2]=Math.sin(b)*Math.sin(a)*r; }
starGeo.setAttribute('position', new THREE.BufferAttribute(sp,3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:C.pale, size:1.3,
  transparent:true, opacity:0.5, sizeAttenuation:false, fog:false })));

/* =============================================================================
   PLANET — tilted, offset lower-right so it reads as part of a larger world.
   planetTilt (axial tilt + world offset) > spinner (self-rotation) > contents
============================================================================= */
const planetTilt = new THREE.Group();
planetTilt.rotation.z = 0.41;                 // ~23.4° axial tilt
// partly out of frame lower-right on desktop; more centred & pulled back on mobile
if (MOBILE){ planetTilt.position.set(0, -R*0.15, 0); camera.position.z = 340; }
else       { planetTilt.position.set(R*0.34, -R*0.42, 0); }
scene.add(planetTilt);
const spinner = new THREE.Group(); planetTilt.add(spinner);

// solid dark core (occludes the far side of arcs/cities)
spinner.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 48),
  new THREE.MeshStandardMaterial({ color:0x04120e, roughness:0.9, metalness:0.1,
    emissive:0x03110d, emissiveIntensity:0.6 })));

// holographic surface dots (fibonacci sphere) — reads as a scanned planet
const DOTS = MOBILE ? 900 : 1900;
const dGeo = new THREE.BufferGeometry(); const dp = new Float32Array(DOTS*3);
const gr = Math.PI*(3-Math.sqrt(5));
for (let i=0;i<DOTS;i++){ const y=1-(i/(DOTS-1))*2, rr=Math.sqrt(1-y*y), th=gr*i;
  dp[i*3]=Math.cos(th)*rr*R*1.004; dp[i*3+1]=y*R*1.004; dp[i*3+2]=Math.sin(th)*rr*R*1.004; }
dGeo.setAttribute('position', new THREE.BufferAttribute(dp,3));
spinner.add(new THREE.Points(dGeo, new THREE.PointsMaterial({ color:C.teal, size:1.1,
  transparent:true, opacity:0.20, sizeAttenuation:false, depthWrite:false })));

// graticule (lat/long grid)
const gLines = [];
function ll(lat, lon, rad){ const phi=(90-lat)*Math.PI/180, th=(lon+180)*Math.PI/180;
  return new THREE.Vector3(-rad*Math.sin(phi)*Math.cos(th), rad*Math.cos(phi), rad*Math.sin(phi)*Math.sin(th)); }
for (let lat=-60; lat<=60; lat+=30) for (let lon=-180; lon<180; lon+=6){
  gLines.push(ll(lat,lon,R*1.006), ll(lat,lon+6,R*1.006)); }
for (let lon=-180; lon<180; lon+=30) for (let lat=-84; lat<84; lat+=6){
  gLines.push(ll(lat,lon,R*1.006), ll(lat+6,lon,R*1.006)); }
const gGeo = new THREE.BufferGeometry().setFromPoints(gLines);
spinner.add(new THREE.LineSegments(gGeo, new THREE.LineBasicMaterial({
  color:C.green, transparent:true, opacity:0.06, depthWrite:false })));

// country outlines (Natural Earth 110m) — real landmasses in the green accent.
// Loaded from CDN; if offline the globe still works (graticule + dots remain).
(async function loadCountries(){
  try {
    const topojson = await import('https://cdn.jsdelivr.net/npm/topojson-client@3/+esm');
    const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json());
    const fc = topojson.feature(world, world.objects.countries);
    const verts = [];
    const addRing = ring => { for (let i=0;i<ring.length-1;i++){
      const a = ll(ring[i][1], ring[i][0], R*1.005), b = ll(ring[i+1][1], ring[i+1][0], R*1.005);
      verts.push(a.x,a.y,a.z, b.x,b.y,b.z); } };
    for (const f of fc.features){ const g = f.geometry; if (!g) continue;
      if (g.type==='Polygon') g.coordinates.forEach(addRing);
      else if (g.type==='MultiPolygon') g.coordinates.forEach(p => p.forEach(addRing)); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const land = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color:C.green, transparent:true, opacity:0.42, depthWrite:false, depthTest:true,
      blending:THREE.AdditiveBlending }));
    land.frustumCulled = false;
    spinner.add(land);
    start();   // ensure a frame renders once the outlines arrive
  } catch (e){ /* keep the dot/graticule globe if the CDN is unreachable */ }
})();

// atmosphere rim glow (fresnel, backside)
spinner.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.06, 48, 48),
  new THREE.ShaderMaterial({ side:THREE.BackSide, transparent:true, depthWrite:false,
    blending:THREE.AdditiveBlending, uniforms:{ uColor:{ value:C.cyan } },
    vertexShader:`varying vec3 vN,vV; void main(){ vN=normalize(normalMatrix*normal);
      vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz);
      gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying vec3 vN,vV; uniform vec3 uColor;
      void main(){ float f=pow(1.0-max(dot(vN,vV),0.0),3.2); gl_FragColor=vec4(uColor,f*0.9); }`,
  })));

// thin equatorial ring (sci-fi flourish)
const ring = new THREE.Mesh(new THREE.RingGeometry(R*1.4, R*1.42, 128),
  new THREE.MeshBasicMaterial({ color:C.cyan, transparent:true, opacity:0.16,
    side:THREE.DoubleSide, depthWrite:false, blending:THREE.AdditiveBlending }));
ring.rotation.x = Math.PI/2; spinner.add(ring);

/* ---- soft glow sprite texture (cities + packets) -------------------------- */
function glowTex(){ const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const g=cv.getContext('2d'); const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.25,'rgba(200,255,230,0.9)');
  gr.addColorStop(0.5,'rgba(28,240,154,0.35)'); gr.addColorStop(1,'rgba(28,240,154,0)');
  g.fillStyle=gr; g.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(cv); return t; }
const GLOW = glowTex();

/* ---- cities (major data-center hubs, real lat/long) ----------------------- */
const CITIES = [
  ['Ashburn',39.0,-77.5],['San Jose',37.3,-121.9],['Los Angeles',34.0,-118.2],
  ['Chicago',41.9,-87.6],['Dallas',32.8,-96.8],['Toronto',43.7,-79.4],
  ['São Paulo',-23.5,-46.6],['London',51.5,-0.1],['Dublin',53.3,-6.3],
  ['Amsterdam',52.4,4.9],['Frankfurt',50.1,8.7],['Paris',48.9,2.3],
  ['Stockholm',59.3,18.1],['Madrid',40.4,-3.7],['Dubai',25.2,55.3],
  ['Mumbai',19.1,72.9],['Singapore',1.35,103.8],['Hong Kong',22.3,114.2],
  ['Tokyo',35.7,139.7],['Seoul',37.6,127.0],['Sydney',-33.9,151.2],['Johannesburg',-26.2,28.1],
];
const cityVecs = [];
CITIES.forEach(([, lat, lon]) => {
  const v = ll(lat, lon, R).normalize();
  cityVecs.push(v);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:GLOW, color:C.pale,
    transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, depthTest:true }));
  s.position.copy(v.clone().multiplyScalar(R*1.01));
  s.scale.setScalar(7 + Math.random()*3);
  spinner.add(s);
});

/* =============================================================================
   TRANSACTION ARCS — great circles between cities with a bright packet pulse
   travelling head-first, same additive green→cyan language as the hero.
============================================================================= */
const ARC_N = MOBILE ? 16 : 30;
const SEG = 64;
const arcs = [];
function slerpArc(a, b){
  const om = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  const so = Math.sin(om) || 1e-4;
  const lift = 0.14 + (om / Math.PI) * 0.46;         // longer hops arc higher
  const pts = [], len = new Float32Array(SEG+1);
  for (let i=0;i<=SEG;i++){ const t=i/SEG;
    const p = a.clone().multiplyScalar(Math.sin((1-t)*om)/so)
                .add(b.clone().multiplyScalar(Math.sin(t*om)/so)).normalize();
    p.multiplyScalar(R * (1 + lift*Math.sin(Math.PI*t)));
    pts.push(p); len[i]=t;
  }
  return { pts, len };
}
const arcMat = () => new THREE.ShaderMaterial({
  transparent:true, depthWrite:false, depthTest:true, blending:THREE.AdditiveBlending,
  uniforms:{ uHead:{value:0}, uA:{value:C.green}, uB:{value:C.cyan}, uOn:{value:1} },
  vertexShader:`attribute float aLen; varying float vLen; void main(){ vLen=aLen;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader:`precision highp float; varying float vLen;
    uniform float uHead,uOn; uniform vec3 uA,uB;
    void main(){ float tail=0.17; float d=uHead-vLen;
      float pulse=(vLen<=uHead && d<tail)?(1.0-d/tail):0.0;
      float base=0.08*uOn;
      float a=base+pulse*0.95*uOn;
      if(a<0.01) discard;
      gl_FragColor=vec4(mix(uA,uB,vLen), a); }`,
});
function spawnArc(arc){
  let i=0,j=0; while(i===j){ i=Math.random()*cityVecs.length|0; j=Math.random()*cityVecs.length|0; }
  const { pts, len } = slerpArc(cityVecs[i], cityVecs[j]);
  const pos = new Float32Array((SEG+1)*3);
  for (let k=0;k<=SEG;k++){ pos[k*3]=pts[k].x; pos[k*3+1]=pts[k].y; pos[k*3+2]=pts[k].z; }
  arc.geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  arc.geo.setAttribute('aLen', new THREE.BufferAttribute(len,1));
  arc.geo.attributes.position.needsUpdate = true;
  arc.geo.attributes.aLen.needsUpdate = true;
  arc.pts = pts;
  arc.head = 0;
  arc.speed = 0.28 + Math.random()*0.42;
  arc.delay = Math.random()*2.4;
}
for (let n=0;n<ARC_N;n++){
  const geo = new THREE.BufferGeometry(), mat = arcMat();
  const line = new THREE.Line(geo, mat); line.frustumCulled = false;
  const packet = new THREE.Sprite(new THREE.SpriteMaterial({ map:GLOW, color:C.cyan,
    transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, depthTest:true }));
  packet.scale.setScalar(6);
  const arc = { geo, mat, line, packet };
  spinner.add(line); spinner.add(packet);
  spawnArc(arc); arc.head = Math.random();     // stagger
  arcs.push(arc);
}

/* =============================================================================
   POST — bloom (desktop)
============================================================================= */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1,1), 0.75, 0.55, 0.08);
if (!MOBILE) composer.addPass(bloom);

/* ---- sizing to the section ------------------------------------------------ */
function resize(){
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w/h; camera.updateProjectionMatrix();
  composer.setSize(w, h); bloom.setSize(w, h);
}
resize();
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
addEventListener('resize', resize, { passive:true });

/* =============================================================================
   LOOP — ~30fps, only runs while the section is on screen and the tab is visible
============================================================================= */
const clock = new THREE.Clock();
const FRAME_MIN = 1/30;
let onScreen = false, visible = true, looping = false, acc = 0, t = 0;
const sky = scene.children.find(o => o.material && o.material.uniforms && o.material.uniforms.uTime);

function start(){ if (looping || !onScreen || !visible) return; looping = true; clock.getDelta(); requestAnimationFrame(frame); }
function frame(){
  if (!onScreen || !visible){ looping = false; return; }
  requestAnimationFrame(frame);
  acc += Math.min(clock.getDelta(), 0.05);
  if (acc < FRAME_MIN) return;
  const dt = Math.min(acc, 0.05); acc = 0; t += dt;

  if (sky) sky.material.uniforms.uTime.value = t;
  spinner.rotation.y += dt * 0.055;                 // slow planet spin
  ring.rotation.z += dt * 0.04;
  camera.position.x = Math.sin(t*0.12) * 14;         // gentle camera drift
  camera.position.y = Math.cos(t*0.10) * 8;
  camera.lookAt(0, -6, 0);

  for (const arc of arcs){
    if (arc.delay > 0){ arc.delay -= dt; arc.mat.uniforms.uOn.value = 0.35; continue; }
    arc.mat.uniforms.uOn.value = 1;
    arc.head += dt * arc.speed;
    arc.mat.uniforms.uHead.value = arc.head;
    // packet rides the head
    const f = THREE.MathUtils.clamp(arc.head, 0, 1) * SEG;
    const i0 = Math.min(SEG, Math.floor(f)), i1 = Math.min(SEG, i0+1), fr = f - i0;
    arc.packet.position.lerpVectors(arc.pts[i0], arc.pts[i1], fr);
    arc.packet.material.opacity = arc.head < 1 ? 1 : 0;
    if (arc.head > 1.25) spawnArc(arc);              // recycle with a new route
  }
  composer.render();
}

new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; start(); },
  { threshold: 0.02 }).observe(host);
document.addEventListener('visibilitychange', () => { visible = !document.hidden; start(); });
}
