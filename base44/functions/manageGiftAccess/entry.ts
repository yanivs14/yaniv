const TOKEN_TTL = 365 * 24 * 60 * 60 * 1000; // 1 year

function b64encode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(str) {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

async function hmacSign(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacVerify(data, sigB64, secret) {
  const expected = await hmacSign(data, secret);
  return expected === sigB64;
}

async function createToken(email, secret) {
  const expiry = Date.now() + TOKEN_TTL;
  const payload = `${email}:${expiry}`;
  const payloadB64 = b64encode(payload);
  const sig = await hmacSign(payload, secret);
  return `${payloadB64}.${sig}`;
}

async function verifyToken(token, secret) {
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return { valid: false };
  try {
    const payload = b64decode(payloadB64);
    const colonIdx = payload.lastIndexOf(":");
    if (colonIdx === -1) return { valid: false };
    const email = payload.slice(0, colonIdx);
    const expiry = parseInt(payload.slice(colonIdx + 1), 10);
    if (Date.now() > expiry) return { valid: false };
    const ok = await hmacVerify(payload, sigB64, secret);
    return { valid: ok, email: ok ? email : undefined };
  } catch {
    return { valid: false };
  }
}

async function sendAccessEmail(email, token, origin) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) { console.warn("RESEND_API_KEY not set"); return; }
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@royegold.com";
  const link = `${origin}/gift?token=${token}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0F0F0F;font-family:sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 24px;">
<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#00fff7;font-weight:700;margin:0 0 16px;">The Movement</p>
<h1 style="font-size:24px;color:#F5F5F5;margin:0 0 16px;line-height:1.2;">Your Free Movement Reset is Ready</h1>
<p style="font-size:15px;color:#C8C8C8;line-height:1.6;margin:0 0 24px;">Click below to access your 5-minute practice with Roye Gold. This link won't expire — bookmark it for easy access.</p>
<a href="${link}" style="display:inline-block;background:#00fff7;color:#0F0F0F;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;text-transform:uppercase;letter-spacing:1px;">Start My Free Practice</a>
<p style="font-size:13px;color:#555;margin:32px 0 0;line-height:1.5;">Roye Gold | The Movement</p>
</div></body></html>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: [email], subject: "Your Free Movement Reset is Ready", html }),
  });
  if (!res.ok) console.warn("Email send failed:", res.status, await res.text());
  else console.log("Access email sent to:", email);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const secret = Deno.env.get("RESEND_API_KEY") || "fallback-secret";
    const origin = req.headers.get("origin") || "https://royegold.com";

    if (body.action === "create") {
      const { email, source } = body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: "Valid email required" }, { status: 400 });
      }
      const token = await createToken(email.trim(), secret);
      await sendAccessEmail(email.trim(), token, origin);
      console.log("Gift token created for:", email, "source:", source || "unknown");
      return Response.json({ success: true });
    }

    if (body.action === "verify") {
      const { token } = body;
      if (!token) return Response.json({ valid: false });
      const result = await verifyToken(token, secret);
      console.log("Token verified:", result.valid, result.email || "");
      return Response.json(result);
    }

    if (body.action === "manychat") {
      const { email, api_key } = body;
      if (!api_key || api_key !== Deno.env.get("MANYCHAT_API_KEY")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: "Valid email required" }, { status: 400 });
      }
      const token = await createToken(email.trim(), secret);
      return Response.json({ token, url: `${origin}/gift?token=${token}` });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("manageGiftAccess error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});