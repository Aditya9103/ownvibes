import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogs } from '../hooks/useBlogs';
import { Calendar, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const BlogPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');


    // Use React Query hook - automatic caching!
    // Note: Blog list doesn't need translation, only detail page does
    const { data: blogs = [], isLoading: loading } = useBlogs(selectedCategory);

    const categories = [
        { id: 'all', label: 'All Articles' },
        { id: 'Health', label: 'Health & Nutrition' },
        { id: 'Recipe', label: 'Premium Recipes' },
        { id: 'Lifestyle', label: 'Luxury Lifestyle' },
        { id: 'Organic', label: 'Organic Living' }
    ];

    if (loading) {
        return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Ownvibes Blog - Insights & Stories",
        "description": "Explore premium recipes, organic living, and wellness wisdom.",
        "url": "https://www.ownvibes.in/blog",
        "blogPost": blogs.map(blog => ({
            "@type": "BlogPosting",
            "headline": blog.title,
            "url": `https://www.ownvibes.in/blog/${blog.slug}`
        }))
    };

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": blogs.map((blog, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://www.ownvibes.in/blog/${blog.slug}`
        }))
    };

    return (
  <div className="relative pt-32 pb-24 min-h-screen overflow-hidden bg-amber-50">
      <SEO 
          title="Blog - Insights & Stories" 
          description="Explore premium recipes, organic living, and wellness wisdom."
          schema={[blogSchema, itemListSchema]} 
      />

    {/* Soft Luxury Background Glows */}
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-[150px]"></div>
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-[120px]"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-semibold text-amber-900">
          Insights & <span className="text-amber-600 italic font-serif">Stories</span>
        </h1>
        <p className="text-amber-700/80 mt-4 max-w-2xl mx-auto text-lg">
          Explore premium recipes, organic living, and wellness wisdom.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-14">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300
              ${
                selectedCategory === cat.id
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-20 text-amber-700 text-lg">
          No blogs found in this category.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog.slug}`)}
              className="group cursor-pointer"
            >

              <div className="
                relative rounded-3xl overflow-hidden
                backdrop-blur-xl bg-white/60
                border border-amber-200
                shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                transition-all duration-500
                flex flex-col
              ">

                {/* Image */}
                {blog.thumbnailUrl && (
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={blog.thumbnailUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      onError={e => e.target.style.display = "none"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">

                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-3 text-xs text-amber-600 font-medium">
                    <span className="bg-amber-100 px-3 py-1 rounded-full">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.publishedDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-semibold text-amber-900 group-hover:text-amber-700 transition line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-amber-800/80 text-sm mt-3 line-clamp-3 flex-1">
                    {blog.excerpt}
                  </p>

                  {/* Tags */}
                  {blog.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/blog/${blog.slug}`);
                    }}
                    className="mt-6 w-full py-3 rounded-full font-medium text-sm
                      bg-amber-600 text-white
                      hover:bg-amber-700
                      transition-all flex items-center justify-center gap-2"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  </div>
);
};

export default BlogPage;
