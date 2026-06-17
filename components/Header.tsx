"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MagneticButton from "./MagneticButton";

interface HeaderProps {
  onBook: () => void;
}

export default function Header({ onBook }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

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
        {/* Logo — links home; on the home page it just smooth-scrolls to top. */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
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
        </Link>

        {/* Nav + CTA */}
        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 2.4vw, 30px)" }}>
          <Link
            href="/about"
            data-cursor
            className={`ws-nav${pathname === "/about" ? " is-active" : ""}`}
          >
            About
          </Link>
          <MagneticButton
            variant="solid-dark"
            onClick={onBook}
            style={{ padding: "11px 22px", fontSize: 12, letterSpacing: "0.1em" }}
          >
            Book a call
          </MagneticButton>
        </nav>
      </div>
    </header>
  );
}
