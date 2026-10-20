'use client';
// Optional UI sound, synthesized with Web Audio (no audio files): a pen
// scratch for plotted type, a paper shuffle for sheets/menus, a soft tick for
// hovers. Off by default; the choice is remembered per browser.

export type SoundName = 'scratch' | 'paper' | 'tick';

const KEY = 'snd';
export const SOUND_EVENT = 'sound:change';

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
const lastPlayed: Partial<Record<SoundName, number>> = {};
// Don't machine-gun the same sound (e.g. ten headings tracing at once).
const MIN_GAP: Record<SoundName, number> = { scratch: 450, paper: 250, tick: 60 };

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // Storage blocked — the toggle still works for this page view.
  }
  memo = on;
  window.dispatchEvent(new Event(SOUND_EVENT));
  if (on) playSound('tick');
}

let memo: boolean | null = null;
function enabled() {
  if (memo === null) memo = soundEnabled();
  return memo;
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const ch = noise.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function burst(a: AudioContext, opts: { dur: number; freq: number; q: number; gain: number; type?: BiquadFilterType; wobble?: boolean }) {
  const src = a.createBufferSource();
  src.buffer = noise;
  const filter = a.createBiquadFilter();
  filter.type = opts.type ?? 'bandpass';
  filter.frequency.value = opts.freq;
  filter.Q.value = opts.q;
  const g = a.createGain();
  const t = a.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(opts.gain, t + 0.012);
  if (opts.wobble) {
    // A pen catching on paper fibre: little bursts of pressure.
    for (let k = 1; k < 8; k++) g.gain.linearRampToValueAtTime(opts.gain * (0.35 + Math.random() * 0.65), t + (opts.dur * k) / 8);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  src.connect(filter).connect(g).connect(a.destination);
  src.start(t, Math.random() * 0.5, opts.dur + 0.05);
}

export function playSound(name: SoundName) {
  if (typeof window === 'undefined' || !enabled()) return;
  const now = performance.now();
  if (now - (lastPlayed[name] ?? 0) < MIN_GAP[name]) return;
  lastPlayed[name] = now;
  const a = audio();
  if (!a || !noise) return;
  switch (name) {
    case 'scratch':
      burst(a, { dur: 0.42, freq: 3400, q: 1.4, gain: 0.05, wobble: true });
      break;
    case 'paper':
      burst(a, { dur: 0.22, freq: 1800, q: 0.6, gain: 0.09, type: 'highpass' });
      break;
    case 'tick':
      burst(a, { dur: 0.03, freq: 5200, q: 6, gain: 0.06 });
      break;
  }
}
