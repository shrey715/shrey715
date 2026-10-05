'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ACCENT } from '@/lib/constants';

const EMAIL = 'shreyas.deb@research.iiit.ac.in';

type Line = { kind: 'cmd' | 'out'; text: string };

const SCRIPT: Line[] = [
  { kind: 'cmd', text: 'whoami' },
  { kind: 'out', text: 'shreyas deb — researcher & developer, iiit hyderabad' },
  { kind: 'cmd', text: 'echo $STATUS' },
  { kind: 'out', text: 'open to projects · research collaborations · talking shop' },
  { kind: 'cmd', text: 'mail --to' },
];

/**
 * Contact as a terminal session: the commands type themselves out when the
 * card scrolls into view, ending on the email address with a copy action.
 */
export default function ContactTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();
  // [line index, chars typed on that line]
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [copied, setCopied] = useState<number>(0);

  const done = prefersReducedMotion || pos[0] >= SCRIPT.length;

  useEffect(() => {
    if (!inView || done) return;
    const [li, ci] = pos;
    const line = SCRIPT[li];
    // Commands type character by character; output lands a beat later, whole.
    const delay = line.kind === 'cmd' ? (ci === 0 ? 380 : 42 + Math.random() * 40) : 160;
    const t = setTimeout(() => {
      if (line.kind === 'out' || ci >= line.text.length) setPos([li + 1, 0]);
      else setPos([li, ci + 1]);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, done, pos]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      return;
    }
    setCopied((n) => n + 1);
  };

  const shown = SCRIPT.slice(0, done ? SCRIPT.length : pos[0] + 1).map((l, i) =>
    !done && i === pos[0] && l.kind === 'cmd' ? { ...l, text: l.text.slice(0, pos[1]) } : l,
  );

  return (
    <div ref={ref} className="w-full hard-border border-paper/40 bg-paper text-ink">
      <div className="border-b-2 border-ink px-5 py-3 font-mono-label text-[11px] flex items-center justify-between">
        <span>~/contact — zsh</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> INBOX OPEN
        </span>
      </div>

      <div className="p-5 sm:p-7 font-mono text-[13px] leading-relaxed min-h-[15rem]" aria-live="polite">
        {shown.map((l, i) => (
          <div key={i} className={l.kind === 'cmd' ? 'text-ink' : 'text-ink/60 mb-3'}>
            {l.kind === 'cmd' && <span className="text-accent select-none">$ </span>}
            {l.text}
          </div>
        ))}

        {done && (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${EMAIL}`} className="font-bold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent break-all">
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copy}
                data-cursor="COPY"
                className="inline-flex items-center gap-1.5 px-2 py-1 border-2 border-ink font-mono-label text-[9px] hover:bg-ink hover:text-paper active:scale-95 transition-colors"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
            {copied > 0 && (
              <motion.div key={copied} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-ink/60">
                <span className="text-accent">✓</span> address copied to clipboard
              </motion.div>
            )}
            <div className="mt-3">
              <span className="text-accent select-none">$ </span>
              <span className="inline-block w-2 h-4 align-middle bg-ink animate-pulse" aria-hidden="true" />
            </div>
          </motion.div>
        )}
        {!done && <span className="inline-block w-2 h-4 align-middle bg-ink animate-pulse" aria-hidden="true" />}
      </div>

      <div className="px-5 sm:px-7 pb-6">
        <motion.a
          href={`mailto:${EMAIL}`}
          whileHover={{ x: -3, y: -3, boxShadow: `6px 6px 0 0 ${ACCENT}` }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 px-5 font-mono-label text-sm flex items-center justify-between gap-3 bg-ink text-paper hard-border"
        >
          <span>Send an email</span>
          <ArrowRight size={18} />
        </motion.a>
      </div>
    </div>
  );
}
