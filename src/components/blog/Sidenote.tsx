/**
 * Margin note for MDX posts: `<Sidenote>…</Sidenote>`. On very wide screens it
 * floats into the empty right margin beside the paragraph it follows; on
 * narrower ones it sits inline as a small aside.
 */
export default function Sidenote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="sidenote my-5 border-l-2 border-accent/60 pl-3 text-sm text-ink/60 leading-relaxed 2xl:float-right 2xl:clear-right 2xl:w-56 2xl:-mr-64 2xl:my-1 2xl:border-l-0 2xl:pl-0 2xl:border-t-2 2xl:pt-2">
      <span className="block font-mono-label text-[9px] text-accent mb-1">NOTE</span>
      {children}
    </aside>
  );
}
