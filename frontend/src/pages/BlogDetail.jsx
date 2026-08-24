import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogDetail } from '../hooks/useBlogs';
import { Calendar, ArrowLeft, Eye, Tag } from 'lucide-react';
import SEO from '../components/SEO';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();


    // Use React Query hook - automatic caching!
    const { data: blog, isLoading: loading, error } = useBlogDetail(slug);

    if (loading) {
        return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 flex items-center justify-center min-h-screen">
      <SEO title="Blog Detail" />
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Blog Not Found</h1>
                <p className="text-lg md:text-xl text-gray-400 mb-10">{error}</p>
                <button onClick={() => navigate('/blog')} className="btn-primary text-xl px-8 py-4">
                    Back to Blogs
                </button>
            </div>
        );
    }

    return (
        <div
            className="relative pt-32 pb-24 min-h-screen"
            style={{ zIndex: 1 }}
        >
            <SEO 
                title={blog.title}
                description={blog.excerpt}
                image={blog.thumbnailUrl}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": blog.title,
                    "image": blog.thumbnailUrl,
                    "author": {
                        "@type": "Person",
                        "name": blog.author
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Ownvibes",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.ownvibes.in/logo.png"
                        }
                    },
                    "datePublished": blog.publishedDate ? new Date(blog.publishedDate).toISOString() : new Date().toISOString(),
                    "description": blog.excerpt
                }}
            />
            {/* Luxurious Blurred Light background shapes to match DestinationPicker */}
            <div className="absolute -top-10 -left-20 w-96 h-96 bg-[#e7b56733] rounded-full blur-[110px] opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 -right-24 w-96 h-96 bg-[#fff8e1a0] rounded-full blur-[100px] opacity-50 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#222031] via-[#100c2e] to-[#43290b]" />

            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-4 mb-10 relative z-10">
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-white/80 hover:text-[#FFD700] transition-colors font-semibold text-lg md:text-xl"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Back to all blogs
                </button>
            </div>

            {/* Blog Content */}
            <article className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Category Badge */}
                <div className="mb-8">
                    <span className="px-5 py-3 bg-primary/10 text-[#FFD700] text-lg md:text-xl font-bold rounded-full tracking-wider shadow-lg">
                        {blog.category}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-black text-white mb-10 leading-tight drop-shadow-[0_2px_12px_rgba(218,174,94,0.14)]">
                    {blog.title}
                </h1>

                {/* Meta Info */}
                <div className="flex items-center gap-8 text-[#f9e9be] text-lg md:text-2xl mb-12 pb-10 border-b border-white/15">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 md:w-7 md:h-7" />
                        {new Date(blog.publishedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center gap-3">
                        <Eye className="w-6 h-6 md:w-7 md:h-7" />
                        {blog.views} views
                    </div>
                    <div className="text-[#FFD700]/80 text-lg md:text-xl">
                        By {blog.author}
                    </div>
                </div>

                {/* Thumbnail */}
                {blog.thumbnailUrl && (
                    <div className="mb-16 rounded-2xl overflow-hidden shadow-xl border-2 border-[#FFD700]/30">
                        <img
                            src={blog.thumbnailUrl}
                            alt={blog.title}
                            className="w-full h-auto object-cover bg-black/20"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Excerpt */}
                <div className="mb-12 p-8 bg-[#fff8e1dd] border-l-4 border-[#FFD700] rounded-lg shadow">
                    <p className="text-2xl md:text-3xl text-[#1f2937] italic">{blog.excerpt}</p>
                </div>

                {/* Content */}
                <div
                    className="prose max-w-none mb-16 prose-2xl md:prose-3xl prose-headings:text-[#FFD700] prose-a:text-[#FFB300] prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    style={{
                        color: '#f4e9d0',
                        lineHeight: '2.13',
                        fontSize: '1.65rem', // Make content text even bigger
                    }}
                />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-16 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Tag className="w-7 h-7 text-[#FFD700]" />
                            {blog.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-5 py-2.5 bg-[#fff8e1a0] text-[#332700] text-lg md:text-xl rounded-full hover:bg-[#FFD700]/70 transition-colors font-semibold backdrop-blur-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Blogs Button */}
                <div className="text-center pt-10 border-t border-white/10">
                    <button
                        onClick={() => navigate('/blog')}
                        className="btn-primary px-10 py-5 bg-gradient-to-r from-[#FFD700] via-[#FFC872] to-[#FF9800] text-dark font-black shadow-xl border-2 border-[#FFD700] hover:scale-105 active:scale-95 transition-all text-xl md:text-2xl"
                    >
                        View More Blogs
                    </button>
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;
