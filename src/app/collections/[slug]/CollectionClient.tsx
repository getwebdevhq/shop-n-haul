"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface CollectionClientProps {
  title: string;
  description: string;
  bannerUrl?: string;
  initialProducts: any[];
  categories: any[];
}

export default function CollectionClient({
  title,
  description,
  bannerUrl,
  initialProducts,
  categories,
}: CollectionClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [sortedProducts, setSortedProducts] = useState(initialProducts);
  
  // Filtering States
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceBrackets, setPriceBrackets] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Mobile filter drawer toggle
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags from the products list
  const allTags = Array.from(
    new Set(initialProducts.flatMap((p) => p.tags || []))
  ) as string[];

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...initialProducts];

    // Filter by Tags
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        p.tags?.some((tag: string) => selectedTags.includes(tag))
      );
    }

    // Filter by Price brackets
    if (priceBrackets.length > 0) {
      result = result.filter((p) => {
        const price = Number(p.price);
        return priceBrackets.some((bracket) => {
          if (bracket === "under5k") return price < 5000;
          if (bracket === "5kto10k") return price >= 5000 && price <= 10000;
          if (bracket === "over10k") return price > 10000;
          return true;
        });
      });
    }

    // Sort
    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setSortedProducts(result);
  }, [selectedTags, priceBrackets, sortBy, initialProducts]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePriceBracket = (bracket: string) => {
    setPriceBrackets((prev) =>
      prev.includes(bracket) ? prev.filter((b) => b !== bracket) : [...prev, bracket]
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans selection:bg-stone">
      <Navbar />

      {/* Hero Banner / Header */}
      <header className="relative pt-32 pb-20 px-6 md:px-12 bg-stone/10 border-b border-stone/25 text-center">
        {bannerUrl && (
          <div className="absolute inset-0 z-0 opacity-15">
            <img src={bannerUrl} alt={title} className="object-cover w-full h-full" />
          </div>
        )}
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">Luxe Edit</span>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-wide text-charcoal">{title}</h1>
          <p className="text-charcoal/60 text-xs md:text-sm leading-relaxed max-w-xl mx-auto">{description}</p>
        </div>
      </header>

      {/* Main Listing Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Left Column: Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-8 text-left border-r border-stone/25 pr-8">
          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Price</h3>
            <div className="space-y-2 text-xs text-charcoal/70">
              <label className="flex items-center gap-3 cursor-pointer hover:text-charcoal">
                <input
                  type="checkbox"
                  checked={priceBrackets.includes("under5k")}
                  onChange={() => togglePriceBracket("under5k")}
                />
                <span>Under {formatCurrency(5000)}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-charcoal">
                <input
                  type="checkbox"
                  checked={priceBrackets.includes("5kto10k")}
                  onChange={() => togglePriceBracket("5kto10k")}
                />
                <span>{formatCurrency(5000)} - {formatCurrency(10000)}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-charcoal">
                <input
                  type="checkbox"
                  checked={priceBrackets.includes("over10k")}
                  onChange={() => togglePriceBracket("over10k")}
                />
                <span>Over {formatCurrency(10000)}</span>
              </label>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Style Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border rounded-theme transition-colors cursor-pointer ${
                        isActive
                          ? "border-gold text-gold bg-stone/5"
                          : "border-stone/20 text-charcoal/60 hover:border-charcoal"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Quick Categories list */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Other Categories</h3>
            <ul className="space-y-3 text-xs text-charcoal/60 font-medium">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/collections/${cat.slug}`} className="hover:text-gold transition-colors block">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Column: Product Grid & Top Bar (3 cols) */}
        <main className="lg:col-span-3 space-y-8">
          {/* Grid Top Toolbar */}
          <div className="flex justify-between items-center bg-stone/5 border border-stone/25 px-4 py-3 text-xs">
            <span className="text-charcoal/50 uppercase tracking-wider text-[10px]">
              Showing {sortedProducts.length} results
            </span>
            
            <div className="flex items-center gap-4">
              <span className="text-charcoal/40 text-[10px] uppercase tracking-wider hidden sm:inline">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-charcoal/85 cursor-pointer font-medium"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-stone/20 space-y-3">
              <p className="text-sm text-charcoal/40 uppercase tracking-widest">No products match your filters.</p>
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setPriceBrackets([]);
                }}
                className="text-xs text-gold uppercase tracking-wider border-b border-gold/40 pb-0.5 font-semibold hover:text-charcoal transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

      <Footer />
    </div>
  );
}
