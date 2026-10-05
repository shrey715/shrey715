'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Entry = { kind: 'in' | 'out' | 'err'; text: string };

const ROUTES: Record<string, string> = {
  '~': '/',
  '/': '/',
  home: '/',
  projects: '/projects',
  blog: '/blog',
  about: '/#about',
  experience: '/#experience',
  skills: '/#skills',
  contact: '/#contact',
};

const LS = ['about/', 'experience/', 'skills/', 'projects/', 'blog/', 'contact/', 'resume.pdf'];

const HELP = [
  'ls                 list what exists',
  'cd <dir>           go somewhere real (try: cd projects)',
  'open <project>     open a project by name',
  'cat resume.pdf     open the résumé',
  'whoami             who runs this machine',
  'clear              clear the screen',
];

/**
 * The 404 as a working shell: real commands navigate the site. Tab completes
 * directories; ↑/↓ walks history.
 */
export default function Shell404({ projects }: { projects: { slug: string; title: string }[] }) {
  const router = useRouter();
  const path = usePathname();
  const [log, setLog] = useState<Entry[]>([
    { kind: 'err', text: `bash: ${path || 'this page'}: No such file or directory` },
    { kind: 'out', text: "type 'help' for commands, or 'cd ~' to go home." },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [log]);

  const print = (...entries: Entry[]) => setLog((l) => [...l, ...entries]);

  const go = (href: string, label: string) => {
    print({ kind: 'out', text: `→ ${label}` });
    setTimeout(() => {
      // Home-page sections go through the site's hash-free section nav
      // (useSectionNav picks this up once "/" mounts).
      if (href.startsWith('/#')) {
        sessionStorage.setItem('pendingSectionScroll', href.slice(2));
        router.push('/');
      } else router.push(href);
    }, 350);
  };

  const run = (raw: string) => {
    const line = raw.trim();
    print({ kind: 'in', text: line });
    if (!line) return;
    setHistory((h) => [line, ...h].slice(0, 30));
    setHIdx(-1);
    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(' ').replace(/\/$/, '').toLowerCase();

    switch (cmd.toLowerCase()) {
      case 'help':
        print(...HELP.map((t) => ({ kind: 'out' as const, text: t })));
        break;
      case 'ls':
        print({ kind: 'out', text: LS.join('   ') });
        break;
      case 'cd': {
        const target = ROUTES[arg || '~'];
        if (target) go(target, target);
        else print({ kind: 'err', text: `cd: ${arg}: No such file or directory` });
        break;
      }
      case 'open': {
        const hit = projects.find((p) => p.slug === arg || p.title.toLowerCase().includes(arg));
        if (arg && hit) go(`/projects/${hit.slug}`, hit.title);
        else print({ kind: 'err', text: `open: ${arg || '(nothing)'}: no such project — try 'cd projects'` });
        break;
      }
      case 'cat':
        if (arg === 'resume.pdf') {
          print({ kind: 'out', text: '→ opening résumé' });
          window.open(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/shreyas_deb_resume.pdf`, '_blank', 'noopener,noreferrer');
        } else print({ kind: 'err', text: `cat: ${arg}: No such file or directory` });
        break;
      case 'whoami':
        print({ kind: 'out', text: 'shreyas deb — researcher & developer, iiit hyderabad' });
        break;
      case 'clear':
        setLog([]);
        break;
      case 'sudo':
        print({ kind: 'err', text: 'nice try.' });
        break;
      case 'exit':
        go('/', '/');
        break;
      default:
        print({ kind: 'err', text: `${cmd}: command not found` });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = Math.min(hIdx + 1, history.length - 1);
      if (history[n] !== undefined) {
        setHIdx(n);
        setInput(history[n]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(Math.max(n, -1));
      setInput(n >= 0 ? history[n] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const m = input.match(/^(cd|open)\s+(\S*)$/i);
      if (!m) return;
      const pool = m[1].toLowerCase() === 'cd' ? Object.keys(ROUTES).filter((k) => /^[a-z]/.test(k)) : projects.map((p) => p.slug);
      const hit = pool.find((k) => k.startsWith(m[2].toLowerCase()));
      if (hit) setInput(`${m[1]} ${hit}`);
    }
  };

  return (
    <div
      className="w-full max-w-2xl hard-border bg-ink text-paper hard-shadow-accent text-left"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-paper/15 font-mono-label text-[10px] text-paper/50">
        <span>shreyas@portfolio: ~</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 bg-paper/20" />
          <span className="w-2.5 h-2.5 bg-paper/20" />
          <span className="w-2.5 h-2.5 bg-accent" />
        </span>
      </div>
      <div ref={bodyRef} className="p-4 sm:p-5 font-mono text-[13px] leading-relaxed h-64 overflow-y-auto" aria-live="polite">
        {log.map((e, i) => (
          <div key={i} className={e.kind === 'err' ? 'text-accent' : e.kind === 'out' ? 'text-paper/60 whitespace-pre-wrap' : 'text-paper'}>
            {e.kind === 'in' && <span className="text-accent select-none">$ </span>}
            {e.text}
          </div>
        ))}
        <label className="flex items-center gap-2">
          <span className="text-accent select-none">$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            aria-label="Shell command"
            className="flex-1 bg-transparent outline-none caret-accent text-paper"
          />
        </label>
      </div>
    </div>
  );
}
