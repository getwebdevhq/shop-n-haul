"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { toast } from "sonner";
import { ChevronLeft, ShoppingBag, CreditCard, ShieldCheck, Truck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add items before checking out.");
      router.push("/");
    }
  }, [cart, router]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2000 ? 0 : 150; // Free shipping above ₹2,000
  const taxAmount = Math.round(subtotal * 0.03); // 3% GST on jewelry
  const totalAmount = subtotal + shippingFee + taxAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !address || !city || !postalCode) {
      toast.error("Please fill in all shipping details.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Initiating secure payment gateway...");

    try {
      const customerDetails = {
        name: fullName,
        email,
        phone,
        address,
        city,
        postal_code: postalCode,
        country,
      };

      // 1. Create order on server (Razorpay + Local DB)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          customerDetails,
          items: cart,
          shippingCharge: shippingFee,
          taxAmount,
          totalAmount,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate transaction");
      }

      const { rzpOrderId, localOrderId } = orderData;

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public Key
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Stash & Haul",
        description: "Timeless Jewellery Purchase",
        image: "/images/logo.png",
        order_id: rzpOrderId,
        handler: async function (response: any) {
          // 3. Verify payment on server
          toast.loading("Verifying payment transaction...", { id: toastId });
          
          const verifyRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify_payment",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              localOrderId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("Payment successful! Order placed.", { id: toastId });
            clearCart();
            router.push(`/checkout/success?id=${localOrderId}`);
          } else {
            toast.error(verifyData.error || "Payment verification failed", { id: toastId });
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#1A1A1A", // Deep Charcoal
        },
      };

      // 3. Open Razorpay payment modal
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Checkout failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans selection:bg-stone flex flex-col justify-between">
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 w-full">
        {/* Left Side: Shipping Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 border border-stone/20 hover:border-gold hover:text-gold transition-colors rounded-theme">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-display text-3xl font-light tracking-wide">Checkout</h1>
              <p className="text-[10px] text-stone/50 uppercase tracking-widest mt-0.5">Secure payment & shipping</p>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] text-gold font-bold border-b border-stone/15 pb-2">
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alexandra Sterling"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alexandra@sterling.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  Shipping Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Street, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold block">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="400001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-stone/5 border border-stone/20 px-4 py-3.5 text-xs text-charcoal focus:outline-none focus:border-gold rounded-theme"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-charcoal text-ivory hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.25em] transition-colors duration-500 shadow-xl flex items-center justify-center gap-2 cursor-pointer rounded-theme disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {loading ? "Processing..." : `Pay ${formatCurrency(totalAmount)} Now`}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary & Cart Items (5 cols) */}
        <div className="lg:col-span-5 bg-stone/10 border border-stone/25 p-8 rounded-theme space-y-6 h-fit">
          <h2 className="font-display text-2xl font-light tracking-wide text-left">Order Summary</h2>

          {/* Cart Items List */}
          <div className="divide-y divide-stone/20 max-h-64 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id + (item.variantId || "")} className="flex justify-between items-center py-3 first:pt-0">
                <div className="flex items-center gap-3 max-w-[70%] text-left">
                  <div className="w-10 h-12 relative bg-stone/20 rounded-theme overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                    <span className="text-[10px] text-stone/50 block mt-0.5">
                      Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-charcoal">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Box */}
          <div className="border-t border-stone/20 pt-4 space-y-2 text-xs text-charcoal/70">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span>{shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST 3%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gold pt-3 border-t border-stone/20">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Trusted Badge */}
          <div className="pt-6 border-t border-stone/20 flex items-center gap-3 text-[10px] text-charcoal/50 uppercase tracking-wider justify-center">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Encrypted Checkout Gateway</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
