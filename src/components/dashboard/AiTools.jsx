'use client';

import { useState } from 'react';
import { Sparkles, LoaderCircle, Check, Copy, ChevronDown } from 'lucide-react';
import {
  generateSummary, generateMetaDescription, suggestHeadlines,
  generateFaqs, generateKeyTakeaways, generateSocialCaptions, recommendTags,
} from '@/lib/ai-editorial';

function ResultBlock({ result, onApply, applyLabel = 'Apply' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mt-2 p-3 bg-black/40 border border-gray-800 rounded-lg text-sm text-gray-300">
      {typeof result === 'string' ? (
        <p className="whitespace-pre-wrap">{result}</p>
      ) : Array.isArray(result) ? (
        <ul className="space-y-1">
          {result.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>{typeof r === 'string' ? r : r.question}</span>
            </li>
          ))}
        </ul>
      ) : (
        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result, null, 2)}</pre>
      )}
      <div className="flex gap-2 mt-3">
        {onApply && (
          <button onClick={onApply} className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-md hover:bg-yellow-400 transition-colors">
            {applyLabel}
          </button>
        )}
        <button onClick={copy} className="px-3 py-1.5 bg-white/5 border border-gray-800 text-xs rounded-md hover:bg-white/10 transition-colors flex items-center gap-1.5">
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function AiTools({ form, update }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});

  const run = async (key, fn) => {
    setLoading(key);
    try {
      const result = await fn(form);
      setResults((r) => ({ ...r, [key]: result }));
    } finally {
      setLoading(null);
    }
  };

  const tools = [
    { key: 'summary', label: 'Generate Summary', fn: generateSummary, apply: (r) => update({ excerpt: r }), applyLabel: 'Use as excerpt' },
    { key: 'meta', label: 'Meta Description', fn: generateMetaDescription, apply: (r) => update({ metaDescription: r }), applyLabel: 'Use as meta' },
    { key: 'headlines', label: 'Suggest Headlines', fn: suggestHeadlines, apply: null },
    { key: 'takeaways', label: 'Key Takeaways', fn: generateKeyTakeaways, apply: (r) => update({ keyTakeaways: r }), applyLabel: 'Add takeaways' },
    { key: 'faq', label: 'Generate FAQ', fn: generateFaqs, apply: (r) => update({ faqs: r }), applyLabel: 'Add FAQ' },
    { key: 'tags', label: 'Recommend Tags', fn: recommendTags, apply: (r) => update({ tags: r }), applyLabel: 'Apply tags' },
    { key: 'social', label: 'Social Captions', fn: generateSocialCaptions, apply: null },
  ];

  return (
    <div className="bg-gradient-to-b from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={18} />
          <h3 className="font-bold">AI Editorial Tools</h3>
        </div>
        <ChevronDown className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
      </button>

      {open && (
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 mb-4">
            Assistance to speed up publishing — always review before applying. (Connect an API key to enable full AI generation.)
          </p>
          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.key}>
                <button
                  onClick={() => run(tool.key, tool.fn)}
                  disabled={loading === tool.key}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-yellow-500" />
                    {tool.label}
                  </span>
                  {loading === tool.key && <LoaderCircle className="animate-spin text-yellow-500" size={15} />}
                </button>
                {results[tool.key] && (
                  <ResultBlock
                    result={results[tool.key]}
                    onApply={tool.apply ? () => tool.apply(results[tool.key]) : null}
                    applyLabel={tool.applyLabel}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
