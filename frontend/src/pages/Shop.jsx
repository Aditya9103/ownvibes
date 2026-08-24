import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, ChevronDown, ChevronRight, Filter, ChevronLeft, LayoutGrid, Shirt, Ghost, Cat, Crown, ShoppingBag, X, Leaf, Wind, Diamond, ArrowRight, List, ShoppingCart } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import teddyBanner from '../assets/teddy_banner1.png';
import SEO from '../components/SEO';

const ShopProductCard = ({ product }) => {
    const { _id, slug, name, price, images, rating = 4.8 } = product;
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!localStorage.getItem('userToken')) {
            navigate('/login');
            return;
        }
        addToCart({ ...product, selectedSize: product.sizes?.[0] || 'M' }, 1);
        navigate('/cart');
    };

    // Simulate original price & discount
    const originalPrice = price === 699 ? 1299 : price === 698 ? 1299 : price + Math.floor(price * 0.86);
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

    // Simulate New vs Bestseller for variety
    const isNew = _id.charCodeAt(0) % 2 === 0;

    return (
        <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 flex flex-col group transition-shadow hover:shadow-lg hover:shadow-black/5 h-full">
            <div className="relative h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* Tags */}
                <div className="absolute top-3 left-3 z-10">
                    {isNew ? (
                        <span className="bg-gray-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">New</span>
                    ) : (
                        <span className="bg-[#b58145] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Bestseller</span>
                    )}
                </div>

                {/* Wishlist */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:shadow transition-all"
                >
                    <Heart size={16} className={isInWishlist(product._id || product.id) ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"} />
                </button>

                <Link to={`/product/${slug || _id}`} className="w-full h-full relative block overflow-hidden">
                    <img
                        src={images && images[0] ? encodeURI(images[0]) : 'https://via.placeholder.com/300'}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>
            </div>

            <div className="p-5 flex flex-col gap-2 flex-1 bg-white">
                <Link to={`/product/${slug || _id}`}>
                    <h3 className="font-extrabold text-[#1c1c1c] text-[14px] leading-tight line-clamp-1">{name}</h3>
                </Link>

                <div className="flex items-center gap-1 mt-0.5 mb-1">
                    <Star size={12} className="text-[#cf7e28] fill-[#cf7e28]" />
                    <Star size={12} className="text-[#cf7e28] fill-[#cf7e28]" />
                    <Star size={12} className="text-[#cf7e28] fill-[#cf7e28]" />
                    <Star size={12} className="text-[#cf7e28] fill-[#cf7e28]" />
                    <Star size={12} className="text-gray-200 fill-gray-200" />
                    <span className="text-[11px] text-gray-400 ml-1 font-bold">(0)</span>
                </div>

                <div className="flex flex-col mt-auto pt-2 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#1c1c1c]">₹{price}</span>
                        <span className="text-[11px] font-bold text-gray-400 line-through mt-1">₹{originalPrice}</span>
                        <span className="text-[11px] font-bold text-[#cf7e28] ml-auto mt-1">{discount}% OFF</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#1c1c1c] hover:bg-black text-white font-bold py-3 rounded-[12px] text-[12px] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                    >
                        <ShoppingCart size={14} /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState(5999);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filters state
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [selectedAges, setSelectedAges] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortOption, setSortOption] = useState('Popularity');

    const scrollContainerRef = useRef(null);

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const selectedCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/products`),
                    axios.get(`${API_BASE_URL}/categories`)
                ]);

                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data);

                if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
                    // Store full category objects so we have access to images/icons
                    setCategoriesList(categoriesRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const priceFilters = ['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', '₹2000 - ₹5000', 'Above ₹5000'];
    const sizeFilters = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

    // Helper to pick an icon based on category name
    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('teddy') || lower.includes('plush')) return <Cat size={18} strokeWidth={1.5} />;
        if (lower.includes('unicorn') || lower.includes('magic')) return <Crown size={18} strokeWidth={1.5} />;
        if (lower.includes('cartoon') || lower.includes('character')) return <Ghost size={18} strokeWidth={1.5} />;
        if (lower.includes('shirt') || lower.includes('tee') || lower.includes('oversize')) return <Shirt size={18} strokeWidth={1.5} />;
        return <ShoppingBag size={18} strokeWidth={1.5} />;
    };

    // Removed hardcoded getCategorySubtitle function

    // Handle Checkbox toggles
    const handleToggle = (setter, state, value) => {
        setter(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
    };

    // Sort categories newest first
    const sortedCategories = useMemo(() => {
        return [...categoriesList].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0; // fallback
        });
    }, [categoriesList]);

    // Apply all filters
    useEffect(() => {
        let updated = [...products];

        // Search query filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            updated = updated.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.description && p.description.toLowerCase().includes(lowerQuery))
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            updated = updated.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        if (selectedPriceRanges.length > 0) {
            updated = updated.filter(p => {
                return selectedPriceRanges.some(range => {
                    if (range === 'Under ₹500') return p.price < 500;
                    if (range === '₹500 - ₹1000') return p.price >= 500 && p.price <= 1000;
                    if (range === '₹1000 - ₹2000') return p.price >= 1000 && p.price <= 2000;
                    if (range === '₹2000 - ₹5000') return p.price >= 2000 && p.price <= 5000;
                    if (range === 'Above ₹5000') return p.price > 5000;
                    return false;
                });
            });
        }

        // For sizes (array of strings in DB)
        if (selectedSizes.length > 0) {
            updated = updated.filter(p => {
                if (!p.sizes || !Array.isArray(p.sizes)) return false;
                return p.sizes.some(productSize =>
                    selectedSizes.some(selectedSize => productSize.toLowerCase() === selectedSize.toLowerCase())
                );
            });
        }

        // Collections
        if (selectedCollections.includes('New Arrivals')) {
            updated = updated.filter(p => p.isNewArrival);
        }
        if (selectedCollections.includes('Best Sellers')) {
            updated = updated.filter(p => p.isBestSeller);
        }

        // Availability
        if (inStockOnly) {
            updated = updated.filter(p => p.stock > 0);
        }

        // Apply slider filter
        updated = updated.filter(p => p.price <= priceRange);

        // Sorting
        if (sortOption === 'Price: Low to High') {
            updated.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'Price: High to Low') {
            updated.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'Newest First') {
            updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // Popularity (default)
            updated.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        setFilteredProducts(updated);
        setCurrentPage(1); // Reset page to 1 when filters change
    }, [products, selectedCategory, searchQuery, selectedPriceRanges, selectedSizes, selectedCollections, inStockOnly, priceRange, sortOption]);

    // Calculate pagination slices
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handleCategoryClick = (cat) => {
        const params = new URLSearchParams(location.search);
        if (cat === 'All') {
            params.delete('category');
        } else {
            params.set('category', cat);
        }
        navigate(`/shop?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#b58145] border-t-transparent"></div>
            </div>
        );
    }

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": currentProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://www.ownvibes.in/product/${product.slug || product._id}`
        }))
    };

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Shop All Premium T-shirts",
        "description": "Browse Ownvibes's full collection of t-shirts, graphic tees, and premium t-shirts.",
        "url": "https://www.ownvibes.in/shop"
    };

    return (
        <div className="bg-[#fdfdfc] min-h-screen pt-4 pb-20 font-sans">
            <SEO
                title="Shop All Premium T-shirts"
                description="Browse Ownvibes's full collection of t-shirts, graphic tees, and premium t-shirts."
                schema={[collectionSchema, itemListSchema]}
            />
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">


                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-[260px] flex-shrink-0 space-y-8">

                        {/* Categories Box */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                            <h3 className="font-extrabold text-[16px] text-[#1c1c1c] mb-5">Categories</h3>
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                                <li
                                    onClick={() => handleCategoryClick('All')}
                                    className={`cursor-pointer text-[14px] flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${selectedCategory === 'All' ? 'bg-[#f8f5f0] text-black font-extrabold' : 'text-gray-600 font-medium hover:bg-gray-50'}`}
                                >
                                    <LayoutGrid size={18} strokeWidth={1.5} className={selectedCategory === 'All' ? 'text-[#b58145]' : 'text-gray-400'} />
                                    All Categories
                                </li>
                                {categoriesList.map(cat => (
                                    <li
                                        key={cat._id || cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`cursor-pointer text-[14px] flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${selectedCategory === cat.name ? 'bg-[#f8f5f0] text-black font-extrabold' : 'text-gray-600 font-medium hover:bg-gray-50'}`}
                                    >
                                        <div className={selectedCategory === cat.name ? 'text-[#b58145]' : 'text-gray-400'}>
                                            {getCategoryIcon(cat.name)}
                                        </div>
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Filter Section */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-extrabold text-[16px] text-[#1c1c1c]">Filter By</h3>
                                <button
                                    onClick={() => {
                                        setSelectedPriceRanges([]);
                                        setSelectedSizes([]);
                                        setSelectedCollections([]);
                                        setInStockOnly(false);
                                        setPriceRange(5999);
                                    }}
                                    className="text-[12px] font-bold text-gray-500 hover:text-black transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3 cursor-pointer">
                                    <h4 className="font-bold text-[13px] text-[#1c1c1c]">Price</h4>
                                    <ChevronDown size={14} className="text-[#b58145]" />
                                </div>
                                <div className="space-y-2.5">
                                    {priceFilters.map(filter => (
                                        <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                                                checked={selectedPriceRanges.includes(filter)}
                                                onChange={() => handleToggle(setSelectedPriceRanges, selectedPriceRanges, filter)}
                                            />
                                            <span className="text-[14px] text-gray-800 font-bold group-hover:text-black">{filter}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <input
                                        type="range"
                                        min="199" max="5999"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="w-full h-1.5 bg-[#e5dfd5] rounded-lg appearance-none cursor-pointer accent-[#b58145]"
                                    />
                                    <div className="flex justify-between text-[11px] font-bold text-gray-800 mt-2">
                                        <span>₹199</span>
                                        <span>₹5999</span>
                                    </div>
                                </div>
                            </div>

                            {/* Size Filter */}
                            <div>
                                <div className="flex justify-between items-center mb-4 cursor-pointer">
                                    <h4 className="font-bold text-[14px] text-[#1c1c1c]">Size</h4>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {sizeFilters.map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => handleToggle(setSelectedSizes, selectedSizes, filter)}
                                            className={`h-9 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${selectedSizes.includes(filter)
                                                ? 'bg-[#b58145] text-white'
                                                : 'bg-[#f4f4f4] text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Collections Filter */}
                            <div className="mb-8 mt-8">
                                <div className="flex justify-between items-center mb-4 cursor-pointer">
                                    <h4 className="font-bold text-[14px] text-[#1c1c1c]">Collections</h4>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                    {['New Arrivals', 'Best Sellers'].map(filter => (
                                        <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                                                checked={selectedCollections.includes(filter)}
                                                onChange={() => handleToggle(setSelectedCollections, selectedCollections, filter)}
                                            />
                                            <span className="text-[14px] text-gray-800 font-bold group-hover:text-black">{filter}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                                        checked={inStockOnly}
                                        onChange={(e) => setInStockOnly(e.target.checked)}
                                    />
                                    <span className="text-[14px] font-bold text-[#1c1c1c] group-hover:text-black">In Stock Only</span>
                                </label>
                            </div>
                        </div>

                    </aside>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col gap-5 min-w-0">

                        {/* Banner */}
                        <div className="bg-gradient-to-br from-[#ebe1d5] to-[#f4ecd8] rounded-[24px] overflow-hidden flex flex-col md:flex-row relative h-auto">
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center z-10 relative">
                                <span className="text-[#4a4036] font-extrabold text-[10px] md:text-[11px] mb-1.5 tracking-[0.15em] uppercase flex items-center gap-2">
                                    NEW <span className="font-medium text-[#7a6a58]">SEASON COLLECTION</span>
                                </span>
                                <h2 className="font-serif text-3xl md:text-[38px] font-black text-[#1c1c1c] leading-[1.05] mb-2 tracking-tight">
                                    Premium<br />
                                    <span className="text-[#b58145]">T-Shirts</span>
                                </h2>
                                <p className="text-[#5a4d41] font-bold text-[12px] md:text-[13px] mb-4 md:mb-5">
                                    Style meets comfort. Wear your vibe.
                                </p>

                                <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/60 border border-white flex items-center justify-center shadow-sm">
                                            <Leaf size={14} className="text-[#4a4036]" />
                                        </div>
                                        <span className="text-[8px] font-bold text-[#4a4036] text-center leading-tight">Ultra Soft<br />Cotton</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/60 border border-white flex items-center justify-center shadow-sm">
                                            <Wind size={14} className="text-[#4a4036]" />
                                        </div>
                                        <span className="text-[8px] font-bold text-[#4a4036] text-center leading-tight">Breathable<br />All Day</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/60 border border-white flex items-center justify-center shadow-sm">
                                            <Diamond size={14} className="text-[#4a4036]" />
                                        </div>
                                        <span className="text-[8px] font-bold text-[#4a4036] text-center leading-tight">Premium<br />Quality</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-[45%] h-[180px] md:h-auto md:min-h-[260px] flex items-end justify-center md:justify-end pt-4 md:pt-0">
                                <img src="/tishirtcombo.png" alt="Premium T-Shirts" className="w-[75%] md:w-[85%] h-full object-contain object-bottom drop-shadow-2xl mix-blend-multiply" />
                            </div>
                        </div>

                        {/* Quick Filters Wrapper */}
                        <div className="relative group">
                            {/* Quick Filters Row */}
                            <div ref={scrollContainerRef} className="flex overflow-x-auto gap-3 py-2 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 items-center scroll-smooth pr-[60px] md:pr-12">
                                {/* "All" button */}
                                <div
                                    onClick={() => handleCategoryClick('All')}
                                    className={`flex flex-col items-center justify-center gap-1 w-[60px] h-[60px] rounded-[14px] cursor-pointer flex-shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-[#111315] text-white shadow-md' : 'bg-[#111315] text-white hover:bg-black'}`}
                                >
                                    <LayoutGrid size={18} className="text-white" />
                                    <span className="font-semibold text-[11px]">All</span>
                                </div>

                                {/* Dynamic Category Buttons */}
                                {sortedCategories.map(cat => (
                                    <div
                                        key={cat._id || cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`flex items-center gap-2.5 pr-4 pl-1.5 py-1.5 h-[60px] rounded-[14px] border cursor-pointer flex-shrink-0 transition-all ${selectedCategory === cat.name ? 'border-[#111315] shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="w-[48px] h-[48px] rounded-[10px] bg-[#f8f9fa] overflow-hidden flex items-center justify-center shrink-0">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover mix-blend-multiply" />
                                            ) : (
                                                <div className="text-gray-400">
                                                    {getCategoryIcon(cat.name)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="font-extrabold text-[13px] text-[#111315] whitespace-nowrap">{cat.name}</span>
                                            <span className="text-[10px] font-medium text-gray-500 mt-0.5">{cat.subtitle || 'Explore'}</span>
                                        </div>
                                    </div>
                                ))}

                            </div>

                            {/* Scroll Right Button */}
                            <div
                                onClick={scrollRight}
                                className="absolute right-0 md:-right-3 top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.12)] flex items-center justify-center cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-shadow border border-gray-100 z-10"
                            >
                                <ChevronRight size={20} className="text-[#111315]" />
                            </div>
                        </div>

                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 mt-2 mb-4">
                            <p className="text-[13px] font-bold text-gray-500">
                                Showing {filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0} - {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-gray-500">Sort by:</span>
                                    <div className="relative">
                                        <select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-[10px] pl-4 pr-10 py-2.5 text-[12px] font-bold text-[#1c1c1c] focus:outline-none focus:border-[#b58145] cursor-pointer shadow-sm"
                                        >
                                            <option>Popularity</option>
                                            <option>Price: Low to High</option>
                                            <option>Price: High to Low</option>
                                            <option>Newest First</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-[10px] p-1 bg-white shadow-sm">
                                    <button className="p-1.5 rounded-[8px] bg-[#f4f4f4] text-[#1c1c1c]">
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button className="p-1.5 rounded-[8px] text-gray-400 hover:text-[#1c1c1c] hover:bg-gray-50">
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 mt-4 shadow-sm flex flex-col items-center justify-center">
                                <p className="text-gray-500 font-medium text-[15px]">No products match your filters.</p>
                                <button
                                    onClick={() => {
                                        navigate('/shop');
                                        setSelectedPriceRanges([]);
                                        setSelectedAges([]);
                                        setSelectedSizes([]);
                                        setPriceRange(5999);
                                    }}
                                    className="mt-4 text-[#b58145] font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                                    {currentProducts.map(product => (
                                        <ShopProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold text-xs shadow-sm disabled:opacity-50"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-black hover:bg-[#fcfaf7] flex items-center justify-center shadow-sm disabled:opacity-50"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;