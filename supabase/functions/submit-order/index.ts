// =====================================================
// Supabase Edge Function: Submit Order
// Handles order submission + email notifications
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handler for POST requests
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Parse request body
    const { 
      customer_name, 
      customer_company, 
      customer_email, 
      customer_phone, 
      customer_address, 
      notes, 
      items 
    } = await req.json();

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !customer_address || !items || items.length === 0) {
      throw new Error("Missing required fields");
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      throw new Error("Invalid email format");
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([{
        customer_name,
        customer_company: customer_company || null,
        customer_email,
        customer_phone,
        customer_address,
        notes: notes || null,
        items,
        status: "pending"
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save order");
    }

    // Get admin email from settings
    const { data: settings } = await supabase
      .from("settings")
      .select("default_email, company_name")
      .single();

    const adminEmail = settings?.default_email || "admin@hollyxaviera.com";
    const companyName = settings?.company_name || "PT. Holly Xaviera Export";

    // Initialize Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendKey) {
      const resend = new Resend(resendKey);

      // Format items for email
      const itemsList = items.map((item: any) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.category}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.moq}</td>
        </tr>
      `).join("");

      // Send email to admin
      await resend.emails.send({
        from: "PT. Holly Xaviera Export <noreply@hollyxaviera.com>",
        to: [adminEmail],
        subject: `New Inquiry: ${order.order_number}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c5f2d; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #2c5f2d; color: white; padding: 10px; text-align: left; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New B2B Inquiry Received</h1>
                </div>
                <div class="content">
                  <h2>Order Details</h2>
                  <p><strong>Order Number:</strong> ${order.order_number}</p>
                  <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                  
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> ${customer_name}</p>
                  <p><strong>Company:</strong> ${customer_company || "N/A"}</p>
                  <p><strong>Email:</strong> ${customer_email}</p>
                  <p><strong>Phone:</strong> ${customer_phone}</p>
                  <p><strong>Address:</strong> ${customer_address}</p>
                  ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
                  
                  <h3>Requested Products</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>MOQ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                  </table>
                  
                  <p>Please process this inquiry as soon as possible.</p>
                </div>
                <div class="footer">
                  <p>${companyName} - Automated Notification System</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // Send confirmation email to customer
      await resend.emails.send({
        from: "PT. Holly Xaviera Export <noreply@hollyxaviera.com>",
        to: [customer_email],
        subject: `Inquiry Confirmation - ${order.order_number}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c5f2d; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #2c5f2d; color: white; padding: 10px; text-align: left; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 12px 24px; background: #2c5f2d; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thank You for Your Inquiry</h1>
                </div>
                <div class="content">
                  <p>Dear ${customer_name},</p>
                  
                  <p>Thank you for contacting ${companyName}. We have received your inquiry and our team will review it shortly.</p>
                  
                  <p><strong>Inquiry Reference:</strong> ${order.order_number}</p>
                  <p><strong>Submission Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                  
                  <h3>Your Requested Products</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.map((item: any) => `
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                  
                  <p>Our sales team will contact you within 1-2 business days via WhatsApp or email with pricing and availability.</p>
                  
                  <p>If you have any urgent questions, please don't hesitate to contact us:</p>
                  <ul>
                    <li>Email: ${settings?.default_email || "info@hollyxaviera.com"}</li>
                    <li>WhatsApp: ${settings?.default_wa || "+6281234567890"}</li>
                  </ul>
                  
                  <p style="margin-top: 30px;">Best regards,<br>${companyName} Team</p>
                </div>
                <div class="footer">
                  <p>${companyName} | ${settings?.address || "Indonesia"}</p>
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } else {
      console.warn("RESEND_API_KEY not configured. Emails will not be sent.");
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        message: "Order submitted successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing order:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}

// Serve the function
serve(handleRequest);
