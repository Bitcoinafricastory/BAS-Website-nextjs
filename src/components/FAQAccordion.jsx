'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function slugifyQuestion(question, id) {
  const base = (question || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return base || id;
}

export default function FAQAccordion({ groups }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-14">
      {groups.map(({ category, items }) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-5 text-yellow-500">{category}</h2>
          <div className="border-t border-gray-800">
            {items.map((faq) => {
              const anchor = slugifyQuestion(faq.question, faq.id);
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} id={anchor} className="border-b border-gray-800 scroll-mt-24">
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-base sm:text-lg group-hover:text-yellow-500 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-500' : ''}`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="pb-6 text-gray-400 leading-relaxed prose prose-invert max-w-none prose-a:text-yellow-500"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
