"use client";

import { useState, useEffect } from "react";
import { updateOrderStatusAction, updateOrderPaymentStatusAction } from "@/actions/orders";
import { exportOrdersToCsv } from "@/utils/csv";
import { toast } from "sonner";
import { Search, Eye, Download, X, Clock, Check, ShieldAlert, CreditCard, ChevronRight, Loader2 } from "lucide-react";

interface OrderManagerProps {
  initialOrders: any[];
}

export default function OrderManager({ initialOrders }: OrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  
  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Apply filters and search client-side
  useEffect(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.payment_status === paymentFilter);
    }

    if (searchQuery) {
      result = result.filter((o) => {
        const details = o.customer_details || {};
        return (
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (details.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (details.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.payment_id || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, paymentFilter, orders]);

  // Sync URL search parameters if a specific order is requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (viewId) {
      const order = orders.find((o) => o.id === viewId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orders]);

  // Handle Order Status change
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);

    try {
      const res = await updateOrderStatusAction(selectedOrder.id, newStatus);
      if (res.success) {
        toast.success("Order status updated successfully", { id: toastId });
        
        // Update local state
        const updatedOrders = orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders);
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        toast.error(res.error || "Failed to update status", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Payment Status change
  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const toastId = toast.loading(`Updating payment to ${newPaymentStatus}...`);

    try {
      const res = await updateOrderPaymentStatusAction(selectedOrder.id, newPaymentStatus);
      if (res.success) {
        toast.success("Payment status updated successfully", { id: toastId });
        
        // Update local state
        const updatedOrders = orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, payment_status: newPaymentStatus } : o
        );
        setOrders(updatedOrders);
        setSelectedOrder((prev: any) => ({ ...prev, payment_status: newPaymentStatus }));
      } else {
        toast.error(res.error || "Failed to update payment status", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = exportOrdersToCsv(filteredOrders);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV!");
  };

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl font-light tracking-wide">Orders</h1>
          <p className="text-stone/40 text-xs mt-1">Track customer orders, payments, and shipping statuses.</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-6 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#161616] p-4 border border-stone/10">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email, or Payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-stone/10 pl-10 pr-4 py-2.5 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-charcoal border border-stone/10 px-4 py-2.5 text-xs text-stone/85 focus:outline-none focus:border-gold"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-charcoal border border-stone/10 px-4 py-2.5 text-xs text-stone/85 focus:outline-none focus:border-gold"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#161616] border border-stone/10 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone/10 text-stone/40 text-[9px] uppercase tracking-[0.2em] font-bold">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Order Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/5">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-xs text-stone/40">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const details = order.customer_details || {};
                
                return (
                  <tr key={order.id} className="text-xs hover:bg-stone/5 transition-colors">
                    <td className="p-4 font-mono text-stone/85">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-stone/85">{details.name || "N/A"}</p>
                        <span className="text-[10px] text-stone/40">{details.email || "N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(order.total_amount)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold ${
                          order.status === "delivered"
                            ? "bg-sage/10 text-sage"
                            : order.status === "pending"
                            ? "bg-gold/10 text-gold"
                            : order.status === "cancelled"
                            ? "bg-red-950/20 text-red-400"
                            : "bg-stone/10 text-stone"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold ${
                          order.payment_status === "paid"
                            ? "bg-sage/10 text-sage"
                            : order.payment_status === "failed"
                            ? "bg-red-950/20 text-red-400"
                            : "bg-stone/10 text-stone"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-stone/40">{formatDate(order.created_at)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-stone/5 hover:bg-stone/10 text-stone/60 hover:text-gold transition-colors cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />

          <div className="bg-[#161616] border border-stone/10 w-full max-w-2xl p-8 rounded-none shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-stone/40 hover:text-gold transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Modal Header */}
              <div className="border-b border-stone/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">
                  Order Details
                </span>
                <h2 className="font-display text-3xl font-light tracking-wide mt-1">
                  #{selectedOrder.id.toUpperCase()}
                </h2>
                <p className="text-[10px] text-stone/40 mt-1">Placed on {formatDate(selectedOrder.created_at)}</p>
              </div>

              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-2 gap-6 bg-stone/5 p-4 border border-stone/10 text-xs">
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold">Customer</h3>
                  <p className="font-medium text-stone/85">{selectedOrder.customer_details?.name}</p>
                  <p className="text-stone/50">{selectedOrder.customer_details?.email}</p>
                  <p className="text-stone/50">{selectedOrder.customer_details?.phone}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold">Shipping Address</h3>
                  <p className="text-stone/50 leading-relaxed">
                    {selectedOrder.customer_details?.address}<br />
                    {selectedOrder.customer_details?.city}, {selectedOrder.customer_details?.postal_code}<br />
                    {selectedOrder.customer_details?.country}
                  </p>
                </div>
              </div>

              {/* Status Update Dropdowns */}
              <div className="grid grid-cols-2 gap-6 border-b border-stone/10 pb-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone/40 font-semibold block">
                    Order Status
                  </label>
                  <select
                    disabled={updatingStatus}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-charcoal border border-stone/20 px-3 py-2 text-xs text-stone/85 focus:outline-none focus:border-gold disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone/40 font-semibold block">
                    Payment Status
                  </label>
                  <select
                    disabled={updatingStatus}
                    value={selectedOrder.payment_status}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                    className="w-full bg-charcoal border border-stone/20 px-3 py-2 text-xs text-stone/85 focus:outline-none focus:border-gold disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase tracking-wider text-gold font-semibold">Items Purchased</h3>
                <div className="border border-stone/10 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone/5 border-b border-stone/10 text-stone/40 text-[9px] uppercase tracking-wider font-semibold">
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone/5 text-stone/85">
                      {selectedOrder.order_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <span className="font-medium">{item.products?.name || "Deleted Product"}</span>
                            {item.product_variants?.name && (
                              <span className="text-[9px] text-gold block mt-0.5">
                                Variant: {item.product_variants.name}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Totals */}
              <div className="flex flex-col items-end space-y-1.5 text-xs pt-4 border-t border-stone/10">
                <div className="flex justify-between w-60 text-stone/50">
                  <span>Shipping Fee:</span>
                  <span>{formatCurrency(selectedOrder.shipping_charge)}</span>
                </div>
                <div className="flex justify-between w-60 text-stone/50">
                  <span>Tax Amount:</span>
                  <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between w-60 text-base font-semibold text-gold pt-2 border-t border-stone/5">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
