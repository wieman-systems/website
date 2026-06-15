import { NextRequest, NextResponse } from "next/server";

// Where leads are delivered. Overridable via env without a code change.
const TO = process.env.CONTACT_TO || "caleb@wiemansystems.com";
// Until wiemansystems.com is verified in Resend, the shared sender works.
const FROM = process.env.CONTACT_FROM || "Wieman Systems <onboarding@resend.dev>";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const need = String(body.need ?? "").trim();
  const honeypot = String(body.company_website ?? "").trim();

  // Honeypot: a bot filled the hidden field — pretend success, send nothing.
  if (honeypot) return NextResponse.json({ ok: true });

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide your name and a valid email." },
      { status: 422 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — cannot send contact email.");
    return NextResponse.json(
      { error: "Email isn't configured yet. Please email us directly." },
      { status: 503 }
    );
  }

  const subject = `New inquiry — ${name}${company ? ` (${company})` : ""}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <h2 style="margin:0 0 18px;font-size:18px;font-weight:700">New contact request</h2>
      <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${company ? `<p style="margin:0 0 8px"><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
      ${need ? `<p style="margin:16px 0 0"><strong>What should run itself:</strong><br>${escapeHtml(need).replace(/\n/g, "<br>")}</p>` : ""}
      <hr style="border:none;border-top:1px solid #eee;margin:22px 0" />
      <p style="color:#888;font-size:13px;margin:0">Sent from the wiemansystems.com contact form.</p>
    </div>`;
  const text = `New contact request

Name: ${name}
Email: ${email}${company ? `\nCompany: ${company}` : ""}${need ? `\n\nWhat should run itself:\n${need}` : ""}

— wiemansystems.com contact form`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend API error", res.status, detail);
      return NextResponse.json(
        { error: "Could not send your message. Please email us directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed", err);
    return NextResponse.json(
      { error: "Could not send your message. Please email us directly." },
      { status: 502 }
    );
  }
}
