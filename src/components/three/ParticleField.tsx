'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from './formations';

export interface PointerState {
  /** Normalised device coords relative to the canvas, -1..1. */
  x: number;
  y: number;
  /** Whether the pointer is currently over (or near) the canvas. */
  active: boolean;
}

export interface FieldLayout {
  x: number;
  y: number;
  scale: number;
}

interface ParticleFieldProps {
  count: number;
  /** Positions the cloud starts in (and holds until `started`). */
  initial: Float32Array;
  /** Current destination; swapping it triggers a morph from wherever the cloud is. */
  target: Float32Array;
  started: boolean;
  ink: string;
  accent: string;
  accentRatio?: number;
  size?: number;
  morphDuration?: number;
  /** 0..1, pushed from outside (scroll progress) — blows the cloud apart. */
  scatter?: React.RefObject<number>;
  pointer: React.RefObject<PointerState>;
  /** Where the cloud sits, in world units, given the visible viewport at z=0. */
  layout?: (viewport: { width: number; height: number }) => FieldLayout;
  spin?: number;
  /** Resting rotation of the cloud (radians). */
  tilt?: [number, number, number];
  /** How far the cloud turns to follow the cursor. */
  sway?: number;
  /**
   * Colour every particle right of this x (formation space) with the accent —
   * the "D" of the SD monogram. Null fades the split back out.
   */
  splitX?: number | null;
  /** Rock gently side to side instead of spinning (for flat, chart-like shapes). */
  oscillate?: boolean;
  /** Cursor repulsion radius in world units (push distance scales with it). */
  repel?: number;
  /** Overall ink strength, 0..1 — keeps the cloud from shouting. */
  opacity?: number;
  /** How strongly cursor-disturbed particles blush toward the accent. */
  heatTint?: number;
  /** Reduced motion: snap straight to the target and freeze. */
  still?: boolean;
}

// Ashima Arts 3D simplex noise (MIT) — drives the idle breathing and the
// swirl particles take mid-morph.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uScatter;
uniform vec3 uMouse;
uniform float uMouseStrength;
uniform float uPixelRatio;
uniform float uSize;
uniform float uAccentRatio;
uniform float uRepel;
uniform float uSplitX;
uniform float uSplitMix;
uniform float uSplitSrc;

attribute vec3 aTo;
attribute vec4 aRand;

varying float vAccent;
varying float vDepth;
varying float vHeat;

${NOISE}

float easeInOut(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }

void main(){
  // Per-particle stagger so the morph ripples through the cloud instead of
  // everything moving in lockstep.
  float t = clamp((uProgress - aRand.x * 0.4) / 0.6, 0.0, 1.0);
  vec3 p = mix(position, aTo, easeInOut(t));

  vec3 q = p * 0.55 + uTime * 0.12;
  vec3 n = vec3(snoise(q), snoise(q + 17.3), snoise(q + 41.9));
  p += n * (0.04 + sin(t * 3.14159) * 0.85);

  // Scroll-out: fling outwards along the radius plus noise.
  p += (normalize(p + 1e-4) * (1.2 + aRand.y * 4.0) + n * 1.6) * uScatter;

  vec4 world = modelMatrix * vec4(p, 1.0);

  // Cursor repulsion in world space, on the z=0 plane.
  vec2 d = world.xy - uMouse.xy;
  float heat = smoothstep(uRepel, 0.0, length(d)) * uMouseStrength;
  world.xy += normalize(d + 1e-4) * heat * (0.45 + aRand.z * 0.55) * uRepel;
  world.z += heat * 0.9 * uRepel;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  // Monogram split: while forming, key off the destination (aTo); once the
  // cloud leaves the monogram, key off where it came from (position) so the
  // D stays orange in flight and then fades out.
  float sx = mix(position.x, aTo.x, uSplitSrc);
  float split = step(uSplitX, sx) * uSplitMix;
  vAccent = max(step(1.0 - uAccentRatio, aRand.w), split);
  vHeat = heat;
  vDepth = clamp((-mv.z - 3.5) / 5.0, 0.0, 1.0);

  float size = uSize * (0.65 + aRand.z * 0.7) * (1.0 + vAccent * 0.5);
  gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uOpacity;
uniform float uHeatTint;

varying float vAccent;
varying float vDepth;
varying float vHeat;

void main(){
  // Square points on purpose: reads as a printed halftone, not a soft glow.
  vec3 col = mix(uInk, uAccent, clamp(vAccent + vHeat * uHeatTint, 0.0, 1.0));
  float alpha = uOpacity * mix(1.0, 0.28, vDepth);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ParticleField({
  count,
  initial,
  target,
  started,
  ink,
  accent,
  accentRatio = 0.07,
  size = 3.2,
  morphDuration = 2.2,
  scatter,
  pointer,
  layout,
  spin = 0.12,
  tilt = [0.18, 0, 0.08],
  sway = 1,
  oscillate = false,
  splitX = null,
  opacity = 1,
  heatTint = 0.9,
  repel = 1,
  still = false,
}: ParticleFieldProps) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const dpr = useThree((s) => s.viewport.dpr);

  const progress = useRef(still ? 1 : 0);
  const mouse = useRef(new THREE.Vector3(99, 99, 0));
  const mouseStrength = useRef(0);
  const placed = useRef(false);
  const lastTarget = useRef<Float32Array | null>(null);
  const inkRef = useRef(ink);
  const accentRef = useRef(accent);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Plain data only — the GPU-side objects are declared in JSX and mutated
  // exclusively through refs.
  const buffers = useMemo(() => {
    const next = mulberry32(count);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) rand[i] = next();
    return { from: new Float32Array(initial), to: new Float32Array(initial), rand };
  }, [count, initial]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uScatter: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uMouseStrength: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: size },
      uAccentRatio: { value: accentRatio },
      uInk: { value: new THREE.Color(ink) },
      uAccent: { value: new THREE.Color(accent) },
      uOpacity: { value: 1 },
      uHeatTint: { value: heatTint },
      uRepel: { value: repel },
      uSplitX: { value: 1e4 },
      uSplitMix: { value: 0 },
      uSplitSrc: { value: 1 },
    }),
    // Colours/size are synced each frame below; the object itself lives for the mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Retarget: bake wherever each particle currently is into `position`, then
  // morph from there to the new target. Handles mid-morph interruptions.
  useEffect(() => {
    const geometry = geoRef.current;
    if (!geometry || lastTarget.current === target) return;
    const from = geometry.getAttribute('position') as THREE.BufferAttribute;
    const to = geometry.getAttribute('aTo') as THREE.BufferAttribute;
    const a = from.array as Float32Array;
    const b = to.array as Float32Array;
    const rand = buffers.rand;

    if (still) {
      a.set(target);
      b.set(target);
    } else if (lastTarget.current === null && !started) {
      // First target before the intro plays: hold the scatter, aim at target.
      b.set(target);
    } else {
      const p = progress.current;
      for (let i = 0; i < count; i++) {
        const t = Math.min(Math.max((p - rand[i * 4] * 0.4) / 0.6, 0), 1);
        const e = easeInOut(t);
        for (let k = 0; k < 3; k++) {
          const j = i * 3 + k;
          a[j] = a[j] + (b[j] - a[j]) * e;
        }
      }
      b.set(target);
      progress.current = 0;
    }
    from.needsUpdate = true;
    to.needsUpdate = true;
    lastTarget.current = target;
    invalidate();
  }, [target, buffers, count, started, still, invalidate]);

  useFrame((state, delta) => {
    // Cap long frames (tab switches, GC pauses) without stretching the
    // animation on slow devices — 1/30 made a 2s morph take 30s+ at 4fps.
    const dt = Math.min(delta, 0.1);
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uPixelRatio.value = dpr;
    u.uSize.value = size;
    u.uAccentRatio.value = accentRatio;
    if (inkRef.current !== ink) {
      u.uInk.value.set(ink);
      inkRef.current = ink;
    }
    if (accentRef.current !== accent) {
      u.uAccent.value.set(accent);
      accentRef.current = accent;
    }

    if (still) {
      progress.current = 1;
    } else if (started) {
      progress.current = Math.min(progress.current + dt / morphDuration, 1);
      u.uTime.value += dt;
    }
    u.uProgress.value = progress.current;

    const s = scatter?.current ?? 0;
    u.uScatter.value += (s - u.uScatter.value) * 0.12;
    const targetOpacity = opacity * (1 - Math.min(s * 1.1, 0.85));
    u.uOpacity.value = still ? targetOpacity : u.uOpacity.value + (targetOpacity - u.uOpacity.value) * 0.08;
    u.uHeatTint.value = heatTint;
    u.uRepel.value = repel;
    if (splitX !== null) {
      u.uSplitX.value = splitX;
      u.uSplitSrc.value = 1;
      u.uSplitMix.value = 1;
    } else if (u.uSplitMix.value > 0) {
      u.uSplitSrc.value = 0;
      u.uSplitMix.value = Math.max(0, u.uSplitMix.value - dt / 1.4);
    }

    const p = pointer.current;
    if (p && !still) {
      mouse.current.set((p.x * viewport.width) / 2, (p.y * viewport.height) / 2, 0);
      mouseStrength.current += ((p.active ? 1 : 0) - mouseStrength.current) * 0.08;
      (u.uMouse.value as THREE.Vector3).lerp(mouse.current, 0.2);
    }
    u.uMouseStrength.value = mouseStrength.current;

    if (outer.current) {
      const l = layout?.(viewport) ?? { x: 0, y: 0, scale: 1 };
      // Ease toward the layout (snap on the first frame / when still) so a
      // layout change — monogram centre → hero position — glides.
      const k = still || !placed.current ? 1 : 0.045;
      placed.current = true;
      const o = outer.current;
      o.position.x += (l.x - o.position.x) * k;
      o.position.y += (l.y - o.position.y) * k;
      const sc = o.scale.x + (l.scale - o.scale.x) * k;
      o.scale.setScalar(sc);
      if (!still && p) {
        outer.current.rotation.x += (-p.y * 0.18 * sway - outer.current.rotation.x) * 0.05;
        outer.current.rotation.y += (p.x * 0.3 * sway - outer.current.rotation.y) * 0.05;
      }
    }
    if (inner.current) {
      // Ease toward the resting tilt so switching shapes never snaps the view.
      const k = still ? 1 : 0.04;
      inner.current.rotation.x += (tilt[0] - inner.current.rotation.x) * k;
      inner.current.rotation.z += (tilt[2] - inner.current.rotation.z) * k;
    }
    if (inner.current && !still) {
      if (oscillate) {
        const target = Math.sin(state.clock.elapsedTime * 0.35) * 0.45;
        inner.current.rotation.y += (target - inner.current.rotation.y) * 0.04;
      } else {
        inner.current.rotation.y += dt * spin * (1 + s * 4);
      }
    }
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* Particles get flung far outside their rest bounds — never cull. */}
        <points frustumCulled={false}>
          <bufferGeometry ref={geoRef}>
            <bufferAttribute attach="attributes-position" args={[buffers.from, 3]} />
            <bufferAttribute attach="attributes-aTo" args={[buffers.to, 3]} />
            <bufferAttribute attach="attributes-aRand" args={[buffers.rand, 4]} />
          </bufferGeometry>
          <shaderMaterial
            ref={matRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
}
