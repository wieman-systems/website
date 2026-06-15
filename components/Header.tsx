"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeaderProps {
  onBook: () => void;
}

export default function Header({ onBook }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const btnBg = pressed ? "#333" : hovered ? "#222" : "#000";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: `1px solid ${scrolled ? "#000" : "#e5e5e5"}`,
        transition: "border-color 140ms linear",
      }}
    >
      <div
        style={{
          height: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(18px, 2.2vw, 34px)",
        }}
      >
        {/* Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Wieman Systems home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <Image
            src="/assets/logo-mark.png"
            alt=""
            width={34}
            height={34}
            style={{ height: 34, width: "auto" }}
          />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: 15.6,
                letterSpacing: "0.13em",
                color: "#000",
              }}
            >
              WIEMAN
            </span>
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 500,
                fontSize: 9.2,
                letterSpacing: "0.44em",
                color: "#000",
                opacity: 0.92,
                marginTop: 4.4,
              }}
            >
              SYSTEMS
            </span>
          </span>
        </a>

        {/* CTA */}
        <button
          onClick={onBook}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setPressed(false); }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "11px 22px",
            background: btnBg,
            color: "#fff",
            border: "1px solid #000",
            whiteSpace: "nowrap",
            transition: "background 80ms linear",
            transform: pressed ? "translate(1px,1px)" : "none",
          }}
        >
          Book a call
        </button>
      </div>
    </header>
  );
}
