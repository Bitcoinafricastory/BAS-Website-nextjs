'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Circle, Search, Sparkles, ChevronDown } from 'lucide-react';
import { seoAnalysis, readabilityScore, aeoRecommendations } from '@/lib/seo-analysis';

function ScoreRing({ score, label }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#27272a" strokeWidth="5" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color }}>{score}</div>
      </div>
      <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">{label}</span>
    </div>
  );
}

const STATUS_ICON = {
  pass: <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />,
  warn: <AlertTriangle className="text-yellow-500 flex-shrink-0" size={16} />,
  fail: <XCircle className="text-red-500 flex-shrink-0" size={16} />,
  done: <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />,
  todo: <Circle className="text-gray-500 flex-shrink-0" size={16} />,
};

export default function SeoPanel({ form, update }) {
  const [open, setOpen] = useState(true);
  const seo = useMemo(() => seoAnalysis(form), [form]);
  const read = useMemo(() => readabilityScore(form.content), [form.content]);
  const aeo = useMemo(() => aeoRecommendations(form), [form]);

  return (
    <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Search className="text-yellow-500" size={18} />
          <h3 className="font-bold">SEO &amp; AEO</h3>
        </div>
        <ChevronDown className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6">
          {/* Score rings */}
          <div className="flex items-center justify-around py-4 bg-black/30 rounded-xl">
            <ScoreRing score={seo.score} label="SEO" />
            <ScoreRing score={read.score} label="Read" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-black text-yellow-500">{read.grade}</div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">{read.label}</span>
            </div>
          </div>

          {/* SEO fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">SEO Title <span className="text-gray-600">({(form.seoTitle || form.title || '').length} chars)</span></label>
              <input value={form.seoTitle || ''} onChange={(e) => update({ seoTitle: e.target.value })} placeholder={form.title || 'Defaults to article title'} className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta Description <span className="text-gray-600">({(form.metaDescription || form.excerpt || '').length} chars)</span></label>
              <textarea value={form.metaDescription || ''} onChange={(e) => update({ metaDescription: e.target.value })} rows={2} placeholder={form.excerpt || 'Defaults to excerpt'} className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Focus Keyword(s)</label>
                <input value={form.focusKeywords || ''} onChange={(e) => update({ focusKeywords: e.target.value })} placeholder="e.g. bitcoin adoption nigeria" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Canonical URL <span className="text-gray-600">(optional)</span></label>
                <input value={form.canonicalUrl || ''} onChange={(e) => update({ canonicalUrl: e.target.value })} placeholder="Leave blank to auto-generate" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Featured Image Alt Text</label>
                <input value={form.imageAlt || ''} onChange={(e) => update({ imageAlt: e.target.value })} placeholder="Describe the image" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags <span className="text-gray-600">(comma-separated)</span></label>
                <input value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags || '')} onChange={(e) => update({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="lightning, merchants, lagos" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
              </div>
            </div>
          </div>

          {/* SEO checks */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">SEO Checks</h4>
            <div className="space-y-2">
              {seo.checks.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-sm">
                  {STATUS_ICON[c.status]}
                  <div>
                    <span className="text-gray-300">{c.label}</span>
                    <span className="text-gray-500 text-xs block">{c.hint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AEO recommendations */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles size={13} className="text-yellow-500" /> AEO — AI Answer Optimization
            </h4>
            <div className="space-y-2">
              {aeo.map((r) => (
                <div key={r.id} className="flex items-start gap-2 text-sm">
                  {STATUS_ICON[r.status]}
                  <div>
                    <span className="text-gray-300">{r.label}</span>
                    <span className="text-gray-500 text-xs block">{r.hint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
