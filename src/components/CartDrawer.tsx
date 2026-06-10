"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, cart, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const sidebarVariants: Variants = {
    closed: { x: "100%", transition: { type: "tween" as const, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
    open: { x: 0, transition: { type: "tween" as const, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const backdropVariants: Variants = {
    closed: { opacity: 0, transition: { duration: 0.3 } },
    open: { opacity: 0.4, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-charcoal cursor-pointer"
          />

          {/* Cart Sidebar Panel */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-ivory border-l border-stone shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-stone/40">
              <h2 className="font-display text-2xl font-semibold tracking-wider uppercase text-charcoal">
                Your Bag
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-charcoal/60 hover:text-charcoal transition-colors cursor-pointer"
                aria-label="Close Cart"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                  <p className="font-display text-xl text-charcoal/60 italic">Your bag is empty</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-xs uppercase tracking-[0.2em] text-gold hover:text-charcoal transition-colors font-semibold"
                  >
                    Continue Exploring
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex space-x-4 pb-6 border-b border-stone/20">
                    <div className="relative w-20 h-20 bg-stone/20 overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-display text-lg font-medium text-charcoal leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-sm font-semibold text-charcoal ml-2">
                            £{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] tracking-wider uppercase text-charcoal/40 mt-1">
                          {item.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-stone/50 bg-ivory text-charcoal">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone/10 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone/10 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 md:p-8 bg-stone/20 border-t border-stone/40 space-y-6">
                <div className="flex justify-between items-center text-charcoal">
                  <span className="text-xs uppercase tracking-widest font-semibold opacity-70">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl font-semibold">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-charcoal/40 leading-relaxed">
                  Shipping and taxes calculated at checkout. Enjoy complimentary standard delivery.
                </p>
                <button className="w-full bg-charcoal hover:bg-gold text-ivory hover:text-charcoal transition-colors duration-500 py-4 font-display text-sm tracking-[0.2em] uppercase font-semibold cursor-pointer">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
