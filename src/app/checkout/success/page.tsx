import { OrderService } from "@/services/order.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ShoppingBag, Truck, Calendar, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export const revalidate = 0; // Ensure fresh order details are fetched

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const order = await OrderService.getOrderById(id);

  if (!order) {
    notFound();
  }

  const details = order.customer_details || {};

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Delivery estimation (3-5 days from order creation)
  const getDeliveryDateRange = () => {
    const orderDate = new Date(order.created_at);
    const minDelivery = new Date(orderDate);
    minDelivery.setDate(orderDate.getDate() + 3);
    const maxDelivery = new Date(orderDate);
    maxDelivery.setDate(orderDate.getDate() + 5);

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${minDelivery.toLocaleDateString("en-IN", options)} - ${maxDelivery.toLocaleDateString("en-IN", options)}`;
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans selection:bg-stone flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24 w-full text-center space-y-12">
        {/* Checkmark and Confirmation */}
        <div className="space-y-4 flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-sage" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-bold">Payment Verified</span>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide text-charcoal">
            Thank you for your order
          </h1>
          <p className="text-charcoal/60 text-xs max-w-md mx-auto leading-relaxed">
            Your payment has been processed successfully. A confirmation email with invoice details has been sent to{" "}
            <strong className="text-charcoal">{details.email}</strong>.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-stone/10 border border-stone/25 p-8 rounded-theme text-left space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone/20 pb-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-stone/50 font-bold">Order ID</span>
              <p className="font-mono text-sm text-charcoal font-semibold mt-0.5">
                #{order.id.toUpperCase()}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-stone/50 font-bold">Order Date</span>
              <p className="text-xs text-charcoal font-semibold mt-0.5">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Shipping & Delivery Estimates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-stone/20 pb-6">
            <div className="space-y-2 text-xs">
              <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Estimated Delivery
              </h3>
              <p className="font-medium text-charcoal text-sm">{getDeliveryDateRange()}</p>
              <span className="text-stone/50 text-[10px]">Express Shipping with tracking</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Shipping Address
              </h3>
              <p className="text-charcoal/75 leading-relaxed font-medium">
                {details.name}<br />
                {details.address}, {details.city}<br />
                {details.postal_code}, {details.country}
              </p>
            </div>
          </div>

          {/* Purchased Items list */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold">Items Purchased</h3>
            
            <div className="divide-y divide-stone/15 text-xs">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-3 first:pt-0">
                  <div className="max-w-[75%]">
                    <p className="font-medium text-charcoal">{item.products?.name}</p>
                    {item.product_variants?.name && (
                      <span className="text-[9px] text-gold block mt-0.5">
                        Option: {item.product_variants.name}
                      </span>
                    )}
                    <span className="text-[9px] text-stone/40 block mt-0.5">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-charcoal">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-stone/20 pt-4 flex flex-col items-end space-y-1.5 text-xs">
              <div className="flex justify-between w-60 text-stone/50">
                <span>Shipping Fee:</span>
                <span>{order.shipping_charge === 0 ? "FREE" : formatCurrency(order.shipping_charge)}</span>
              </div>
              <div className="flex justify-between w-60 text-stone/50">
                <span>Tax (GST 3%):</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between w-60 text-sm font-semibold text-gold pt-2 border-t border-stone/15">
                <span>Total Paid:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-ivory hover:bg-gold hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 shadow-xl rounded-theme"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
