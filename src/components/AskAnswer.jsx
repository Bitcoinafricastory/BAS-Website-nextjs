'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Newspaper, Globe, Calendar } from 'lucide-react';

// The AI answer at the top of the search page. It loads after the regular
// results (which are server-rendered and instant), so search never waits on
// the AI. Citations like [2] link to the source they came from.

const ICON = { article: Newspaper, directory: Globe, event: Calendar };

function withCitations(text, sources) {
  const parts = String(text).split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    const src = m && sources.find((s) => s.n === Number(m[1]));
    if (!src) return <span key={i}>{part}</span>;
    return (
      <Link key={i} href={src.url} title={src.title} className="inline-flex items-center justify-center min-w-[1.35rem] h-[1.35rem] px-1 mx-0.5 -translate-y-px rounded-md bg-yellow-500/15 text-yellow-400 text-[11px] font-bold align-middle hover:bg-yellow-500 hover:text-black transition-colors">
        {src.n}
      </Link>
    );
  });
}

export default function AskAnswer({ question }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: question }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok && data.answer) setState({ status: 'done', ...data });
        else setState({ status: 'empty', error: data?.error });
      })
      .catch(() => { if (!cancelled) setState({ status: 'empty' }); });
    return () => { cancelled = true; };
  }, [question]);

  if (state.status === 'empty') {
    return state.error ? <p className="mt-8 text-xs text-gray-600">{state.error}</p> : null;
  }

  return (
    <section aria-live="polite" className="mt-8 rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/[0.07] to-transparent p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-yellow-500" />
        <h2 className="text-sm font-semibold text-white">Answer from our stories</h2>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-500">AI</span>
      </div>

      {state.status === 'loading' ? (
        <div className="space-y-2.5" aria-label="Reading our stories">
          <div className="h-3.5 rounded bg-white/10 animate-pulse w-11/12" />
          <div className="h-3.5 rounded bg-white/10 animate-pulse w-10/12" />
          <div className="h-3.5 rounded bg-white/10 animate-pulse w-7/12" />
          <p className="pt-1 text-xs text-gray-500">Reading our stories…</p>
        </div>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-gray-200">{withCitations(state.answer, state.sources)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.sources.filter((s) => state.answer.includes(`[${s.n}]`)).map((s) => {
              const Icon = ICON[s.type] || Newspaper;
              return (
                <Link key={s.n} href={s.url} className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-full bg-surface border border-line text-xs text-gray-300 hover:border-yellow-500/50 hover:text-yellow-500 transition-colors">
                  <span className="font-bold text-yellow-500">{s.n}</span>
                  <Icon size={12} className="shrink-0" />
                  <span className="truncate">{s.title}</span>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-gray-600">Written by AI from Bitcoin Africa Story articles and directory. Check the linked sources; not financial advice.</p>
        </>
      )}
    </section>
  );
}
