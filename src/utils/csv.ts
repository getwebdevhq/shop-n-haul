/**
   * Export orders list to CSV format.
   * Safe to run on both client and server.
   */
export function exportOrdersToCsv(orders: any[]): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Total Amount",
    "Status",
    "Payment Status",
    "Payment ID",
    "Created At",
  ];

  const rows = orders.map((order) => {
    const details = order.customer_details || {};
    return [
      order.id,
      `"${(details.name || "").replace(/"/g, '""')}"`,
      details.email || "",
      details.phone || "",
      order.total_amount,
      order.status,
      order.payment_status,
      order.payment_id || "",
      order.created_at,
    ];
  });

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
