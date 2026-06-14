"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowUpRight, ArrowRight, Instagram, HelpCircle, Truck, RefreshCw } from "lucide-react";

import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import MagneticButton from "@/components/MagneticButton";
import HamperBuilder from "@/components/HamperBuilder";

// Premium Jewellery Seed Products (GBP)
const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Aura Gold Pendant",
    price: 85.0,
    originalPrice: 120.0,
    image: "/images/necklaces_close.png",
    alternateImage: "/images/hero_jewellery.png",
    category: "Necklaces",
    tag: "New In",
    collection: "The Golden Hour Collection",
    style: "Everyday Luxury",
    trend: "Layered Necklaces",
  },
  {
    id: "prod-2",
    name: "Classic Bold Hoops",
    price: 60.0,
    image: "/images/earrings_close.png",
    alternateImage: "/images/hero_jewellery.png",
    category: "Earrings",
    tag: "Best Seller",
    collection: "The Essential Edit",
    style: "Minimalist",
    trend: "Gold Hoops",
  },
  {
    id: "prod-3",
    name: "Solitaire Stack Ring",
    price: 45.0,
    image: "/images/rings_stack.png",
    alternateImage: "/images/bracelets_wrist.png",
    category: "Rings",
    tag: "Trending",
    collection: "The Layering Collection",
    style: "Minimalist",
    trend: "Stackable Rings",
  },
  {
    id: "prod-4",
    name: "Duet Chain Bracelet",
    price: 75.0,
    originalPrice: 95.0,
    image: "/images/bracelets_wrist.png",
    alternateImage: "/images/rings_stack.png",
    category: "Bracelets",
    tag: "Special Price",
    collection: "The Essential Edit",
    style: "Modern Classics",
    trend: "Everyday Luxury",
  },
  {
    id: "prod-5",
    name: "Pearl Droplet Earrings",
    price: 95.0,
    image: "/images/earrings_close.png",
    alternateImage: "/images/hero_jewellery.png",
    category: "Earrings",
    tag: "Signature",
    collection: "The Pearl Edit",
    style: "Everyday Luxury",
    trend: "Pearl Edit",
  },
  {
    id: "prod-6",
    name: "Helena Statement Signet",
    price: 110.0,
    image: "/images/rings_stack.png",
    alternateImage: "/images/bracelets_wrist.png",
    category: "Rings",
    tag: "Best Seller",
    collection: "The Signature Collection",
    style: "Bold Statement",
    trend: "Stackable Rings",
  },
  {
    id: "prod-7",
    name: "Layered Cable Chain",
    price: 90.0,
    image: "/images/necklaces_close.png",
    alternateImage: "/images/hero_jewellery.png",
    category: "Necklaces",
    tag: "Trending",
    collection: "The Layering Collection",
    style: "Modern Classics",
    trend: "Layered Necklaces",
  },
  {
    id: "prod-8",
    name: "Stella Vintage Gem Ring",
    price: 135.0,
    image: "/images/rings_stack.png",
    alternateImage: "/images/bracelets_wrist.png",
    category: "Rings",
    tag: "Classic",
    collection: "The Timeless Collection",
    style: "Vintage Inspired",
    trend: "Stackable Rings",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTrend, setActiveTrend] = useState<string>("Layered Necklaces");

  // Parallax scroll transforms for Hero Background and Hero Typography
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Framer Motion Animation Settings
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const staggerChildren: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // SEO Breadcrumb List Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://stashandhaul.vercel.app"
      }
    ]
  };

  // SEO Product Catalog Schema (GBP)
  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": SEED_PRODUCTS.length,
    "itemListElement": SEED_PRODUCTS.map((prod, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Product",
        "image": `https://stashandhaul.vercel.app${prod.image}`,
        "name": prod.name,
        "offers": {
          "@type": "Offer",
          "price": prod.price,
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  return (
    <div className="relative min-h-screen bg-ivory text-charcoal overflow-x-hidden selection:bg-stone selection:text-charcoal font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
      <Navbar />
      <CartDrawer />

      {/* ======================================================== */}
      {/* SECTION 1: HERO                                          */}
      {/* ======================================================== */}
      <section
        ref={heroRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-charcoal"
      >
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 w-full h-full">
          <Image
            src="/images/hero_jewellery.png"
            alt="Timeless Jewellery model editorial styling"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-85 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-charcoal/40" />
        </motion.div>

        {/* Content Overlays */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center select-none"
        >
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-stone/90 text-[10px] md:text-xs tracking-[0.4em] uppercase mb-6 font-semibold"
          >
            Jewellery Designed For Every Moment
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            className="font-display text-6xl sm:text-8xl md:text-[10vw] font-bold text-ivory tracking-[0.1em] leading-[0.9] mb-8 text-overlap text-stroke-white"
          >
            TIMELESS JEWELLERY
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-6 mt-8"
          >
            <MagneticButton>
              <Link
                href="#categories"
                className="px-8 py-4 bg-ivory text-charcoal hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl flex items-center gap-2"
              >
                Shop Collections
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>

            <Link
              href="#new-arrivals"
              className="text-ivory hover:text-gold text-xs uppercase tracking-[0.2em] font-semibold border-b border-ivory/30 hover:border-gold pb-1 transition-all duration-300 flex items-center gap-1.5"
            >
              Explore New Arrivals
            </Link>
          </motion.div>
        </motion.div>

        {/* Parallax bottom indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-10 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.25em] text-stone">Discover</span>
          <div className="w-px h-10 bg-gradient-to-b from-stone to-transparent" />
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: SHOP BY CATEGORY (Tiffany Style)              */}
      {/* ======================================================== */}
      <section id="categories" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">Elevated Categories</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide">Shop By Category</h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { name: "Necklaces", image: "/images/necklaces_close.png" },
            { name: "Earrings", image: "/images/earrings_close.png" },
            { name: "Rings", image: "/images/rings_stack.png" },
            { name: "Bracelets", image: "/images/bracelets_wrist.png" },
          ].map((cat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="group relative overflow-hidden bg-stone/20 aspect-[3/4] cursor-pointer"
            >
              <Image
                src={cat.image}
                alt={`Shop ${cat.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-8 left-8 text-ivory">
                <h3 className="font-display text-3xl font-medium tracking-wide">{cat.name}</h3>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: BEST SELLERS (Luxury Carousel)                */}
      {/* ======================================================== */}
      <section id="best-sellers" className="py-24 bg-stone/10 border-t border-b border-stone/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">Most Loved</span>
            <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide">Best Sellers</h2>
          </div>
          <p className="text-sm text-charcoal/60 max-w-md">
            Our signature designs, curated for modern elegance. Designed to be worn every day, layered, and stacked.
          </p>
        </div>

        {/* Carousel Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 overflow-x-auto no-scrollbar flex space-x-8 pb-10 cursor-grab active:cursor-grabbing">
          {SEED_PRODUCTS.filter((p) => p.tag === "Best Seller" || p.tag === "Trending").map((product) => (
            <div key={product.id} className="w-[280px] md:w-[320px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: SIGNATURE COLLECTION (Designed for everyday)  */}
      {/* ======================================================== */}
      <section id="signature-collection" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Magazine layout text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 text-left"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">The Signature Collection</span>
            
            <h2 className="font-display text-5xl md:text-7xl font-light tracking-wide leading-tight text-charcoal">
              Designed to be worn every day.
            </h2>
            
            <p className="text-charcoal/70 text-sm md:text-base leading-relaxed max-w-md">
              We curate minimal everyday pieces, cast in 18ct yellow gold vermeil and solid sterling silver. Zero compromise, high precision design. Stack them, stack yours, make it custom.
            </p>
            
            <div className="pt-4">
              <MagneticButton>
                <Link
                  href="#collections"
                  className="px-8 py-4 bg-charcoal text-ivory hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl"
                >
                  Explore Collection
                </Link>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Premium photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[3/4] w-full bg-stone/20 overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/rings_stack.png"
              alt="Model fingers showing stackable gold rings"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: TRENDING NOW (Layered, hoops, stackable)       */}
      {/* ======================================================== */}
      <section className="py-24 bg-stone/20 border-t border-b border-stone/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">Refined Trends</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide text-left">Trending Now</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-stone/20 pb-2 w-full md:w-auto">
              {["Layered Necklaces", "Gold Hoops", "Stackable Rings", "Pearl Edit"].map((trend) => (
                <button
                  key={trend}
                  onClick={() => setActiveTrend(trend)}
                  className={`text-xs uppercase tracking-[0.15em] pb-2 font-semibold transition-all cursor-pointer relative ${
                    activeTrend === trend ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  {trend}
                  {activeTrend === trend && (
                    <motion.div
                      layoutId="activeTrendLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filtering display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SEED_PRODUCTS.filter((p) => p.trend === activeTrend || (activeTrend === "Pearl Edit" && p.collection === "The Pearl Edit")).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: MAKE YOUR OWN HAMPER                          */}
      {/* ======================================================== */}
      <HamperBuilder products={SEED_PRODUCTS} />

      {/* ======================================================== */}
      {/* SECTION 7: NEW ARRIVALS                                  */}
      {/* ======================================================== */}
      <section id="new-arrivals" className="py-24 bg-stone/5 border-t border-b border-stone/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-24 space-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">The Weekend Edit</span>
          <h2 className="font-display text-5xl md:text-7xl font-semibold tracking-wide">New Arrivals</h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SEED_PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: GIFT GUIDE                                    */}
      {/* ======================================================== */}
      <section id="gifts" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">Curated Giving</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide">The Gift Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Gifts Under £50 */}
          <div className="group relative aspect-[3/4] bg-stone/20 overflow-hidden cursor-pointer flex flex-col justify-end p-8 text-ivory">
            <Image
              src="/images/rings_stack.png"
              alt="Gifts Under £50"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/35 transition-colors duration-500" />
            <div className="relative z-10 text-left">
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold mb-1 block">Minimal Essentials</span>
              <h3 className="font-display text-3xl font-medium tracking-wide">Gifts Under £50</h3>
              <p className="text-xs text-stone/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Sleek stackable rings and delicate studs.
              </p>
            </div>
          </div>

          {/* Gifts Under £100 */}
          <div className="group relative aspect-[3/4] bg-stone/20 overflow-hidden cursor-pointer flex flex-col justify-end p-8 text-ivory">
            <Image
              src="/images/necklaces_close.png"
              alt="Gifts Under £100"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/35 transition-colors duration-500" />
            <div className="relative z-10 text-left">
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold mb-1 block">Golden Hour</span>
              <h3 className="font-display text-3xl font-medium tracking-wide">Gifts Under £100</h3>
              <p className="text-xs text-stone/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Bold hoops, pendants, and layering chains.
              </p>
            </div>
          </div>

          {/* Gifts For Her */}
          <div className="group relative aspect-[3/4] bg-stone/20 overflow-hidden cursor-pointer flex flex-col justify-end p-8 text-ivory">
            <Image
              src="/images/hero_jewellery.png"
              alt="Gifts For Her"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/35 transition-colors duration-500" />
            <div className="relative z-10 text-left">
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold mb-1 block">Signature Pieces</span>
              <h3 className="font-display text-3xl font-medium tracking-wide">Gifts For Her</h3>
              <p className="text-xs text-stone/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Luxe statement links and pearl drop collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 9: INSTAGRAM STYLE GALLERY                       */}
      {/* ======================================================== */}
      <section className="py-24 bg-stone/10 border-t border-b border-stone/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16 space-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">Community Lookbook</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide">Worn By Real Muses</h2>
          <p className="text-xs text-charcoal/50 max-w-sm mx-auto">Get inspired by how our community styles their everyday essentials.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "/images/hero_jewellery.png",
            "/images/necklaces_close.png",
            "/images/rings_stack.png",
            "/images/bracelets_wrist.png"
          ].map((img, idx) => (
            <div key={idx} className="group relative aspect-square bg-stone/20 overflow-hidden cursor-pointer shadow-sm">
              <Image
                src={img}
                alt="Instagram Lookbook styling shot"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-ivory">
                <Instagram className="w-6 h-6 text-ivory/80" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 10: BRAND STORY                                  */}
      {/* ======================================================== */}
      <section className="py-36 bg-charcoal text-ivory text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">The Stash and Haul Guarantee</span>
          <h2 className="font-display text-5xl md:text-8xl font-medium tracking-wide leading-[0.9]">
            SIGNATURE
          </h2>
          <p className="font-display text-2xl md:text-4xl font-light text-stone/80 max-w-2xl mx-auto leading-relaxed italic">
            &ldquo;Luxury without the traditional markup.&rdquo;
          </p>
          <div className="w-16 h-px bg-gold/50 mx-auto my-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto text-stone/60 text-[10px] tracking-[0.2em] uppercase">
            <div className="flex flex-col items-center gap-2">
              <Truck className="w-5 h-5 text-gold" strokeWidth={1.5} />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gold" strokeWidth={1.5} />
              <span>30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gold" strokeWidth={1.5} />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
