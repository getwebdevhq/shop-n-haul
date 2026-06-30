"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Heart, 
  Share2, 
  Link as LinkIcon, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Star
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.product_images?.[0]?.image_url || "/images/logo.png");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // Magnifier refs
  const magnifierRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const [magnifierStyle, setMagnifierStyle] = useState<React.CSSProperties>({ display: "none" });

  const buyButtonRef = useRef<HTMLButtonElement>(null);

  // Active price
  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const salePrice = selectedVariant ? selectedVariant.sale_price : product.sale_price;

  // Track recently viewed in localStorage
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    // Remove if already exists
    const filtered = viewed.filter((p: any) => p.id !== product.id);
    // Add to front
    const updated = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.product_images?.[0]?.image_url,
        slug: product.slug,
      },
      ...filtered,
    ].slice(0, 5); // Keep top 5
    
    localStorage.setItem("recently_viewed", JSON.stringify(updated));
    setRecentlyViewed(filtered.slice(0, 4));
  }, [product]);

  // Monitor scroll for Sticky Buy Bar
  useEffect(() => {
    const handleScroll = () => {
      if (!buyButtonRef.current) return;
      const rect = buyButtonRef.current.getBoundingClientRect();
      // Show sticky bar when the main buy button is scrolled out of viewport (top)
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Image Magnifier Hover Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mainImageRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Check if cursor is inside boundaries
    if (x < 0 || y < 0 || x > width || y > height) {
      setMagnifierStyle({ display: "none" });
      return;
    }

    // Magnifier size is 150x150
    const magSize = 150;
    const magLeft = x - magSize / 2;
    const magTop = y - magSize / 2;

    // Background position in percent (for 2.5x zoom)
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setMagnifierStyle({
      display: "block",
      left: `${magLeft}px`,
      top: `${magTop}px`,
      backgroundImage: `url(${selectedImage})`,
      backgroundPosition: `${bgX}% ${bgY}%`,
      backgroundSize: `${width * 2.2}px ${height * 2.2}px`,
      backgroundRepeat: "no-repeat",
    });
  };

  const handleMouseLeave = () => {
    setMagnifierStyle({ display: "none" });
  };

  // Add to Cart
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: selectedImage,
      quantity: quantity,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.name || null,
    });
    toast.success(`${product.name} added to cart!`);
  };

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  // Delivery estimation
  const getDeliveryDateRange = () => {
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 5);

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${minDelivery.toLocaleDateString("en-IN", options)} - ${maxDelivery.toLocaleDateString("en-IN", options)}`;
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

      {/* Breadcrumbs */}
      <div className="pt-24 pb-6 px-6 md:px-12 max-w-7xl mx-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-gold transition-colors">{product.categories?.name || "Catalog"}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-charcoal">{product.name}</span>
      </div>

      {/* Product Details Grid */}
      <main className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 py-8">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto no-scrollbar justify-start">
            {product.product_images?.map((img: any) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.image_url)}
                className={`relative w-20 aspect-[3/4] bg-stone/20 shrink-0 border rounded-theme overflow-hidden ${
                  selectedImage === img.image_url ? "border-gold" : "border-stone/20"
                }`}
              >
                <img src={img.image_url} alt="Thumbnail" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>

          {/* Main Image Viewport with Magnifier */}
          <div
            ref={mainImageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex-1 relative aspect-[3/4] bg-stone/20 overflow-hidden cursor-crosshair rounded-theme order-1 md:order-2 select-none"
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            {/* Magnifier glass */}
            <div
              ref={magnifierRef}
              style={magnifierStyle}
              className="absolute w-[150px] h-[150px] rounded-full border border-stone/30 shadow-2xl pointer-events-none"
            />
          </div>
        </div>

        {/* Right Column: Buying controls & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-8 text-left">
          {/* Meta & Title */}
          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
              {product.material || "18ct Gold Vermeil"}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide leading-tight text-charcoal">
              {product.name}
            </h1>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 text-gold text-xs">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold stroke-none" />
                ))}
              </div>
              <span className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-0.5">
                ({product.review_count || 12} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4">
            {salePrice ? (
              <>
                <span className="text-3xl font-light text-gold">{formatCurrency(Number(salePrice))}</span>
                <span className="text-lg text-charcoal/30 line-through font-light">{formatCurrency(price)}</span>
              </>
            ) : (
              <span className="text-3xl font-light text-charcoal">{formatCurrency(price)}</span>
            )}
          </div>

          {/* Product Description */}
          <div 
            className="text-charcoal/70 text-sm leading-relaxed space-y-4 border-t border-b border-stone/25 py-6"
            dangerouslySetInnerHTML={{ __html: product.description || "Minimal everyday jewelry." }}
          />

          {/* Variant Selector */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.25em] text-charcoal/60 font-semibold block">
                Select Option
              </label>
              <div className="flex flex-wrap gap-3">
                {product.product_variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      if (variant.image_url) setSelectedImage(variant.image_url);
                    }}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border transition-colors cursor-pointer rounded-theme ${
                      selectedVariant?.id === variant.id
                        ? "border-gold text-gold bg-stone/5"
                        : "border-stone/30 text-charcoal hover:border-charcoal"
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buying Buttons */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-charcoal/60 font-semibold">Qty</span>
              <div className="flex border border-stone/30 rounded-theme">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-xs text-charcoal hover:bg-stone/5"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-xs text-charcoal hover:bg-stone/5"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                ref={buyButtonRef}
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-charcoal text-ivory hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.25em] transition-colors duration-500 shadow-xl flex items-center justify-center gap-2 cursor-pointer rounded-theme"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(
                    wishlist.includes(product.id)
                      ? "Removed from wishlist"
                      : "Added to wishlist!"
                  );
                }}
                className="p-4 border border-stone/30 text-charcoal hover:border-gold hover:text-gold transition-colors cursor-pointer rounded-theme"
              >
                <Heart className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyLink}
                className="p-4 border border-stone/30 text-charcoal hover:border-gold hover:text-gold transition-colors cursor-pointer rounded-theme"
                title="Copy Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery & Security Badges */}
          <div className="space-y-4 pt-6 border-t border-stone/20 text-xs text-charcoal/70">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-gold" />
              <span>Estimated Delivery: <strong className="text-charcoal">{getDeliveryDateRange()}</strong> (Express Shipping)</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Secure checkout via SSL & Razorpay Payment Gateway.</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-gold" />
              <span>30-Day Hassle-Free Returns & Exchanges.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-24 border-t border-stone/25 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="space-y-4 mb-16">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">Recommended</span>
            <h2 className="font-display text-4xl font-medium tracking-wide">Complete The Look</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-24 border-t border-stone/25 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="space-y-4 mb-16">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">History</span>
            <h2 className="font-display text-4xl font-medium tracking-wide">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {recentlyViewed.map((p) => {
              const formattedProduct = {
                id: p.id,
                name: p.name,
                price: p.price,
                slug: p.slug,
                product_images: [{ image_url: p.image }],
              };
              return <ProductCard key={p.id} product={formattedProduct} />;
            })}
          </div>
        </section>
      )}

      {/* STICKY ADD TO CART BAR */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-stone/25 py-4 px-6 md:px-12 shadow-2xl transition-transform duration-500 flex items-center justify-between ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-4 max-w-lg truncate">
          <div className="w-10 h-12 relative bg-stone/20 rounded-theme overflow-hidden shrink-0">
            <img src={selectedImage} alt={product.name} className="object-cover w-full h-full" />
          </div>
          <div className="truncate text-left">
            <p className="text-xs font-semibold text-charcoal truncate">{product.name}</p>
            <span className="text-xs text-gold font-medium">{formatCurrency(price)}</span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-8 py-3 bg-charcoal text-ivory hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-300 rounded-theme cursor-pointer"
        >
          Add to Bag
        </button>
      </div>

      <Footer />
    </div>
  );
}
