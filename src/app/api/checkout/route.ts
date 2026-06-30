import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay client on demand (prevents build issues if env keys are missing)
function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are not configured in environment variables.");
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ACTION 1: CREATE RAZORPAY ORDER & LOCAL ORDER
    if (action === "create_order") {
      const { customerDetails, items, shippingCharge, taxAmount, totalAmount } = body;

      if (!customerDetails || !items || items.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid checkout details" }, { status: 400 });
      }

      // Initialize Razorpay
      const rzp = getRazorpayInstance();
      
      // Create Razorpay Order (amount is in paise! ₹1 = 100 paise)
      const rzpOrder = await rzp.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      });

      // Insert local order as "pending"
      const supabase = await createClient();
      const { data: localOrder, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_details: customerDetails,
            shipping_charge: shippingCharge,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: "pending",
            payment_status: "pending",
            order_id: rzpOrder.id, // Save Razorpay Order ID
          },
        ])
        .select()
        .single();

      if (orderError) {
        throw new Error(`Local order creation failed: ${orderError.message}`);
      }

      // Insert order items
      const itemsToInsert = items.map((item: any) => ({
        order_id: localOrder.id,
        product_id: item.id,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) {
        throw new Error(`Failed to add order items: ${itemsError.message}`);
      }

      return NextResponse.json({
        success: true,
        rzpOrderId: rzpOrder.id,
        localOrderId: localOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      });
    }

    // ACTION 2: VERIFY PAYMENT SIGNATURE & COMPLETE ORDER
    if (action === "verify_payment") {
      const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature,
        localOrderId 
      } = body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !localOrderId) {
        return NextResponse.json({ success: false, error: "Missing verification parameters" }, { status: 400 });
      }

      // Verify signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        // Mark order payment as failed
        const supabase = await createClient();
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", localOrderId);

        return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
      }

      // Payment is verified! Update local order to "paid"
      const supabase = await createClient();
      
      // Update order
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          payment_id: razorpay_payment_id,
        })
        .eq("id", localOrderId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }

      // Deduct stock levels
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, variant_id, quantity")
        .eq("order_id", localOrderId);

      if (orderItems) {
        for (const item of orderItems) {
          if (item.variant_id) {
            const { data: variant } = await supabase
              .from("product_variants")
              .select("stock")
              .eq("id", item.variant_id)
              .single();
            if (variant) {
              await supabase
                .from("product_variants")
                .update({ stock: Math.max(0, variant.stock - item.quantity) })
                .eq("id", item.variant_id);
            }
          } else {
            const { data: product } = await supabase
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .single();
            if (product) {
              await supabase
                .from("products")
                .update({ stock: Math.max(0, product.stock - item.quantity) })
                .eq("id", item.product_id);
            }
          }
        }
      }

      return NextResponse.json({ success: true, localOrderId });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 450 });
  } catch (err: any) {
    console.error("Checkout API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
