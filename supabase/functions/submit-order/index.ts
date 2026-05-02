import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates
const adminEmailTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5f2d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 New Inquiry Received</h1>
      <p>Order #${order.order_number}</p>
    </div>
    <div class="content">
      <h2>Customer Information</h2>
      <div class="order-details">
        <p><strong>Name:</strong> ${order.customer_name}</p>
        <p><strong>Company:</strong> ${order.customer_company || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>WhatsApp:</strong> ${order.customer_phone || 'N/A'}</p>
        <p><strong>Address:</strong><br>${order.customer_address}</p>
        ${order.notes ? `<p><strong>Notes:</strong><br>${order.notes}</p>` : ''}
      </div>
      
      <h2>Order Items (${order.total_items} total)</h2>
      <div class="order-details">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>MOQ</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.moq}</td>
                <td>${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <p style="margin-top: 20px;">
        <a href="${Deno.env.get('ADMIN_DASHBOARD_URL') || 'https://hollyxaviera.com/#admin'}" 
           style="display: inline-block; padding: 10px 20px; background: #2c5f2d; color: white; text-decoration: none; border-radius: 5px;">
          View in Dashboard
        </a>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated notification from PT. Holly Xaviera Export</p>
    </div>
  </div>
</body>
</html>
`;

const customerEmailTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5f2d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .confirmation { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2c5f2d; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Inquiry!</h1>
    </div>
    <div class="content">
      <p>Dear ${order.customer_name},</p>
      
      <div class="confirmation">
        <p><strong>✓ Inquiry Received Successfully</strong></p>
        <p>Your inquiry reference number: <strong>${order.order_number}</strong></p>
      </div>
      
      <p>We have received your inquiry for ${order.total_items} product(s) and our team will review it shortly.</p>
      
      <h3>What's Next?</h3>
      <ul>
        <li>Our sales team will review your inquiry within 24 hours</li>
        <li>We'll contact you via email or WhatsApp with a quotation</li>
        <li>If you have urgent questions, please contact us at ${Deno.env.get('COMPANY_EMAIL') || 'info@hollyxaviera.com'}</li>
      </ul>
      
      <h3>Your Inquiry Summary</h3>
      <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 5px;">
        ${order.items.map((item: any) => `
          <p style="margin: 5px 0;">• ${item.name} - Qty: ${item.quantity}</p>
        `).join('')}
      </div>
      
      <p>Thank you for choosing PT. Holly Xaviera Export as your trusted partner.</p>
      
      <p>Best regards,<br>
      <strong>PT. Holly Xaviera Export Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 PT. Holly Xaviera Export. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Parse request body
    const { customer, items, notes } = await req.json();

    // Validate required fields
    if (!customer?.name || !customer?.email || !items?.length) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      throw new Error("Invalid email format");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate total items
    const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name.trim(),
        customer_company: customer.company?.trim() || null,
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone?.trim() || null,
        customer_address: customer.address?.trim() || "",
        notes: notes?.trim() || null,
        items: items,
        total_items: totalItems,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Database error:", orderError);
      throw new Error("Failed to save order");
    }

    // Initialize Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@hollyxaviera.com";

    if (resendKey) {
      const resend = new Resend(resendKey);

      // Send email to admin
      try {
        await resend.emails.send({
          from: "PT. Holly Xaviera Export <noreply@hollyxaviera.com>",
          to: [adminEmail],
          subject: `📦 New Inquiry #${order.order_number} from ${customer.name}`,
          html: adminEmailTemplate(order)
        });
      } catch (emailError) {
        console.error("Failed to send admin email:", emailError);
        // Continue even if email fails
      }

      // Send confirmation email to customer
      try {
        await resend.emails.send({
          from: "PT. Holly Xaviera Export <noreply@hollyxaviera.com>",
          to: [customer.email],
          subject: `Inquiry Confirmation #${order.order_number}`,
          html: customerEmailTemplate(order)
        });
      } catch (emailError) {
        console.error("Failed to send customer email:", emailError);
        // Continue even if email fails
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping emails");
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        message: "Inquiry submitted successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && error.message === "Missing required fields" ? 400 : 500
      }
    );
  }
});
