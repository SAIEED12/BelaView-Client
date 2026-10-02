"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    image: "/Hero.png",
    title: "Welcome to our store",
    subtitle:
      "Where comfort, style, beauty, and everyday essentials come together in one place. ",
    cta: "Shop Swings",
    href: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1765135685377-b6175d4c2788?auto=format&fit=crop&w=2400&q=90",
    title: "Explore our collection",
    subtitle:
      "Beautifully crafted swing chairs and furniture, elegant sarees and fashion wear, and carefully selected cosmetics and beauty products.",
    cta: "Explore Collection",
    href: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1647996091785-c1ec68da320c?q=80&w=2400&auto=format&fit=crop",
    title: "Bring Nature Home",
    subtitle:
      "Natural materials, timeless craftsmanship, and effortless elegance.",
    cta: "Discover More",
    href: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1664524168285-f9df501efa0c?auto=format&fit=crop&w=2400&q=90",
    title: "Made for Moments That Matter",
    subtitle: "Create a cozy space to relax, read, talk, and simply slow down.",
    cta: "Shop Now",
    href: "/products",
  },
];

/**
 * Full-screen hero carousel for the swing collection.
 *
 * @param {number} autoplayMs   Time each slide holds before advancing. Default 5500.
 * @param {number} transitionMs Crossfade duration between slides. Default 1200.
 */
export default function Hero({ autoplayMs = 5500, transitionMs = 1200 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef(null);
  const count = slides.length;

  const goTo = useCallback((i) => setActive((i + count) % count), [count]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(mq.matches);
    const onChange = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setActive((a) => (a + 1) % count);
    }, autoplayMs);
    return () => clearTimeout(t);
  }, [active, paused, autoplayMs, count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1));
  };

  const kenBurnsMs = Math.max(autoplayMs + transitionMs, 6000);
  const effectiveTransitionMs = reduceMotion ? 0 : transitionMs;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured swings"
      className="relative h-dvh min-h-140 w-full overflow-hidden bg-brand-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((s, i) => {
        const isActive = i === active;
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="absolute inset-0 overflow-hidden transition-opacity ease-in-out"
            style={{
              transitionDuration: `${effectiveTransitionMs}ms`,
              opacity: isActive ? 1 : 0,
            }}
          >
            <div
              key={isActive ? `kb-${i}-${active}` : `still-${i}`}
              className={`absolute inset-0 ${isActive && !reduceMotion ? "hero-kenburns" : ""}`}
              style={
                isActive && !reduceMotion
                  ? { animationDuration: `${kenBurnsMs}ms` }
                  : undefined
              }
            >
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/65" />
            <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_50%,rgba(0,0,0,0.55),transparent_75%)]" />
          </div>
        );
      })}

      {/* Centered content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {slides.map((s, i) => {
          if (i !== active) return null;
          const riseClass = reduceMotion
            ? "opacity-100"
            : "opacity-0 hero-rise";
          return (
            <div key={active} className="flex flex-col items-center">
              <h1
                className={`max-w-3xl font-serif text-[2.5rem] leading-[1.08] text-white sm:text-6xl md:text-7xl ${riseClass}`}
                style={{
                  ...(reduceMotion ? {} : { animationDelay: "60ms" }),
                  textShadow:
                    "0 2px 24px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.35)",
                }}
              >
                {s.title}
              </h1>
              <p
                className={`mt-5 max-w-md text-base leading-relaxed text-white/80 sm:max-w-xl md:text-lg ${riseClass}`}
                style={reduceMotion ? undefined : { animationDelay: "220ms" }}
              >
                {s.subtitle}
              </p>
              <Link
                href={s.href}
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[#f3f4f6b2] py-3.5 pl-7 pr-3 text-sm font-medium text-black shadow-lg"
              >
                {s.cta}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6 md:h-12 md:w-12"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6 md:h-12 md:w-12"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination */}
      <div className="absolute inset-x-0 bottom-7 z-10 flex items-center justify-center gap-2 md:bottom-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className="h-1.5 cursor-pointer rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70"
            style={{
              width: i === active ? "28px" : "7px",
              backgroundColor: i === active ? "#ffffff" : undefined,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes heroKenBurns {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.09) translate3d(-1.5%, -1%, 0);
          }
        }
        .hero-kenburns {
          animation-name: heroKenBurns;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        @keyframes heroRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-rise {
          animation: heroRise 750ms ease-out forwards;
        }
      `}</style>
    </section>
  );
}
