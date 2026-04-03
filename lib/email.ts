import { Resend } from "resend";
import type { DBOrder } from "@/lib/orders";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function getFromEmail() {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "Cardinal Treats <onboarding@resend.dev>"
  );
}

// ─── Order confirmation ───────────────────────────────────────────────────────
export async function sendOrderConfirmation(order: DBOrder): Promise<{
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
}> {
  const to = order.userEmail;
  if (!to) return {}; // guest with no email — skip

  const firstName = order.userName?.split(" ")[0] ?? "there";
  const ref       = order.paystackReference;
  const statusLabel =
    order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Processing";

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f0ef;color:#1c1917;">
          ${i.qty}× ${i.name}${i.grams ? ` <span style="color:#78716c;font-size:12px;">(${i.grams}g)</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f0ef;text-align:right;color:#1c1917;font-weight:700;">
          ₦${(i.price * i.qty).toLocaleString()}
        </td>
      </tr>`
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<tr>
          <td style="padding:10px 0;color:#16A34A;font-size:13px;">
            Discount${order.couponCode ? ` (${order.couponCode})` : ""}
          </td>
          <td style="padding:10px 0;text-align:right;color:#16A34A;font-weight:700;">
            −₦${order.discount.toLocaleString()}
          </td>
        </tr>`
      : "";

  const addr = (order as any).deliveryAddress;
  const addressBlock = addr
    ? `
      <div style="background:#fafaf9;border:1.5px solid #e7e5e4;border-radius:16px;padding:16px 20px;margin:22px 0 28px;">
        <p style="margin:0;font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:.1em;font-weight:700;">
          Delivery Address
        </p>
        <p style="margin:8px 0 0;font-size:14px;color:#1c1917;font-weight:800;">
          ${addr.fullName ?? ""}
        </p>
        <p style="margin:6px 0 0;font-size:13px;color:#57534e;line-height:1.5;">
          ${addr.line1 ?? ""}${addr.line2 ? `<br/>${addr.line2}` : ""}<br/>
          ${addr.city ?? ""}, ${addr.state ?? ""} ${addr.country ?? ""}<br/>
          ${addr.phone ?? ""}
        </p>
      </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9f8f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#F59E0B;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
              Cardinal Treats
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">
              Order Confirmation
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1c1917;">
              Thanks, ${firstName}! 🎉
            </p>
            <p style="margin:0 0 28px;color:#78716c;font-size:15px;line-height:1.6;">
              Your payment was successful and your order is confirmed.
              Current status: <b style="color:#1c1917;">${statusLabel}</b>.
            </p>

            <!-- Reference -->
            <div style="background:#fafaf9;border:1.5px solid #e7e5e4;border-radius:16px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:.1em;font-weight:700;">
                Order Reference
              </p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1c1917;font-family:monospace;">
                ${ref}
              </p>
            </div>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              ${itemRows}
              ${discountRow}
              <tr>
                <td style="padding:14px 0 0;font-size:16px;font-weight:900;color:#1c1917;">Total Paid</td>
                <td style="padding:14px 0 0;text-align:right;font-size:18px;font-weight:900;color:#1c1917;">
                  ₦${order.total.toLocaleString()}
                </td>
              </tr>
            </table>

            ${addressBlock}

            <p style="margin:0;color:#78716c;font-size:13px;line-height:1.6;">
              Questions? Contact us at
              <a href="mailto:hello@cardinaltreats.com" style="color:#F59E0B;">
                sales@cardinaltorch.com 
              </a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafaf9;padding:24px 40px;text-align:center;border-top:1.5px solid #f1f0ef;">
            <p style="margin:0;color:#a8a29e;font-size:12px;">
              © 2026 Cardinal Treats · Made with ❤️ in Nigeria
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromEmail(),
    to: [to],
    subject: `Order Confirmed — ${ref} | Cardinal Treats`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Resend failed to send order confirmation email");
  }

  return {
    messageId: data?.id,
    accepted: [to],
    rejected: [],
  };
}

// ─── Status update email ──────────────────────────────────────────────────────
export async function sendStatusUpdate(order: DBOrder): Promise<void> {
  const to = order.userEmail;
  if (!to) return;

  const ref = order.paystackReference;
  const statusMessages: Record<string, string> = {
    processing: "Your order is being carefully packed.",
    shipped:    "Great news — your order is on its way!",
    delivered:  "Your order has been delivered. Enjoy your cashews!",
  };

  const msg         = statusMessages[order.status] ?? "Your order status has been updated.";
  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f9f8f7;margin:0;padding:40px 16px;">
  <table width="560" cellpadding="0" cellspacing="0"
    style="margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <tr>
      <td style="background:#F59E0B;padding:28px 40px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">
          Cardinal<span style="opacity:.7">.</span>Treats
        </h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Order Update</p>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px;">
        <p style="font-size:20px;font-weight:800;color:#1c1917;margin:0 0 12px;">
          Order Status: <span style="color:#F59E0B;">${statusLabel}</span>
        </p>
        <p style="color:#78716c;font-size:15px;line-height:1.6;margin:0 0 20px;">${msg}</p>
        <p style="font-size:12px;color:#a8a29e;margin:0;">
          Ref: <b style="color:#1c1917;font-family:monospace;">${ref}</b>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#fafaf9;padding:20px 40px;text-align:center;border-top:1.5px solid #f1f0ef;">
        <p style="margin:0;color:#a8a29e;font-size:12px;">© 2025 Cardinal Treats · Lagos, NG</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: [to],
    subject: `Order ${statusLabel} — ${ref} | Cardinal Treats`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Resend failed to send status update email");
  }
}

// ─── Password reset code email ────────────────────────────────────────────────
export async function sendPasswordResetCodeEmail(params: {
  to: string;
  code: string;
  name?: string | null;
}): Promise<void> {
  const { to, code, name } = params;
  const firstName = name?.split(" ")[0] || "there";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9f8f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#F59E0B;padding:30px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;">
              Cardinal<span style="opacity:.7;">.</span>Treats
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.9);font-size:14px;">
              Password Reset
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#1c1917;">
              Hi ${firstName},
            </p>
            <p style="margin:0 0 18px;color:#57534e;font-size:14px;line-height:1.6;">
              Use this 6-digit code to reset your password. This code expires in 15 minutes.
            </p>
            <div style="background:#fafaf9;border:1.5px solid #e7e5e4;border-radius:16px;padding:16px 20px;text-align:center;margin-bottom:18px;">
              <p style="margin:0;color:#a8a29e;font-size:12px;text-transform:uppercase;letter-spacing:.1em;font-weight:700;">
                Reset Code
              </p>
              <p style="margin:8px 0 0;color:#1c1917;font-size:32px;letter-spacing:0.25em;font-weight:900;font-family:monospace;">
                ${code}
              </p>
            </div>
            <p style="margin:0;color:#78716c;font-size:12px;">
              If you did not request this, you can ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: [to],
    subject: "Your 6-digit password reset code | Cardinal Treats",
    html,
  });
  if (error) {
    throw new Error(error.message || "Resend failed to send password reset email");
  }
}