import { OrderService } from "@/services/order.service";
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  Calendar,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable caching to ensure real-time stats

export default async function AdminDashboardPage() {
  const stats = await OrderService.getDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metricCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.revenueToday),
      description: "Delivered & paid orders today",
      icon: TrendingUp,
      color: "text-gold",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.revenueMonth),
      description: "Current calendar month",
      icon: Calendar,
      color: "text-gold",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      description: "New orders received today",
      icon: ShoppingBag,
      color: "text-ivory",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Awaiting fulfillment",
      icon: Clock,
      color: "text-sage",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      description: "Requires inventory replenishment",
      icon: AlertTriangle,
      color: stats.outOfStock > 0 ? "text-red-400" : "text-stone/40",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl font-light tracking-wide">Overview</h1>
          <p className="text-stone/40 text-xs mt-1">Real-time operational snapshot of your store.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-[#161616] border border-stone/10 p-6 flex flex-col justify-between h-36 rounded-none relative overflow-hidden"
            >
              <div>
                <span className="text-[9px] uppercase tracking-widest text-stone/40 font-bold block">
                  {card.title}
                </span>
                <span className={`text-2xl font-light tracking-wide mt-2 block ${card.color}`}>
                  {card.value}
                </span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-stone/50">{card.description}</span>
                <Icon className={`w-4 h-4 ${card.color}`} strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#161616] border border-stone/10 p-8 rounded-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-light tracking-wide">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone/10 text-stone/40 text-[9px] uppercase tracking-[0.2em] font-bold">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/5">
                {stats.recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-stone/40">
                      No orders received yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentActivity.map((order: any) => {
                    const details = order.customer_details || {};
                    return (
                      <tr key={order.id} className="text-xs text-stone/80 hover:text-ivory transition-colors">
                        <td className="py-4 font-mono">
                          <Link href={`/admin/orders?view=${order.id}`} className="hover:text-gold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-4">{details.name || "N/A"}</td>
                        <td className="py-4 font-medium">{formatCurrency(order.total_amount)}</td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold ${
                              order.status === "paid" || order.status === "delivered"
                                ? "bg-sage/10 text-sage"
                                : order.status === "pending"
                                ? "bg-gold/10 text-gold"
                                : "bg-stone/10 text-stone"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-stone/40">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-[#161616] border border-stone/10 p-8 rounded-none flex flex-col justify-between">
          <div>
            <h2 className="font-display text-2xl font-light tracking-wide mb-6">Best Sellers</h2>
            
            <div className="space-y-6">
              {stats.bestSellers.length === 0 ? (
                <p className="text-center text-xs text-stone/40 py-12">No products sold yet.</p>
              ) : (
                stats.bestSellers.map((item: any, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-stone/5 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-xs text-stone/80 font-medium">{item.name}</p>
                      <span className="text-[9px] text-stone/40 uppercase tracking-wider">
                        {item.quantity} sold • {formatCurrency(item.price)} each
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gold">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
