"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    alternateImage?: string;
    product_images?: { image_url: string }[];
    category?: string;
    categories?: { name: string };
    tag?: string;
    tags?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  // Robust fallbacks for database vs seed structure
  const mainImage = product.image || product.product_images?.[0]?.image_url || "/images/logo.png";
  const hoverImage = product.alternateImage || product.product_images?.[1]?.image_url || mainImage;
  const categoryName = product.category || product.categories?.name || "Catalog";
  
  // Tag fallback
  const displayTag = product.tag || (product.tags && product.tags.length > 0 ? product.tags[0] : undefined);

  // Add to cart helper matching the expected cart structure
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: mainImage,
      category: categoryName,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="group relative flex flex-col bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone/10 mb-5 rounded-theme">
        {/* Main Product Image */}
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-700 ease-out ${
            isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Alternate Image on Hover */}
        <Image
          src={hoverImage}
          alt={`${product.name} alternate view`}
          fill
          className={`object-cover transition-all duration-700 ease-out absolute top-0 left-0 ${
            isHovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        {displayTag && (
          <span className="absolute top-4 left-4 bg-charcoal text-ivory text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold z-10 rounded-sm">
            {displayTag}
          </span>
        )}

        {/* Action Button: Wishlist */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-4 right-4 bg-ivory/80 backdrop-blur-sm hover:bg-ivory hover:text-gold transition-colors duration-300 p-2.5 rounded-full shadow-sm z-10 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-gold text-gold" : "text-charcoal"}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick Add Button Panel */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-ivory text-charcoal hover:bg-charcoal hover:text-ivory transition-colors duration-300 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 cursor-pointer rounded-theme"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info Details */}
      <div className="flex flex-col space-y-1 text-left">
        <span className="text-[9px] tracking-widest uppercase text-charcoal/40 font-semibold">
          {categoryName}
        </span>
        <h3 className="font-display text-lg font-medium text-charcoal hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2 pt-0.5">
          <span className="text-sm font-semibold text-charcoal">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-charcoal/30 line-through ml-2 font-light">
              ₹{Number(product.originalPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
