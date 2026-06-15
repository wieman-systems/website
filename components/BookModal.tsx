"use client";

import { useEffect, useState } from "react";
import Plus from "./Plus";

interface BookModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  company: string;
  need: string;
}

function Field({
  label,
  type = "text",
  textarea,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field" style={{ marginBottom: 22 }}>
      <label style={{ fontFamily: "var(--font-mono), monospace" }}>{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        />
      )}
    </div>
  );
}

export default function BookModal({ open, onClose }: BookModalProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    need: "",
  });
  const [sent, setSent] = useState(false);
  const [btnH, setBtnH] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState(""); // honeypot

  const upd = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        setSent(false);
        setError(null);
        setSubmitting(false);
      }, 200);
      return () => clearTimeout(id);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const valid =
    form.name.trim() && /\S+@\S+\.\S+/.test(form.email);

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company_website: hp }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            background: "transparent",
            border: "none",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 18,
            color: "#000",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {sent ? (
          <div style={{ padding: "56px 40px", textAlign: "center" }}>
            <Plus
              size={22}
              color="#000"
              opacity={0.6}
              style={{ margin: "0 auto 24px" }}
            />
            <div
              className="eyebrow"
              style={{
                fontFamily: "var(--font-mono), monospace",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              Request received
            </div>
            <div
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              We&rsquo;ll be in touch.
            </div>
            <div
              style={{
                fontFamily: "var(--font-display), sans-serif",
                color: "var(--color-gray-600)",
                marginBottom: 32,
                fontSize: 15,
              }}
            >
              Response time: within 24 hours.
            </div>
            <button
              onClick={onClose}
              onMouseEnter={() => setBtnH(true)}
              onMouseLeave={() => setBtnH(false)}
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "11px 22px",
                background: "transparent",
                color: "#000",
                border: "1px solid #000",
                boxShadow: btnH ? "4px 4px 0 #000" : "none",
                transition: "box-shadow 80ms linear",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div style={{ padding: "clamp(28px, 5vw, 40px)" }}>
            <div
              className="eyebrow"
              style={{
                fontFamily: "var(--font-mono), monospace",
                marginBottom: 14,
              }}
            >
              <Plus size={11} color="#000" opacity={0.5} /> Book a call
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Let&rsquo;s scope your system.
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: 14,
                color: "var(--color-gray-600)",
                marginBottom: 30,
                lineHeight: 1.55,
              }}
            >
              Tell us what eats your team&rsquo;s time. We&rsquo;ll reply
              within 24 hours to set up a call.
            </p>
            <Field
              label="Name"
              value={form.name}
              onChange={upd("name")}
              placeholder="Your name"
            />
            <Field
              label="Work email"
              type="email"
              value={form.email}
              onChange={upd("email")}
              placeholder="you@company.com"
            />
            <Field
              label="Company"
              value={form.company}
              onChange={upd("company")}
              placeholder="Company name"
            />
            <Field
              label="What should run itself?"
              textarea
              value={form.need}
              onChange={upd("need")}
              placeholder="Describe the manual work…"
            />
            {/* Honeypot: hidden from people, catches bots that fill every field */}
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />
            <div style={{ marginTop: 28 }}>
              <button
                disabled={!valid || submitting}
                onClick={submit}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "15px 24px",
                  background: valid && !submitting ? "#000" : "var(--color-gray-300)",
                  color: valid && !submitting ? "#fff" : "var(--color-gray-500)",
                  border: "1px solid",
                  borderColor: valid && !submitting ? "#000" : "var(--color-gray-300)",
                  cursor: valid && !submitting ? "pointer" : "default",
                  transition: "background 80ms linear, color 80ms linear",
                }}
              >
                {submitting ? "Sending…" : "Request a call"}
              </button>
              {error && (
                <p
                  style={{
                    marginTop: 14,
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "#b00020",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
