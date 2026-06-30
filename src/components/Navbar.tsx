"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Search, Heart, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuCategory {
  name: string;
  href: string;
  subgroups: string[];
  promo?: {
    title: string;
    description: string;
    cta: string;
    href: string;
  };
}

const MENU_STRUCTURE: MenuCategory[] = [
  {
    name: "New In",
    href: "/#new-arrivals",
    subgroups: [],
  },
  {
    name: "Necklaces",
    href: "/collections/necklaces",
    subgroups: [
      "Pendant Necklaces",
      "Chain Necklaces",
      "Layered Necklaces",
      "Chokers",
      "Statement Necklaces",
      "Pearl Necklaces",
    ],
    promo: {
      title: "The Layering Edit",
      description: "Pieces designed to stack, mix, and match.",
      cta: "Explore Necklaces",
      href: "/collections/necklaces",
    },
  },
  {
    name: "Earrings",
    href: "/collections/earrings",
    subgroups: [
      "Stud Earrings",
      "Hoop Earrings",
      "Huggies",
      "Drop Earrings",
      "Dangle Earrings",
      "Ear Cuffs",
    ],
    promo: {
      title: "Signature Hoops",
      description: "Classic gold hoops for everyday styling.",
      cta: "Shop Hoops",
      href: "/collections/earrings",
    },
  },
  {
    name: "Rings",
    href: "/collections/rings",
    subgroups: [
      "Stackable Rings",
      "Statement Rings",
      "Signet Rings",
      "Adjustable Rings",
      "Gemstone Rings",
    ],
    promo: {
      title: "Modern Stacking",
      description: "Finely crafted rings in recycled gold.",
      cta: "Explore Rings",
      href: "/collections/rings",
    },
  },
  {
    name: "Bracelets",
    href: "/collections/bracelets",
    subgroups: [
      "Chain Bracelets",
      "Tennis Bracelets",
      "Cuff Bracelets",
      "Charm Bracelets",
      "Bangles",
    ],
    promo: {
      title: "Tennis Classics",
      description: "Timeless luxury for quiet moments.",
      cta: "Shop Bracelets",
      href: "/collections/bracelets",
    },
  },
  {
    name: "Collections",
    href: "/#collections",
    subgroups: [
      "Everyday Essentials",
      "Minimal Collection",
      "Gold Collection",
      "Silver Collection",
      "Pearl Collection",
      "Signature Collection",
    ],
    promo: {
      title: "The Golden Hour",
      description: "Warm 18ct vermeil gold collection.",
      cta: "Shop Golden Hour",
      href: "/collections/golden-hour",
    },
  },
  {
    name: "Gifts",
    href: "/#gifts",
    subgroups: [
      "Gifts Under ₹5,000",
      "Gifts Under ₹10,000",
      "Gifts For Her",
    ],
    promo: {
      title: "Curated Gifting",
      description: "Make it personal. Complimentary signature boxing.",
      cta: "Gift Guide",
      href: "/#gifts",
    },
  },
  {
    name: "Hamper Builder",
    href: "/#hamper-builder",
    subgroups: [],
  },
  {
    name: "Best Sellers",
    href: "/#best-sellers",
    subgroups: [],
  },
];

export default function Navbar() {
  const { cart, wishlist, setCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<MenuCategory | null>(null);

  // Monitor scroll depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        onMouseLeave={() => setHoveredCategory(null)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out bg-white ${
          isScrolled || hoveredCategory
            ? "py-4 shadow-sm border-b border-stone-200"
            : "py-6 border-b border-stone-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setHoveredCategory(null)}
            className="font-display text-xl md:text-2xl font-semibold tracking-[0.2em] text-charcoal hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            STASH & HAUL
          </Link>

          {/* Primary Navigation */}
          <nav className="hidden xl:flex items-center space-x-8">
            {MENU_STRUCTURE.map((cat) => (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.subgroups.length > 0 ? cat : null)}
                className="relative py-2"
              >
                <Link
                  href={cat.href}
                  className="text-[10px] tracking-[0.2em] uppercase text-charcoal/80 hover:text-gold transition-colors duration-300 font-medium"
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-6 md:space-x-8">
            <button
              aria-label="Search Catalog"
              className="text-charcoal/80 hover:text-gold transition-colors duration-300 cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            <button
              aria-label="View Wishlist"
              className="relative text-charcoal/80 hover:text-gold transition-colors duration-300 cursor-pointer"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sage text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setHoveredCategory(null);
                setCartOpen(true);
              }}
              aria-label="Open Cart"
              className="relative text-charcoal/80 hover:text-gold transition-colors duration-300 cursor-pointer"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-charcoal text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-charcoal/80 hover:text-gold transition-colors duration-300 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Global Mega-Menu Dropdown Panel */}
        <AnimatePresence>
          {hoveredCategory && hoveredCategory.subgroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 bg-ivory/98 backdrop-blur-md border-b border-stone/30 shadow-lg py-12 px-12 z-40 hidden xl:block"
            >
              <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12">
                {/* Left side: Subgroups column 1 */}
                <div className="col-span-2 grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] tracking-[0.25em] uppercase text-gold font-bold mb-6">
                      Shop by {hoveredCategory.name}
                    </h3>
                    <ul className="space-y-4">
                      {hoveredCategory.subgroups.slice(0, 3).map((sub) => (
                        <li key={sub}>
                          <Link
                            href={hoveredCategory.href}
                            onClick={() => setHoveredCategory(null)}
                            className="text-xs text-charcoal/70 hover:text-gold tracking-wide transition-colors font-medium"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 font-bold mb-6">
                      &nbsp;
                    </h3>
                    <ul className="space-y-4">
                      {hoveredCategory.subgroups.slice(3).map((sub) => (
                        <li key={sub}>
                          <Link
                            href={hoveredCategory.href}
                            onClick={() => setHoveredCategory(null)}
                            className="text-xs text-charcoal/70 hover:text-gold tracking-wide transition-colors font-medium"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Middle spacing */}
                <div className="col-span-1 border-l border-stone/20" />

                {/* Right side: Promotional Feature */}
                {hoveredCategory.promo && (
                  <div className="col-span-1 flex flex-col justify-between h-full space-y-4 text-left">
                    <div className="space-y-2">
                      <span className="text-[9px] tracking-widest uppercase text-gold font-semibold">Featured</span>
                      <h4 className="font-display text-xl font-medium text-charcoal leading-tight">
                        {hoveredCategory.promo.title}
                      </h4>
                      <p className="text-xs text-charcoal/60 leading-relaxed">
                        {hoveredCategory.promo.description}
                      </p>
                    </div>
                    <Link
                      href={hoveredCategory.promo.href}
                      onClick={() => setHoveredCategory(null)}
                      className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal hover:text-gold flex items-center gap-2 group transition-colors"
                    >
                      {hoveredCategory.promo.cta}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-40 bg-ivory/98 backdrop-blur-md transition-transform duration-500 ease-in-out xl:hidden flex flex-col justify-start pt-28 px-8 overflow-y-auto ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="flex flex-col space-y-8 text-left">
          {MENU_STRUCTURE.map((cat) => (
            <div key={cat.name} className="space-y-3">
              <Link
                href={cat.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-2xl tracking-[0.1em] text-charcoal hover:text-gold transition-colors font-semibold uppercase block"
              >
                {cat.name}
              </Link>
              {cat.subgroups.length > 0 && (
                <div className="grid grid-cols-2 gap-y-2 pl-4 border-l border-stone/30">
                  {cat.subgroups.map((sub) => (
                    <Link
                      key={sub}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs text-charcoal/60 hover:text-gold transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="py-12 text-center text-[10px] tracking-[0.2em] text-charcoal/40 uppercase">
          Stash and Haul — Timeless Jewellery
        </div>
      </div>
    </>
  );
}
