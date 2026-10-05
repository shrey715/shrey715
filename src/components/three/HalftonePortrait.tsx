'use client';
import { Suspense, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import FieldCanvas from './FieldCanvas';
import type { PointerState } from './ParticleField';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Everything here is in raw sRGB (texture not decoded, colours passed as-is,
// no output conversion) so the duotone matches the CSS palette exactly.
const fragmentShader = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uCell;
uniform float uReveal;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uPlaneAspect;
uniform float uImgAspect;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uAccent;
varying vec2 vUv;

// object-fit: cover; object-position: top
vec2 coverUv(vec2 uv) {
  vec2 s = uPlaneAspect < uImgAspect ? vec2(uPlaneAspect / uImgAspect, 1.0) : vec2(1.0, uImgAspect / uPlaneAspect);
  float u = 0.5 + (uv.x - 0.5) * s.x;
  float vTop = (1.0 - uv.y) * s.y;
  return vec2(u, 1.0 - vTop);
}

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float contrast(float l, float k) { return clamp((l - 0.5) * k + 0.5, 0.0, 1.0); }

void main() {
  vec2 px = vUv * uRes;
  vec2 cell = floor(px / uCell);
  vec2 centre = (cell + 0.5) * uCell / uRes;

  // Halftone: one ink dot per cell, radius from the darkness at its centre.
  float L = contrast(luma(texture2D(uTex, coverUv(centre)).rgb), 1.35);
  float r = (1.0 - L) * 0.64;
  float d = length(fract(px / uCell) - 0.5);
  float dotMask = 1.0 - smoothstep(r - 0.05, r + 0.03, d);
  vec3 halftone = mix(uPaper, uInk, dotMask);

  // Photo: the existing grayscale + contrast + 15% accent multiply treatment.
  float P = contrast(luma(texture2D(uTex, coverUv(vUv)).rgb), 1.25);
  vec3 photo = vec3(P) * mix(vec3(1.0), uAccent, 0.15);

  // Reveal cell by cell (each flips at its own threshold) as you scroll,
  // with a halftone lens following the cursor.
  vec2 a = vec2(uPlaneAspect, 1.0);
  float lens = uMouseOn * (1.0 - smoothstep(0.1, 0.19, distance(vUv * a, uMouse * a)));
  float m = clamp(uReveal - lens, 0.0, 1.0);
  float th = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
  float flip = smoothstep(th - 0.06, th + 0.06, m * 1.12 - 0.06);

  gl_FragColor = vec4(mix(halftone, photo, flip), 1.0);
}
`;

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

function Plane({ src, reveal, pointer }: { src: string; reveal: React.RefObject<number>; pointer: React.RefObject<PointerState> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  const texture = useLoader(THREE.TextureLoader, src);
  const mouseOn = useRef(0);
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCell: { value: 7 },
      uReveal: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseOn: { value: 0 },
      uPlaneAspect: { value: 1 },
      uImgAspect: { value: 1 },
      uInk: { value: hex('#0e0e0e') },
      uPaper: { value: hex('#ede8dc') },
      uAccent: { value: hex('#ff3d00') },
    }),
    [texture],
  );

  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    const tex = u.uTex.value as THREE.Texture;
    if (tex.colorSpace !== THREE.NoColorSpace) {
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    }
    const img = tex.image as { width: number; height: number } | undefined;
    if (img?.width) u.uImgAspect.value = img.width / img.height;
    const dpr = state.viewport.dpr;
    u.uRes.value.set(size.width * dpr, size.height * dpr);
    u.uCell.value = 7 * dpr;
    u.uPlaneAspect.value = size.width / size.height;
    u.uReveal.value += ((reveal.current ?? 0) - u.uReveal.value) * 0.08;
    const p = pointer.current;
    if (p) {
      mouseOn.current += ((p.active ? 1 : 0) - mouseOn.current) * 0.1;
      mouseTarget.current.set((p.x + 1) / 2, (p.y + 1) / 2);
      u.uMouse.value.lerp(mouseTarget.current, 0.25);
    }
    u.uMouseOn.value = mouseOn.current;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

/** Halftone-to-photo portrait. `reveal` (0..1) is driven by the parent's scroll progress. */
export default function HalftonePortrait({
  src,
  reveal,
  className,
}: {
  src: string;
  reveal: React.RefObject<number>;
  className?: string;
}) {
  return (
    <FieldCanvas className={className}>
      {(pointer) => (
        <Suspense fallback={null}>
          <Plane src={src} reveal={reveal} pointer={pointer} />
        </Suspense>
      )}
    </FieldCanvas>
  );
}
