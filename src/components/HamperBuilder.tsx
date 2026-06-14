"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Check, Plus, Minus, Gift, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
}

interface HamperBuilderProps {
  products: Product[];
}

const BOX_OPTIONS = [
  {
    id: "emerald-box",
    name: "Velvet Emerald Chest",
    price: 15.0,
    image: "/images/hamper_box_emerald.png",
    description: "A luxury plush velvet box embossed with signature gold lettering. Perfect for treasured keepsakes.",
  },
  {
    id: "cream-box",
    name: "Minimalist Cream Gift Box",
    price: 10.0,
    image: "/images/hamper_box_cream.png",
    description: "Elegant textured paper box tied with a satin gold ribbon. Subtle, clean, and modern.",
  },
];

export default function HamperBuilder({ products }: HamperBuilderProps) {
  const { addToCart } = useCart();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedBox, setSelectedBox] = useState(BOX_OPTIONS[0]);
  const [hamperItems, setHamperItems] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Gift Card State
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftSender, setGiftSender] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  // Catalogue Category Filtering
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Necklaces", "Earrings", "Rings", "Bracelets"];

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  // Helper functions for hamper manipulation
  const addItemToHamper = (product: Product) => {
    setHamperItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItemFromHamper = (productId: string) => {
    setHamperItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getItemQuantity = (productId: string) => {
    const item = hamperItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItemsCount = hamperItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsSubtotal = hamperItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalHamperPrice = selectedBox.price + itemsSubtotal;

  const handleAddHamperToCart = () => {
    // Generate a unique descriptive name for the hamper item in the cart
    const itemSummary = hamperItems.map((item) => `${item.product.name} (x${item.quantity})`).join(", ");
    const giftNoteText = giftMessage ? ` | Note: To ${giftRecipient || "Someone"}, Msg: "${giftMessage}" - From ${giftSender || "Guest"}` : "";
    const hamperName = `Custom Hamper [${selectedBox.name}] (${totalItemsCount} items: ${itemSummary})${giftNoteText}`;

    // Add to cart as a bundled product
    addToCart({
      id: `hamper-${Date.now()}`,
      name: hamperName,
      price: totalHamperPrice,
      image: selectedBox.image,
      category: "Custom Hamper",
    });

    // Reset Hamper state
    setHamperItems([]);
    setGiftRecipient("");
    setGiftSender("");
    setGiftMessage("");
    setActiveStep(1);
  };

  return (
    <section id="hamper-builder" className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-stone/30">
      <div className="text-center space-y-4 mb-16">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold flex items-center justify-center gap-2">
          <Gift className="w-3.5 h-3.5" /> Gift Artistry
        </span>
        <h2 className="font-display text-5xl md:text-6xl font-medium tracking-wide">Make Your Own Hamper</h2>
        <p className="text-xs text-charcoal/60 max-w-md mx-auto">
          Craft the perfect bespoke gift. Choose a signature box, fill it with timeless jewellery pieces, and add a handwritten note.
        </p>
      </div>

      {/* Step Navigation Bar */}
      <div className="flex justify-between items-center max-w-3xl mx-auto mb-16 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-stone/30 -translate-y-1/2 z-0" />
        {[
          { step: 1, label: "Packaging" },
          { step: 2, label: "Add Jewellery" },
          { step: 3, label: "Gift Card" },
          { step: 4, label: "Summary" },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => {
              if (item.step < activeStep || (item.step === 2 && selectedBox) || (item.step === 3 && totalItemsCount > 0) || (item.step === 4 && totalItemsCount > 0)) {
                setActiveStep(item.step);
              }
            }}
            className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-semibold transition-all duration-500 ${
                activeStep === item.step
                  ? "bg-charcoal text-ivory border-charcoal scale-110 shadow-lg"
                  : activeStep > item.step
                  ? "bg-gold text-charcoal border-gold"
                  : "bg-ivory text-charcoal/40 border-stone/60 group-hover:border-charcoal/60"
              }`}
            >
              {activeStep > item.step ? <Check className="w-3.5 h-3.5" /> : item.step}
            </div>
            <span
              className={`text-[9px] uppercase tracking-wider font-semibold transition-colors duration-300 ${
                activeStep === item.step ? "text-charcoal font-bold" : "text-charcoal/40 group-hover:text-charcoal"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Builder Area */}
      <div className="bg-stone/10 border border-stone/20 rounded-lg p-6 md:p-12 min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: PACKAGING SELECTION */}
          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] w-full bg-stone/20 overflow-hidden shadow-xl rounded-md group">
                <Image
                  src={selectedBox.image}
                  alt={selectedBox.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Box Details and Selection */}
              <div className="space-y-8 text-left">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">Step 1: Choose Packaging</span>
                  <h3 className="font-display text-3xl font-medium tracking-wide">Signature Presentation</h3>
                  <p className="text-xs text-charcoal/60">Every gift deserves a beautiful beginning. Select the packaging that best suits their aesthetic.</p>
                </div>

                <div className="space-y-4">
                  {BOX_OPTIONS.map((box) => (
                    <button
                      key={box.id}
                      onClick={() => setSelectedBox(box)}
                      className={`w-full text-left p-6 border transition-all duration-300 flex items-center justify-between cursor-pointer rounded-md ${
                        selectedBox.id === box.id
                          ? "border-gold bg-ivory shadow-md ring-1 ring-gold"
                          : "border-stone/40 hover:border-charcoal/40 bg-transparent"
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <h4 className="font-display text-xl font-medium text-charcoal">{box.name}</h4>
                        <p className="text-xs text-charcoal/50 leading-relaxed max-w-sm">{box.description}</p>
                      </div>
                      <span className="font-display text-lg font-semibold text-charcoal flex-shrink-0">
                        £{box.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-8 py-4 bg-charcoal hover:bg-gold text-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    Select Box & Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CATALOGUE ADDITIONS */}
          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone/20 pb-6 gap-6">
                <div className="text-left space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">Step 2: Add Jewellery</span>
                  <h3 className="font-display text-3xl font-medium tracking-wide">Fill Your Hamper</h3>
                  <p className="text-xs text-charcoal/60">Choose from our selected jewellery pieces to place inside your velvet or satin box.</p>
                </div>

                {/* Categories Tabs */}
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-charcoal text-ivory border-charcoal"
                          : "border-stone/40 text-charcoal/60 hover:border-charcoal hover:text-charcoal"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left side: catalog selection */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map((product) => {
                    const qty = getItemQuantity(product.id);
                    return (
                      <div key={product.id} className="bg-ivory border border-stone/20 p-4 rounded-md flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="relative aspect-square w-full bg-stone/20 overflow-hidden rounded-sm">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 20vw"
                              className="object-cover"
                            />
                            {product.tag && (
                              <span className="absolute top-2 left-2 bg-gold text-charcoal text-[8px] font-bold uppercase tracking-wider px-2 py-0.5">
                                {product.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="font-display text-base font-semibold leading-tight text-charcoal truncate">
                              {product.name}
                            </h4>
                            <span className="text-[10px] uppercase tracking-wider text-charcoal/40">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone/10">
                          <span className="font-semibold text-sm">£{product.price.toFixed(2)}</span>
                          
                          {qty > 0 ? (
                            <div className="flex items-center border border-stone/50 bg-ivory text-charcoal">
                              <button
                                onClick={() => removeItemFromHamper(product.id)}
                                className="p-1 hover:bg-stone/10 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold">{qty}</span>
                              <button
                                onClick={() => addItemToHamper(product)}
                                className="p-1 hover:bg-stone/10 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addItemToHamper(product)}
                              className="px-3 py-1 bg-charcoal hover:bg-gold text-ivory hover:text-charcoal font-semibold text-[10px] uppercase tracking-wider transition-colors duration-300 rounded-sm cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right side: hamper summary panel */}
                <div className="lg:col-span-1 bg-ivory border border-stone/30 p-6 flex flex-col justify-between min-h-[400px] text-left rounded-md shadow-sm">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-stone/20 pb-3">
                      <h4 className="font-display text-lg font-bold">Your Hamper</h4>
                      <span className="text-xs bg-gold text-charcoal px-2 py-0.5 rounded-full font-semibold">
                        {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {hamperItems.length === 0 ? (
                      <div className="text-center py-12 text-charcoal/40 italic text-xs">
                        Your box is currently empty. Add items from the catalogue to get started.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {hamperItems.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center text-xs">
                            <div className="truncate pr-2">
                              <p className="font-semibold truncate text-charcoal">{item.product.name}</p>
                              <p className="text-[9px] text-charcoal/40">
                                £{item.product.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItemFromHamper(item.product.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-stone/20 pt-4 mt-6 space-y-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-charcoal/60">
                        <span>{selectedBox.name}:</span>
                        <span>£{selectedBox.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-charcoal/60">
                        <span>Items Subtotal:</span>
                        <span>£{itemsSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone/10">
                        <span>Total:</span>
                        <span>£{totalHamperPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setActiveStep(3)}
                        disabled={hamperItems.length === 0}
                        className={`w-full py-3 font-semibold text-xs uppercase tracking-wider text-center transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                          hamperItems.length > 0
                            ? "bg-charcoal text-ivory hover:bg-gold hover:text-charcoal shadow-md"
                            : "bg-stone/50 text-charcoal/30 cursor-not-allowed"
                        }`}
                      >
                        Next: Gift Card <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="w-full py-2 border border-stone/40 hover:border-charcoal text-charcoal/60 hover:text-charcoal font-semibold text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Box
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GIFT CARD */}
          {activeStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Left Side: Interactive Card Inputs */}
              <div className="text-left space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">Step 3: Gift Message</span>
                  <h3 className="font-display text-3xl font-medium tracking-wide">Write a Personalized Note</h3>
                  <p className="text-xs text-charcoal/60">
                    We will handwrite your message on our luxurious gold-foil greeting card. Leave empty if you prefer to write it yourself.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold">To (Recipient)</label>
                      <input
                        type="text"
                        placeholder="e.g. Eleanor"
                        value={giftRecipient}
                        onChange={(e) => setGiftRecipient(e.target.value)}
                        className="w-full bg-ivory border border-stone/50 p-3 text-xs focus:border-gold focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold">From (Sender)</label>
                      <input
                        type="text"
                        placeholder="e.g. Arthur"
                        value={giftSender}
                        onChange={(e) => setGiftSender(e.target.value)}
                        className="w-full bg-ivory border border-stone/50 p-3 text-xs focus:border-gold focus:outline-none rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold">Message (Max 250 characters)</label>
                    <textarea
                      rows={5}
                      maxLength={250}
                      placeholder="Write your thoughtful message here..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full bg-ivory border border-stone/50 p-3 text-xs focus:border-gold focus:outline-none rounded-sm resize-none"
                    />
                    <div className="text-right text-[9px] text-charcoal/40">
                      {giftMessage.length} / 250 characters
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-4 border border-stone/40 hover:border-charcoal text-charcoal/70 hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
                  </button>

                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-8 py-4 bg-charcoal hover:bg-gold text-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    Next: Summary <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Side: Greeting Card Mockup */}
              <div className="flex flex-col justify-center items-center">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-4 font-bold">Greeting Card Preview</span>
                <div className="w-full max-w-sm aspect-[1.5/1] bg-ivory border border-stone/40 shadow-xl p-8 flex flex-col justify-between relative overflow-hidden select-none">
                  {/* Decorative card framing */}
                  <div className="absolute inset-2 border border-gold/20 pointer-events-none" />
                  <div className="absolute top-4 right-4 text-gold opacity-80">
                    <Gift className="w-5 h-5" strokeWidth={1} />
                  </div>

                  <div className="text-left font-display text-sm tracking-wide text-charcoal/50 italic border-b border-stone/20 pb-2">
                    To {giftRecipient || "__________"}
                  </div>

                  <div className="flex-1 flex items-center justify-center py-4">
                    <p className="font-display text-lg tracking-wide text-charcoal font-light leading-relaxed italic text-center text-overlap break-words max-w-full">
                      {giftMessage ? `"${giftMessage}"` : "Your card message will appear here..."}
                    </p>
                  </div>

                  <div className="text-right font-display text-sm tracking-wide text-charcoal/50 italic border-t border-stone/20 pt-2">
                    With Love, {giftSender || "__________"}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUMMARY */}
          {activeStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left"
            >
              {/* Left Side: Visual Package Mockup */}
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Your Custom Hamper Arrangement</h4>
                <div className="relative border border-stone/20 rounded-md p-6 bg-ivory/80 shadow-inner flex flex-col items-center">
                  <div className="relative w-48 h-48 bg-stone/10 overflow-hidden shadow-md mb-6 rounded-md">
                    <Image
                      src={selectedBox.image}
                      alt={selectedBox.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="border-b border-stone/20 pb-2">
                      <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">Hamper Bundle</span>
                      <h5 className="font-display text-xl font-medium text-charcoal mt-1">{selectedBox.name}</h5>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {hamperItems.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-xs">
                          <span className="text-charcoal/80 font-medium">{item.product.name} (x{item.quantity})</span>
                          <span className="font-semibold text-charcoal">£{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {giftMessage && (
                      <div className="bg-stone/10 p-3 border border-stone/20 rounded-sm text-xs mt-4">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold block mb-1">Handwritten Note</span>
                        <p className="italic text-charcoal/70 leading-relaxed font-display">
                          &ldquo;{giftMessage}&rdquo; <span className="not-italic text-charcoal/40 text-[10px]"> (To: {giftRecipient}, From: {giftSender})</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Total summary and Add to Bag */}
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">Step 4: Complete Bundle</span>
                    <h3 className="font-display text-3xl font-medium tracking-wide">Review & Finalize</h3>
                    <p className="text-xs text-charcoal/60">
                      Take a look at your customized arrangement. Once added to your bag, we will begin preparing your premium presentation hamper.
                    </p>
                  </div>

                  <div className="space-y-4 bg-ivory border border-stone/20 p-6 rounded-md shadow-sm">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal/60">{selectedBox.name} Packaging:</span>
                        <span className="font-semibold">£{selectedBox.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal/60">Jewellery Items ({totalItemsCount} pcs):</span>
                        <span className="font-semibold">£{itemsSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal/60">Signature Note Card:</span>
                        <span className="text-sage font-semibold uppercase tracking-wider text-[10px]">Complimentary</span>
                      </div>
                    </div>

                    <div className="border-t border-stone/20 pt-4 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold block">Total Price</span>
                        <span className="font-display text-3xl font-bold text-charcoal">£{totalHamperPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] text-sage font-bold tracking-widest uppercase mb-1">Includes VAT</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4 mt-8">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="flex-1 py-4 border border-stone/40 hover:border-charcoal text-charcoal/70 hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Note
                  </button>

                  <div className="flex-1">
                    <MagneticButton>
                      <button
                        onClick={handleAddHamperToCart}
                        className="w-full py-4 bg-charcoal hover:bg-gold text-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add Hamper to Bag
                      </button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
