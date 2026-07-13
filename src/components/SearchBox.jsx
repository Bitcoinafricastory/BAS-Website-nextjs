'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchBox({ initialQuery = '', autoFocus = false }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        Search Bitcoin Africa Story
      </label>
      <SearchIcon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        size={20}
      />
      <input
        id="site-search"
        type="search"
        name="q"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search news, stories, and events..."
        className="w-full pl-12 pr-28 py-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-yellow-500 text-black font-bold text-sm rounded-lg hover:brightness-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Search
      </button>
    </form>
  );
}
