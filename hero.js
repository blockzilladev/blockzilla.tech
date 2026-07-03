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
renderer.toneMappingExposure = 0.99;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ---- scene + fog (lighter, so the world reads as vast) -------------------- */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x08170f, 0.0072);   // dark GREEN haze
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000);

scene.add(new THREE.AmbientLight(0x102636, 0.5));
const key = new THREE.DirectionalLight(0x256a63, 0.5);
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
        vec3 top = vec3(0.006,0.020,0.016);
        vec3 hor = vec3(0.010,0.075,0.055);
        vec3 col = mix(hor, top, smoothstep(0.28, 0.95, h));
        col += vec3(0.02,0.22,0.14) * smoothstep(0.34,0.0,abs(h-0.28)) * 0.8;
        float band = smoothstep(0.16,0.0,abs(h-0.26));
        col += vec3(0.03,0.17,0.11) * band * 0.55;
        float neb = fbm(vDir.xz*3.0 + vDir.y*2.0 + uTime*0.006);
        col += vec3(0.02,0.10,0.07) * smoothstep(0.42,0.95,h) * (neb*neb) * 0.7;
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
   CITYSCAPE — instanced towers with PROCEDURAL lit windows. Windows are a fixed
   physical size (no stretch) via per-instance dimensions, each randomly lit and
   independently twinkling/flickering. Varied footprints — slim towers + wide
   blocks — and a looser, less-dense skyline.
============================================================================= */
const COUNT = MOBILE ? 220 : 440;

// ---- lit-window facade via STANDARD emissiveMap (bulletproof, tonemapped) ---
function windowAtlas(){
  const cols=8, rows=16, cell=32, W=cols*cell, H=rows*cell;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const g=cv.getContext('2d');
  g.fillStyle='#02070a'; g.fillRect(0,0,W,H);                 // dark facade
  const mx=cell*0.26, my=cell*0.22, ww=cell-2*mx, wh=cell-2*my;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const x=c*cell+mx, y=r*cell+my, k=Math.random();
    if(k<0.14) continue;                                       // ~14% dark panes
    let col,a;
    if(k>0.975){ col='236,255,247'; a=1.0; }                   // hot near-white
    else if(k>0.80){ col='120,236,255'; a=0.72+Math.random()*0.28; }  // cyan
    else { col='40,244,158'; a=0.6+Math.random()*0.4; }        // dominant green
    g.fillStyle=`rgba(${col},${a})`; g.fillRect(x,y,ww,wh);
  }
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(1.5, 3.0);                                       // more windows per face
  t.minFilter=THREE.LinearMipmapLinearFilter; t.magFilter=THREE.LinearFilter;
  t.generateMipmaps=true; t.colorSpace=THREE.SRGBColorSpace;    // standard emissiveMap decode
  t.anisotropy=(renderer.capabilities?renderer.capabilities.getMaxAnisotropy():1)||1;
  return t;
}
const winTex = windowAtlas();
// Pure standard MeshStandardMaterial — no onBeforeCompile, no custom GLSL:
// three samples emissiveMap * emissive and tonemaps it -> green windows GLOW on
// every GPU. A city-wide emissiveIntensity breathe is animated in the loop.
const cityMat = new THREE.MeshStandardMaterial({
  color: 0x02060b, roughness: 1.0, metalness: 0.0,
  emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 2.4,
});

// ---- geometry + instances + attributes: UNCHANGED --------------------------
// (aSeed = random per building, aDims = world w,h,d; both already filled here)
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const city   = new THREE.InstancedMesh(boxGeo, cityMat, COUNT);
const seeds = new Float32Array(COUNT), dims = new Float32Array(COUNT*3);
const dummy = new THREE.Object3D();
for (let i = 0; i < COUNT; i++){
  const ang = Math.random()*Math.PI*2;
  const rad = 16 + Math.pow(Math.random(), 1.5) * 470;
  const x = Math.cos(ang)*rad + (Math.random()-0.5)*14;
  const z = Math.sin(ang)*rad + (Math.random()-0.5)*14;
  const wide = Math.random() < 0.26;
  const w = wide ? 11 + Math.random()*20 : 3.5 + Math.random()*6;
  const d = wide ? 11 + Math.random()*20 : 3.5 + Math.random()*6;
  const ring    = clamp((rad - 18) / 64, 0, 1);
  const falloff = 1 - clamp((rad - 95) / 320, 0, 1);
  const cap = wide ? 34 : 128;
  const district = ring * falloff * (22 + Math.random()*cap);
  const spike = (Math.random() < 0.04 ? Math.random()*60 : 0) * ring * falloff;
  const h = 5 + Math.random()*10 + district + spike;
  dummy.position.set(x, h/2, z);
  dummy.scale.set(w, h, d);
  dummy.rotation.y = (Math.random()*4|0) * Math.PI/2;
  dummy.updateMatrix(); city.setMatrixAt(i, dummy.matrix);
  seeds[i] = Math.random();
  dims[i*3] = w; dims[i*3+1] = h; dims[i*3+2] = d;   // -> aDims (world w,h,d)
}
boxGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
boxGeo.setAttribute('aDims', new THREE.InstancedBufferAttribute(dims, 3));
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
// bigger, high-detail thematic solids drifting further out (crypto/AI motifs)
const bigGeos = [ new THREE.DodecahedronGeometry(1,0), new THREE.IcosahedronGeometry(1,0),
  new THREE.OctahedronGeometry(1,0), new THREE.TorusKnotGeometry(0.8,0.28,80,10) ];
for (let i=0; i<(MOBILE?1:3); i++){
  const m = new THREE.Mesh(bigGeos[i%bigGeos.length], new THREE.MeshBasicMaterial({
    color: i%2 ? C.cyan : C.green, wireframe: true, transparent: true, opacity: 0.4 }));
  m.scale.setScalar(9 + Math.random()*15);
  const a = Math.random()*Math.PI*2, rr = 190 + Math.random()*170;
  m.position.set(Math.cos(a)*rr, 55 + Math.random()*90, Math.sin(a)*rr);
  m.userData.spin = (Math.random()-0.5)*0.24; m.userData.bob = Math.random()*Math.PI*2;
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
/* =============================================================================
   GLYPH RAIN — classic "Matrix" digital rain. Each column is one baked strip:
   a DISCRETE bright leading HEAD glyph + a long EXPONENTIALLY FADING tail, with
   dark gaps between drops. Columns are deliberately VARIED (speed, glyph size,
   density, tail length + falloff, mostly green with occasional cyan) and the
   field is FEWER / SLOWER than a solid wall. Tall planes rise into the sky and
   billboard to the camera; a very subtle page-scroll nudge is layered on in the
   per-frame loop. Reuses global GLYPHS + clamp + THREE.
============================================================================= */
const GLYPHS = ('アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
  + 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789₿Ξ⟠⛓◇◆△▽#{}<>/\\|=+*').split('');

// module-scoped scroll state (read/written by the scroll handler + per-frame loop)
let scrollKick = 0;
let lastScrollY = (typeof scrollY !== 'undefined') ? scrollY : 0;

// column accent colours (RGB) + the shared near-white "hot" head colour
const RAIN_GREEN = [28, 240, 154];   // #1CF09A
const RAIN_CYAN  = [91, 233, 255];   // #5BE9FF
const RAIN_HOT   = [234, 255, 246];  // #EAFFF6

// Build one column's texture: `rows` cells tall, one glyph per cell.
// o = { col:[r,g,b], drops, tail, fade, ambient, mirror }
//  - a HEAD cell (brightness 1) is near-white/hot and gets a soft glow
//  - each drop's tail fades exponentially UPWARD (fade^k), wrapping seamlessly
//  - dark cells stay black except a sparse, very faint ambient glyph scatter
// Canvas top (r=0) maps (flipY) to the plane TOP (sky); larger r = lower = the
// leading edge, so heads fall toward the ground when offset.y is decremented.
function glyphStrip(rows, o){
  const cw = 32, ch = 44;                                  // cell px (glyph aspect ~0.73)
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch * rows;
  const g = cv.getContext('2d');
  g.font = '600 30px "IBM Plex Mono", monospace';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.mirror){ g.translate(cw, 0); g.scale(-1, 1); }     // some columns mirror their glyphs

  // ---- bake a per-cell brightness curve: heads + exponential tails ----
  const bright = new Float32Array(rows);                   // 0 = dark
  for (let d = 0; d < o.drops; d++){
    const hr = (Math.random() * rows) | 0;
    bright[hr] = 1.0;                                       // discrete bright head
    for (let k = 1; k <= o.tail; k++){
      const b = Math.pow(o.fade, k);                        // smooth exponential falloff
      if (b < 0.03) break;
      const r = ((hr - k) % rows + rows) % rows;            // tail runs up, wraps seamlessly
      if (b > bright[r]) bright[r] = b;
    }
  }

  // ---- draw ----
  const [tr, tg, tb] = o.col;
  for (let r = 0; r < rows; r++){
    const b = bright[r];
    const y = r * ch + ch / 2;
    const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    if (b <= 0){                                            // sparse faint "static" in the gaps
      if (Math.random() < o.ambient){
        g.fillStyle = `rgba(${tr},${tg},${tb},${(0.045 + Math.random() * 0.06).toFixed(3)})`;
        g.fillText(glyph, cw / 2, y);
      }
      continue;
    }
    const isHead = b >= 0.999;
    let cr, cg, cb, a;
    if (isHead){
      cr = RAIN_HOT[0]; cg = RAIN_HOT[1]; cb = RAIN_HOT[2]; a = 1.0;
    } else {
      const lean = clamp((b - 0.2) / 0.8, 0, 1) * 0.45;     // brighter tail cells lean paler
      cr = Math.round(tr + (RAIN_HOT[0] - tr) * lean);
      cg = Math.round(tg + (RAIN_HOT[1] - tg) * lean);
      cb = Math.round(tb + (RAIN_HOT[2] - tb) * lean);
      a  = Math.min(1, b * 0.95);
    }
    g.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
    g.fillText(glyph, cw / 2, y);
    if (isHead){                                            // soft glow seed on the head only
      g.save();
      g.shadowColor = `rgba(${tr},${tg},${tb},0.9)`;
      g.shadowBlur = 14;
      g.fillStyle = 'rgba(234,255,246,1)';
      g.fillText(glyph, cw / 2, y);
      g.restore();
    }
  }

  const t = new THREE.CanvasTexture(cv);
  t.wrapT = THREE.RepeatWrapping;
  t.offset.y = Math.random();                              // desync heads across columns
  return t;
}

const rainGroup = new THREE.Group(); scene.add(rainGroup);
const columns = [];
const COLN = MOBILE ? 24 : 42;                             // fewer than the old dense wall
for (let i = 0; i < COLN; i++){
  const cyanCol = Math.random() < 0.22;                    // mostly green, occasional cyan
  const cellH   = 4.4 + Math.random() * 4.4;               // world height of a glyph — size varies
  const hWish   = 150 + Math.pow(Math.random(), 0.6) * 300; // tall streams rising into the sky
  const rows    = clamp(Math.round(hWish / cellH), 22, 80);
  const planeH  = rows * cellH;
  const opts = {
    col:     cyanCol ? RAIN_CYAN : RAIN_GREEN,
    drops:   1 + (Math.random() < 0.55 ? 1 : 0) + (Math.random() < 0.18 ? 1 : 0), // 1–3 → density
    tail:    Math.round(6 + Math.random() * 16),           // tail length varies (6–22 cells)
    fade:    0.74 + Math.random() * 0.13,                  // exponential falloff varies
    ambient: 0.04 + Math.random() * 0.09,                  // faint background code density
    mirror:  Math.random() < 0.30,
  };
  const tex = glyphStrip(rows, opts);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(cellH * (32 / 44), planeH),    // width matches glyph aspect (no stretch)
    new THREE.MeshBasicMaterial({ map: tex, transparent: true,
      opacity: 0.6 + Math.random() * 0.25, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  plane.rotation.order = 'YXZ';
  plane.userData = {
    tex,
    speed: 0.018 + Math.random() * 0.055,                  // slower + varied
    dir:   1,                                              // base fall direction (down)
    kick:  (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.16), // per-column scroll response
    bx: (Math.random() - 0.5) * 470, bz: (Math.random() - 0.5) * 470,
    by: planeH * 0.5 + Math.random() * 30,                 // base sits near the ground, towers up
    ax: 5 + Math.random() * 18, az: 5 + Math.random() * 18,
    fx: 0.03 + Math.random() * 0.06, ph: Math.random() * Math.PI * 2,
    swayA: 0.04 + Math.random() * 0.05,
  };
  columns.push(plane); rainGroup.add(plane);
}

/* Very subtle page-scroll nudge for the glyph rain. Accumulates a small, clamped
   "kick" from the scroll delta; the per-frame loop applies it (per-column signed,
   so some streams briefly slow/reverse) and decays it back to zero. Passive so it
   never blocks scrolling. */
addEventListener('scroll', () => {
  const y = scrollY || document.documentElement.scrollTop || 0;
  const d = y - lastScrollY; lastScrollY = y;
  scrollKick = clamp(scrollKick + d * 0.0004, -0.25, 0.25);   // tiny per-px influence
}, { passive: true });

/* =============================================================================
   COMPUTER-AGENT / MATRIX OBJECTS — glowing data cubes, orbiting glyph rings,
   drifting through the scene.
============================================================================= */
function glyphGridTex(cols, rows){
  const cell=40, cv=document.createElement('canvas'); cv.width=cols*cell; cv.height=rows*cell;
  const g=cv.getContext('2d'); g.font='600 26px "IBM Plex Mono", monospace';
  g.textAlign='center'; g.textBaseline='middle';
  for (let y=0;y<rows;y++) for (let x=0;x<cols;x++){
    const a=0.25+Math.random()*0.7, lead=Math.random()<0.12;
    g.fillStyle = lead ? `rgba(200,255,230,${a})` : `rgba(28,240,154,${a})`;
    g.fillText(GLYPHS[(Math.random()*GLYPHS.length)|0], x*cell+cell/2, y*cell+cell/2);
  }
  return new THREE.CanvasTexture(cv);
}
// glowing data cubes (glyph faces + wire edges)
for (let i=0; i<(MOBILE?3:6); i++){
  const s=7+Math.random()*11;
  const cube=new THREE.Mesh(new THREE.BoxGeometry(s,s,s), new THREE.MeshBasicMaterial({
    map:glyphGridTex(4,4), transparent:true, opacity:0.72, blending:THREE.AdditiveBlending, depthWrite:false }));
  const a=Math.random()*Math.PI*2, rr=150+Math.random()*230;
  cube.position.set(Math.cos(a)*rr, 45+Math.random()*115, Math.sin(a)*rr);
  cube.userData.spin=(Math.random()-0.5)*0.5; cube.userData.bob=Math.random()*Math.PI*2;
  cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry),
    new THREE.LineBasicMaterial({ color:C.cyan, transparent:true, opacity:0.5 })));
  floaters.add(cube);
}
// orbiting glyph rings (data streams)
for (let i=0; i<(MOBILE?1:3); i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(16+Math.random()*14, 2.2, 12, 90),
    new THREE.MeshBasicMaterial({ map:glyphGridTex(22,2), transparent:true, opacity:0.7,
      blending:THREE.AdditiveBlending, depthWrite:false }));
  const a=Math.random()*Math.PI*2, rr=170+Math.random()*200;
  ring.position.set(Math.cos(a)*rr, 55+Math.random()*100, Math.sin(a)*rr);
  ring.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
  ring.userData.spin=(Math.random()-0.5)*0.5; ring.userData.bob=Math.random()*Math.PI*2;
  floaters.add(ring);
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
/* =============================================================================
   SKY WORDMARK — one MASSIVE BLOCKZILLA banner floating high in the sky that
   WARPS/BENDS like cloth in wind, warp amplitude driven by camera speed (uVel).
   Replaces the old flat `word` + `wordGhost` planes. Reuses wordTexture().
   ShaderMaterial => no fog (crisp sky element, like the stars/skybox), additive
   glow, semi-transparent, well-segmented plane so the sine warp reads smoothly.
============================================================================= */
const WORD_W = 384, WORD_H = 96, WORD_Y = 188;          // 4:1 matches the 2048x512 texture; high in the sky
const wordMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  depthTest: true,                                       // let a few tall towers occlude it -> depth
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,                                // banner curls away from view at the edges
  uniforms: {
    uTime:    { value: 0 },
    uVel:     { value: 0 },                              // 0..1 camera-speed drive (set per-frame)
    uMap:     { value: wordTexture('BLOCKZILLA') },      // reuse existing glowing-text canvas texture
    uOpacity: { value: 0.72 },
    uCore:    { value: new THREE.Color('#EAFFF6') },     // near-white text body
    uGlow:    { value: C.green.clone() },                // green edge glow
    uCyan:    { value: C.cyan.clone() },                 // cyan fringe
  },
  vertexShader: /* glsl */`
    uniform float uTime, uVel;
    varying vec2 vUv;
    varying float vWarp;
    void main(){
      vUv = uv;
      vec3 p = position;
      float x = uv.x;                                    // 0..1 across the banner width
      float TAU = 6.2831853;
      // amplitude breathes at rest, then swells hard with camera speed
      float amp = 5.5 + uVel * 30.0;
      // layered travelling waves -> cloth-in-wind flutter (varied freq/phase/dir)
      float w =  sin(x*TAU*1.0 + uTime*0.90) * 0.60
               + sin(x*TAU*2.3 - uTime*1.70 + 1.3) * 0.25
               + sin(x*TAU*0.5 + uTime*0.55) * 0.55;
      // top/bottom edges flap a touch more than the mid-line
      float edgeFlap = 0.65 + 0.35 * cos(uv.y * 3.14159);
      p.z += w * amp * edgeFlap;
      // vertical ripple so the baseline undulates too
      p.y += sin(x*TAU*1.6 - uTime*1.15) * amp * 0.16;
      // ends curl toward the viewer, curl deepens with speed -> "bends as camera moves"
      float ends = smoothstep(0.55, 1.0, abs(x - 0.5) * 2.0);
      p.z -= ends * (4.0 + uVel * 22.0);
      vWarp = w;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D uMap;
    uniform float uTime, uVel, uOpacity;
    uniform vec3 uCore, uGlow, uCyan;
    varying vec2 vUv;
    varying float vWarp;
    void main(){
      // warp/speed-driven chromatic split -> holographic, energetic banner
      float split = 0.003 + uVel*0.010 + abs(vWarp)*0.004;
      float gA = texture2D(uMap, vUv + vec2(split, 0.0)).a;   // green-side sample
      vec4  c  = texture2D(uMap, vUv);                        // core
      float cA = texture2D(uMap, vUv - vec2(split, 0.0)).a;   // cyan-side sample
      vec3 col = uCore * c.a * 0.95;                          // green-white core (less blowout)
      col += uGlow * gA * 0.60;                               // green fringe
      col += uCyan * cA * 0.50;                               // cyan fringe
      col *= 0.9 + 0.2 * sin(vUv.x * 60.0 - uTime * 2.5);     // travelling shimmer
      col += uGlow * smoothstep(0.5, 1.0, vWarp*0.5 + 0.5) * (0.12 + uVel*0.45); // crest glow
      float alpha = max(c.a, max(gA*0.6, cA*0.5)) * uOpacity;
      if (alpha < 0.004) discard;
      gl_FragColor = vec4(col, alpha);                        // additive: rgb pre-scaled by alpha at blend
    }`,
});
const word = new THREE.Mesh(new THREE.PlaneGeometry(WORD_W, WORD_H, 180, 36), wordMat);
word.position.set(0, WORD_Y, -40);
word.renderOrder = 2;
scene.add(word);
// per-frame velocity tracking state
const wordPrev = new THREE.Vector3();
let wordVel = 0, wordInit = false;

/* =============================================================================
   CENTRAL LOGO — a big faceted Blockzilla mark floating above the district,
   slowly rotating and pulsating through the accent colours. Wrapped by orbital
   rings and an orbiting "blockchain" ring of linked blocks.
============================================================================= */
const logoGroup = new THREE.Group();
logoGroup.position.set(80, 150, -20);        // a large, ghostly beacon above the skyline (right of the panel)
scene.add(logoGroup);
const logoGeo = new THREE.IcosahedronGeometry(52, 0);
const logoMat = new THREE.MeshStandardMaterial({
  color: 0x0a1c17, emissive: C.green.clone(), emissiveIntensity: 1.0,
  metalness: 0.6, roughness: 0.22, flatShading: true, transparent: true, opacity: 0.5 });
const logoSolid = new THREE.Mesh(logoGeo, logoMat);
const logoWire = new THREE.LineSegments(new THREE.EdgesGeometry(logoGeo),
  new THREE.LineBasicMaterial({ color: C.cyan.clone(), transparent: true, opacity: 0.95 }));
const logoGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(60, 0),
  new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.09,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
logoGroup.add(logoGlow, logoSolid, logoWire);

// glowing, pulsating vertices (the 12 corners of the icosahedron)
function dotGlowTex(){
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const g=cv.getContext('2d'); const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.3,'rgba(200,255,230,0.85)');
  gr.addColorStop(1,'rgba(28,240,154,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(cv);
}
const vGlow = dotGlowTex();
const logoVerts = [];
{
  const gr=(1+Math.sqrt(5))/2;
  const V=[[-1,gr,0],[1,gr,0],[-1,-gr,0],[1,-gr,0],[0,-1,gr],[0,1,gr],
           [0,-1,-gr],[0,1,-gr],[gr,0,-1],[gr,0,1],[-gr,0,-1],[-gr,0,1]];
  for (const v of V){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({ map:vGlow, color:C.cyan.clone(),
      transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
    s.position.set(v[0], v[1], v[2]).normalize().multiplyScalar(52);
    s.scale.setScalar(16); logoGroup.add(s); logoVerts.push(s);
  }
}

// orbital rings around the logo
const orbit = new THREE.Group();
orbit.position.copy(logoGroup.position);
scene.add(orbit);
for (let i=0; i<3; i++){
  const r = new THREE.Mesh(new THREE.TorusGeometry(66 + i*13, 1.0, 8, 160),
    new THREE.MeshBasicMaterial({ color: i%2 ? C.cyan : C.green, transparent: true,
      opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  r.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  r.userData.sp = 0.12 + Math.random()*0.3;
  orbit.add(r);
}

// orbiting "blockchain" — a slowly rotating ring of linked blocks
const chain = new THREE.Group(); scene.add(chain);
{
  const bGeo = new THREE.BoxGeometry(5,5,5), N = 14, R2 = 165, cpos = [];
  for (let i=0; i<N; i++){ const a = i/N*Math.PI*2;
    const b = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({
      color: 0x061a14, emissive: (i%2 ? C.cyan : C.green), emissiveIntensity: 0.9,
      metalness: 0.5, roughness: 0.3, flatShading: true }));
    b.position.set(Math.cos(a)*R2, 96, Math.sin(a)*R2); b.rotation.y = a;
    chain.add(b); cpos.push(b.position.x, b.position.y, b.position.z);
  }
  cpos.push(cpos[0], cpos[1], cpos[2]);
  chain.add(new THREE.Line(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3)),
    new THREE.LineBasicMaterial({ color: C.green, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending })));
}

/* ---- distant starfield (fog:false so it survives the haze) ---------------- */
const starGeo = new THREE.BufferGeometry();
const sp = new Float32Array(1400*3);
for (let i=0; i<1400; i++){
  const r = 900 + Math.random()*600, a = Math.random()*Math.PI*2, b = Math.random()*Math.PI;
  sp[i*3]=Math.sin(b)*Math.cos(a)*r; sp[i*3+1]=Math.abs(Math.cos(b))*r*0.5+40; sp[i*3+2]=Math.sin(b)*Math.sin(a)*r;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: C.pale, size: 1.5, transparent: true, opacity: 0.55, sizeAttenuation: false, fog: false }));
scene.add(stars);   // follows the camera each frame so the sky never drifts away

/* =============================================================================
   BOKEH — cheap out-of-focus green glow dots (single THREE.Points).
   Soft round additive sprites, sizeAttenuation so near dots read big & blurry,
   fog:false so they survive the haze, and they loosely follow the camera in X/Z
   so the frame is always dusted with drifting bokeh. Paste this block right
   after the starfield setup (~line 440, after `scene.add(stars);`).
============================================================================= */
function bokehTex(){
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  const gr = g.createRadialGradient(32,32,0, 32,32,32);
  gr.addColorStop(0.00, 'rgba(255,255,255,0.95)');
  gr.addColorStop(0.28, 'rgba(120,255,205,0.55)');
  gr.addColorStop(1.00, 'rgba(28,240,154,0.0)');
  g.fillStyle = gr; g.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(cv);
}
const BOKEH_N = MOBILE ? 26 : 54;
const bokehGeo  = new THREE.BufferGeometry();
const bokehPos  = new Float32Array(BOKEH_N*3);   // live positions
const bokehCol  = new Float32Array(BOKEH_N*3);   // per-dot tint
const bokehHome = new Float32Array(BOKEH_N*3);   // rest offset (X/Z relative to camera, Y in world)
const bokehPh   = new Float32Array(BOKEH_N*3);   // drift phases
for (let i=0; i<BOKEH_N; i++){
  const a = Math.random()*Math.PI*2, rr = 55 + Math.random()*230;
  const hx = Math.cos(a)*rr, hy = 18 + Math.random()*150, hz = Math.sin(a)*rr;
  bokehHome[i*3]=hx; bokehHome[i*3+1]=hy; bokehHome[i*3+2]=hz;
  bokehPos[i*3]=hx;  bokehPos[i*3+1]=hy;  bokehPos[i*3+2]=hz;
  // mostly green, some cyan, a few near-white "hot" dots
  const r = Math.random();
  const c = (r < 0.10 ? C.pale : (r < 0.32 ? C.cyan : C.green)).clone();
  bokehCol[i*3]=c.r; bokehCol[i*3+1]=c.g; bokehCol[i*3+2]=c.b;
  bokehPh[i*3]=Math.random()*6.2831; bokehPh[i*3+1]=Math.random()*6.2831; bokehPh[i*3+2]=Math.random()*6.2831;
}
bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
bokehGeo.setAttribute('color',    new THREE.BufferAttribute(bokehCol, 3));
const bokeh = new THREE.Points(bokehGeo, new THREE.PointsMaterial({
  map: bokehTex(), size: 16, sizeAttenuation: true, vertexColors: true,
  transparent: true, opacity: 0.32, depthWrite: false,
  blending: THREE.AdditiveBlending, fog: false }));
bokeh.frustumCulled = false;   // they hug the camera; never cull
scene.add(bokeh);

/* =============================================================================
   POST — bloom (desktop only), higher threshold so fewer pixels bloom (cheaper)
============================================================================= */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.42, 0.25);
if (!MOBILE) composer.addPass(bloom);

/* =============================================================================
   CUSTOM CONTROL RIG — orbit (drag) + fly (WASD, moves where you look) +
   pinch zoom, with a slow wandering auto-tour when idle.
============================================================================= */
const target = new THREE.Vector3(0, 70, 0);        // opens on a distant, near-level establishing shot
const tgtGoal = target.clone();
let az = 0.7, pol = 1.2, rad = 296;                // further back + more horizontal (less top-down)
let azT = az, polT = pol, radT = rad;              // goals (drag/zoom/auto set these)
const POL_MIN = 0.24, POL_MAX = 1.46, RAD_MIN = 36, RAD_MAX = 470;

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

  // ---- fly: W/S move along the heading; A/D (and ←/→) smoothly VEER the
  //      heading, so holding forward + a turn key banks you into a curve ----
  let mf=0, turn=0;
  if (keys['w']||keys['arrowup'])    mf+=1;
  if (keys['s']||keys['arrowdown'])  mf-=1;
  if (keys['a']||keys['arrowleft'])  turn+=1;   // veer left
  if (keys['d']||keys['arrowright']) turn-=1;   // veer right
  azT += turn * 0.95 * dt;                        // smooth heading turn
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
  const desired = fwd.multiplyScalar(mf * 60);    // move only along where you point
  vel.lerp(desired, 1 - Math.pow(0.0009, dt));
  target.addScaledVector(vel, dt);
  target.y = clamp(target.y, 8, 170);

  // ---- idle auto-tour: slow drift + occasional eased jump to a new vantage --
  if (!active){
    if (wasActive){ azT=az; polT=pol; radT=rad; tgtGoal.copy(target); autoTimer=5; }
    azT += 0.028 * dt;                                     // gentle constant arc
    autoTimer -= dt;
    if (autoTimer <= 0){
      autoTimer = 9 + Math.random()*8;                    // 9–17s between moves
      if (Math.random() < 0.5){                            // establishing shot: frame the beacon
        azT += (Math.random()-0.5)*2.4;
        polT = 1.02 + Math.random()*0.26;                  // near-horizontal, not top-down
        radT = 300 + Math.random()*120;
        tgtGoal.set((Math.random()-0.5)*40, 84 + Math.random()*44, (Math.random()-0.5)*40);
      } else {                                             // wander through the district
        azT += (Math.random()-0.5)*1.5;
        polT = 0.92 + Math.random()*0.4;
        radT = 160 + Math.random()*170;
        tgtGoal.set((Math.random()-0.5)*160, 26 + Math.random()*44, (Math.random()-0.5)*160);
      }
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

  // --- glyph rain: fall (per-column dir + subtle scroll nudge) + billboard ---
  scrollKick *= Math.exp(-dt * 3.2);                         // transient decay (~0.3s)
  for (const c of columns){
    const u = c.userData;
    const vel = u.speed * u.dir + scrollKick * u.kick;        // scroll can briefly slow/reverse
    u.tex.offset.y = ((u.tex.offset.y - vel * dt) % 1 + 1) % 1; // +1 stays positive if reversed
    c.position.set(
      u.bx + Math.sin(simTime * u.fx + u.ph) * u.ax,
      u.by + Math.sin(simTime * u.fx * 0.5 + u.ph) * 3.0,
      u.bz + Math.cos(simTime * u.fx * 0.8 + u.ph) * u.az);
    c.rotation.y = Math.atan2(camera.position.x - c.position.x, camera.position.z - c.position.z);
    c.rotation.z = Math.sin(simTime * 0.2 + u.ph) * u.swayA;  // gentle sway (tall streams)
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
// --- MASSIVE sky wordmark: flutter + camera-speed warp + gentle drift ---------
// Replaces the old two lines:
//   word.position.y = 50 + Math.sin(simTime*0.5)*1.8;
//   wordGhost.position.y = 50 + Math.sin(simTime*0.5+1)*2.4;
// NOTE: place this AFTER updateControls(dt) so camera.position is current.
{
  const u = wordMat.uniforms;
  u.uTime.value = simTime;
  // camera movement magnitude -> normalized, damped warp drive
  if (!wordInit){ wordPrev.copy(camera.position); wordInit = true; }
  const speed = wordPrev.distanceTo(camera.position) / Math.max(dt, 1e-3);
  wordPrev.copy(camera.position);
  const target = clamp(speed / 90, 0, 1);                 // ~90 u/s reads as "full warp"
  wordVel += (target - wordVel) * (1 - Math.pow(0.015, dt)); // smooth so it eases in/out
  u.uVel.value = wordVel;
  // gentle vertical drift + yaw-billboard so the banner stays readable from any orbit angle
  word.position.y = WORD_Y + Math.sin(simTime * 0.25) * 6.0;
  word.rotation.y = Math.atan2(camera.position.x - word.position.x,
                               camera.position.z - word.position.z);
  word.rotation.z = Math.sin(simTime * 0.15) * 0.04;      // slow lazy tilt
}

  // subtle city-wide breathe (standard emissiveMap path)
  cityMat.emissiveIntensity = 2.4 + 0.32*Math.sin(simTime*0.5);

  // central logo: slow spin + pulse + accent colour cycle
  const puls = 0.5 + 0.5*Math.sin(simTime*0.7);
  const cmix = 0.5 + 0.5*Math.sin(simTime*0.45);
  logoGroup.rotation.y += dt*0.16;
  logoGroup.rotation.x = Math.sin(simTime*0.13)*0.18;
  logoGroup.scale.setScalar(1 + puls*0.07);
  logoMat.emissive.copy(C.green).lerp(C.cyan, cmix);
  logoMat.emissiveIntensity = 1.3 + puls*1.1;
  logoWire.material.color.copy(C.cyan).lerp(C.green, cmix);
  logoGlow.material.opacity = 0.07 + puls*0.08;
  logoVerts.forEach((s, i) => {
    const p = 0.5 + 0.5*Math.sin(simTime*1.3 + i*0.7);
    s.scale.setScalar(11 + p*13);
    s.material.opacity = 0.5 + p*0.5;
    s.material.color.copy(C.green).lerp(C.cyan, 0.5 + 0.5*Math.sin(simTime*0.6 + i*0.9));
  });
  orbit.children.forEach(r => { r.rotation.z += r.userData.sp*dt; r.rotation.y += r.userData.sp*0.5*dt; });
  chain.rotation.y += dt*0.05;

  // keep the sky lights centred on the viewer so they never drift away when flying
  stars.position.copy(camera.position);

  /* ---- PER-FRAME DRIFT — paste inside frame(), e.g. right after
   `stars.position.copy(camera.position);` (~line 619). ---- */
{
  const ba = bokehGeo.attributes.position.array;
  for (let i=0; i<BOKEH_N; i++){
    ba[i*3]   = camera.position.x + bokehHome[i*3]   + Math.sin(simTime*0.13 + bokehPh[i*3])   * 10.0;
    ba[i*3+1] =                     bokehHome[i*3+1] + Math.sin(simTime*0.11 + bokehPh[i*3+1]) *  8.0;
    ba[i*3+2] = camera.position.z + bokehHome[i*3+2] + Math.cos(simTime*0.10 + bokehPh[i*3+2]) * 10.0;
  }
  bokehGeo.attributes.position.needsUpdate = true;
}

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
