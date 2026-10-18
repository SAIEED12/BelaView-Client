"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_IMAGES = 4;

const ProductGallery = ({ images = [], name }) => {
  const shown = images.slice(0, MAX_IMAGES);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const sliderRef = useRef(null);

  // Mobile: keep the dots in sync with the swipe position
  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el || !el.clientWidth) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const scrollToSlide = (i) => {
    const el = sliderRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  // Desktop: zoom follows the cursor
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      on: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (shown.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full rounded-[24px] border border-[#E5E5E5] bg-[#F5F5F5]" />
    );
  }

  return (
    <div>
      {/* ---------- Mobile: swipeable slider ---------- */}
      <div className="relative lg:hidden">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[24px] border border-[#E5E5E5] bg-[#F5F5F5] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {shown.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center"
            >
              <Image
                src={src}
                alt={`${name} – image ${i + 1}`}
                fill
                unoptimized
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {shown.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
            {shown.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSlide(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full bg-white transition-all ${
                  i === active ? "w-5" : "w-1.5 opacity-60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- Desktop: main image with hover zoom + thumbnails ---------- */}
      <div
        className="mx-auto hidden w-full lg:block"
        // Keep the 4:5 image + thumbnails within the viewport height so the
        // gallery never grows when the info column gets taller.
        style={{ maxWidth: "min(100%, calc((100vh - 16rem) * 0.8))" }}
      >
        <div
          className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[24px] border border-[#E5E5E5] bg-[#F5F5F5]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        >
          <Image
            key={shown[active]}
            src={shown[active]}
            alt={`${name} – image ${active + 1}`}
            fill
            unoptimized
            priority={active === 0}
            sizes="50vw"
            className="object-cover transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{
              transform: zoom.on ? "scale(1.8)" : "scale(1)",
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
            }}
          />
        </div>

        {shown.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {shown.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5] transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  i === active
                    ? "ring-2 ring-brand"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  sizes="12vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;