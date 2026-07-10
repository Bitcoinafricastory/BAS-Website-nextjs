import Link from 'next/link';

export default function PostCard({ post }) {
  return (
    <Link href={`/news/${post.slug || post.id}`} className="group bg-gray-900 border border-gray-800 overflow-hidden hover:border-yellow-500 transition-all duration-300 hover:scale-105">
      <div className="aspect-video overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-4 left-4">
          <span className="text-xs font-semibold text-black bg-yellow-500 px-3 py-1 rounded-full">{post.category}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">{post.category}</span>
          <span className="text-xs text-gray-500">{post.readTime}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-500 transition-colors duration-200">{post.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div>{post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</div>
          </div>
          <span className="text-yellow-500 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
      </div>
    </Link>
  );
}
