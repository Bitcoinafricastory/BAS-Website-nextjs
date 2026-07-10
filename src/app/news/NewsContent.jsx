'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, PlusCircle } from 'lucide-react';
import PostsGrid from '@/components/PostsGrid';
import StoryEditor from '@/components/StoryEditor';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const categories = ['All', 'Adoption', 'Regulations', 'Education', 'Technology', 'Economy', 'Security', 'Community'];

const emptyForm = {
  title: '',
  slug: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  readTime: '',
  image: '',
  excerpt: '',
  content: '',
  authorName: '',
  authorImage: '',
  authorLinkedIn: '',
  authorX: '',
  youtubeUrl: '',
};

function HeroCarousel() {
  const images = ['/assets/blogbg1.jpg', '/assets/blogbg2.jpg'];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActive((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full min-h-screen object-cover opacity-70 transition-opacity duration-1000"
          style={{ opacity: i === active ? 0.7 : 0 }}
        />
      ))}
    </div>
  );
}

export default function NewsContent({ initialPosts = [] }) {
  const [posts] = useState(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  const [authorImageMode, setAuthorImageMode] = useState('url');
  const [authorImagePreview, setAuthorImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const filteredPosts = useMemo(
    () => posts.filter((post) => selectedCategory === 'All' || post.category === selectedCategory),
    [posts, selectedCategory]
  );

  const groupedPosts = useMemo(() => {
    return posts.reduce((acc, post) => {
      const cat = post.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(post);
      return acc;
    }, {});
  }, [posts]);

  const categoriesToShow = categories.filter((c) => c !== 'All');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && { slug: value.toLowerCase().replace(/\s+/g, '-') }),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image file must not be more than 5MB');
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, image: file }));
    setSubmitError('');
  };

  const handleAuthorFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image file must not be more than 5MB');
      return;
    }
    setAuthorImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, authorImage: file }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      if (!formData.title || !formData.category || !formData.date || !formData.excerpt || !formData.content || !formData.authorName) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      let imageUrl = formData.image;
      if (imageUrl instanceof Blob) {
        const storageRef = ref(storage, `submissions/sub_${Date.now()}`);
        await uploadBytes(storageRef, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      let authorImageUrl = formData.authorImage;
      if (authorImageUrl instanceof Blob) {
        const authorStorageRef = ref(storage, `submissions/author_${Date.now()}`);
        await uploadBytes(authorStorageRef, authorImageUrl);
        authorImageUrl = await getDownloadURL(authorStorageRef);
      }

      await addDoc(collection(db, 'submitted_stories'), {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        date: formData.date,
        readTime: formData.readTime || '5 min read',
        image: imageUrl,
        excerpt: formData.excerpt,
        content: formData.content,
        authorName: formData.authorName,
        authorImage: authorImageUrl || '',
        authorLinkedIn: formData.authorLinkedIn || '',
        authorX: formData.authorX || '',
        youtubeUrl: formData.youtubeUrl || '',
        submittedAt: serverTimestamp(),
      });

      setSubmitMessage('Story submitted successfully! Thank you for your contribution.');
      setFormData(emptyForm);
      setImagePreview('');
      setAuthorImagePreview('');
      setImageMode('url');
      setAuthorImageMode('url');

      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting story:', error);
      setSubmitError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      <section id="hero" className="relative flex items-center overflow-hidden">
        <HeroCarousel />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
              <h1 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
                <span>The </span> <br className="sm:hidden" /> <span>Pulse of </span> <br className="sm:hidden" /> <span>Bitcoin </span> <br /> <span className="text-yellow-400">in Africa</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
                Spotlighting innovation, grassroots adoption, policy developments, and the people using
                Bitcoin to build financial freedom in Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 md:sticky top-16 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 font-medium transition-all duration-200 ${selectedCategory === category ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          {selectedCategory === 'All' ? (
            categoriesToShow.map((cat) => {
              const catPosts = groupedPosts[cat] || [];
              if (catPosts.length === 0) return null;
              return (
                <div key={cat} className="mb-16">
                  <h3 className="text-2xl md:text-3xl font-bold mb-8">{cat}</h3>
                  <PostsGrid posts={catPosts} />
                </div>
              );
            })
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No articles found in this category yet.</p>
            </div>
          ) : (
            <PostsGrid posts={filteredPosts} />
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Share Your Bitcoin <span className="text-yellow-500">Story</span>
            </h2>
            <p className="text-lg text-gray-300">
              Have a Bitcoin adoption story or education content to share? Submit your story below.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full mb-6 px-8 py-4 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105"
          >
            {showForm ? 'Cancel' : 'Submit Your Story'}
          </button>

          {showForm && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <PlusCircle className="text-yellow-500" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Submit Your Story</h2>
                  <p className="text-xs text-gray-500">Fill in the details below</p>
                </div>
              </div>

              {submitError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200">{submitError}</p>
                </div>
              )}
              {submitMessage && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-200">{submitMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="e.g., How Bitcoin Changed My Business" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none">
                      <option value="">Select a category</option>
                      {categoriesToShow.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Excerpt *</label>
                  <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none resize-none" placeholder="A short summary of your story" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Story *</label>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <StoryEditor value={formData.content} onChange={(content) => setFormData((prev) => ({ ...prev, content }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Cover Image</label>
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>URL</button>
                    <button type="button" onClick={() => setImageMode('file')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>Upload</button>
                  </div>
                  {imageMode === 'url' ? (
                    <input type="url" value={formData.image instanceof Blob ? '' : formData.image} onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="https://example.com/image.jpg" />
                  ) : (
                    <input type="file" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-black file:cursor-pointer" />
                  )}
                  {imagePreview && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-32">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Your Name *</label>
                    <input type="text" name="authorName" value={formData.authorName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Read Time</label>
                    <input type="text" name="readTime" value={formData.readTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="e.g., 5 min read" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your Photo</label>
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setAuthorImageMode('url')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${authorImageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>URL</button>
                    <button type="button" onClick={() => setAuthorImageMode('file')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${authorImageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>Upload</button>
                  </div>
                  {authorImageMode === 'url' ? (
                    <input type="url" value={formData.authorImage instanceof Blob ? '' : formData.authorImage} onChange={(e) => setFormData((prev) => ({ ...prev, authorImage: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="https://example.com/you.jpg" />
                  ) : (
                    <input type="file" onChange={handleAuthorFileChange} accept="image/*" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-black file:cursor-pointer" />
                  )}
                  {authorImagePreview && (
                    <div className="mt-4 rounded-full overflow-hidden border border-white/10 h-20 w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={authorImagePreview} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">LinkedIn (optional)</label>
                    <input type="url" name="authorLinkedIn" value={formData.authorLinkedIn} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="https://linkedin.com/in/you" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">X / Twitter (optional)</label>
                    <input type="url" name="authorX" value={formData.authorX} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" placeholder="https://x.com/you" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full px-8 py-4 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : 'Submit Story'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
