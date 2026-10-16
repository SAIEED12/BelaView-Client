"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";


const slides = [
  {
    image: "/HeroPortrait.png",
    alt: "BelaView black swing chair with a red cushion in a sunlit bedroom",
    // position: "center",
    // title: "Made for Moments That Matter",
    // subtitle: "Create a cozy space to relax, read, talk, and simply slow down.",
    // cta: "Shop Now",
    href: "/products",
  },
  {
    image: "/22.png",
    alt: "Wooden porch swing with soft cushions overlooking a valley at sunset",
    position: "center 40%",
    // title: "Style Your Home",
    // subtitle:
    //   "We focus on bringing you products that combine quality, style, comfort, and value for everyday living.",
    // cta: "Discover More",
    href: "/products",
  },
  {
    image: "/33.png",
    alt: "Black metal swing chair with a red BelaView cushion",
    // Portrait shot — keep the crop on the seat and cushion.
    position: "center 58%",
    // title: "Welcome to Our Store",
    // subtitle:
    //   "Where comfort, style, beauty, and everyday essentials come together in one place.",
    // cta: "Shop Swings",
    href: "/products",
  },
  {
    image: "/44.png",
    alt: "Hanging wicker egg chair with plush cushions next to a bright window",
    position: "center",
    // title: "Explore Our Collection",
    // subtitle:
    //   "Beautifully crafted swing chairs and furniture, elegant sarees and fashion wear, and carefully selected cosmetics and beauty products.",
    // cta: "Explore Collection",
    href: "/products",
  },
  {
    image: "/55.png",
    alt: "Hanging wicker egg chair with plush cushions next to a bright window",
    position: "center",
    // title: "Explore Our Collection",
    // subtitle:
    //   "Beautifully crafted swing chairs and furniture, elegant sarees and fashion wear, and carefully selected cosmetics and beauty products.",
    // cta: "Explore Collection",
    href: "/products",
  },
];

// The banner spans the max-w-7xl container minus its horizontal padding.
const BANNER_SIZES =
  "(max-width: 639px) calc(100vw - 24px), (max-width: 1023px) calc(100vw - 48px), (min-width: 1280px) 1216px, calc(100vw - 64px)";

const titleClassName =
  "font-serif text-2xl leading-snug text-white sm:text-4xl sm:leading-[1.15] md:text-5xl";
const titleStyle = {
  textShadow: "0 2px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
};

/**
 * Compact rounded banner slider under the navbar.
 *
 * @param {number} autoplayMs   Time each banner holds before advancing. Default 5200.
 * @param {number} transitionMs Slide transition duration. Default 700.
 */
export default function Hero({ autoplayMs = 5200, transitionMs = 700 }) {
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect prefers-reduced-motion: no autoplay, instant slide changes.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(mq.matches);
    const onChange = (event) => setReduceMotion(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    swiper.params.speed = reduceMotion ? 0 : transitionMs;
    if (reduceMotion) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }
  }, [reduceMotion, transitionMs]);

  const goTo = useCallback((index) => {
    swiperRef.current?.slideToLoop(index);
  }, []);

  // Left/right arrow keys, unless the user is typing in a form field.
  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (event.key === "ArrowRight") swiperRef.current?.slideNext();
      if (event.key === "ArrowLeft") swiperRef.current?.slidePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pause the timer while a control has keyboard focus; resume when focus leaves.
  const handleFocusCapture = (event) => {
    if (!event.target.matches?.(":focus-visible")) return;
    swiperRef.current?.autoplay?.stop();
  };
  const handleBlurCapture = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (reduceMotion) return;
    swiperRef.current?.autoplay?.start();
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8"
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-mist shadow-[0_18px_44px_-26px_rgba(26,26,26,0.45)] sm:rounded-3xl">
        <Swiper
          modules={[A11y, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActive(swiper.realIndex)}
          slidesPerView={1}
          speed={transitionMs}
          loop
          grabCursor
          autoplay={{
            delay: autoplayMs,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.image} className="h-auto!">
              <div className="relative aspect-[9/5] w-full sm:aspect-[2/1]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  preload={index === 0}
                  sizes={BANNER_SIZES}
                  draggable={false}
                  className="object-cover"
                  style={
                    slide.position
                      ? { objectPosition: slide.position }
                      : undefined
                  }
                />

                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/55 via-black/20 to-black/60" />

                <Link
                  href={slide.href}
                  draggable={false}
                  aria-label={slide.title || undefined}
                  className="group absolute inset-0 z-10 flex select-none flex-col items-center justify-center px-6 text-center sm:px-14"
                >
                  <div className="flex w-full max-w-2xl flex-col items-center">
                    {index === 0 ? (
                      <h1 className={titleClassName} style={titleStyle}>
                        {slide.title}
                      </h1>
                    ) : (
                      <p className={titleClassName} style={titleStyle}>
                        {slide.title}
                      </p>
                    )}

                    {slide.subtitle ? (
                      <p className="mt-2 hidden max-w-md text-xs leading-relaxed text-white/85 sm:mt-3 sm:block sm:text-sm md:max-w-xl md:text-base">
                        {slide.subtitle}
                      </p>
                    ) : null}

                    {slide.cta ? (
                      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 py-2.5 pl-6 pr-2 text-xs font-medium text-ink shadow-lg transition-colors group-hover:bg-white sm:mt-6 sm:text-sm">
                        {slide.cta}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:translate-x-0.5 sm:h-7 sm:w-7">
                          <ArrowRight size={14} />
                        </span>
                      </span>
                    ) : null}
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Arrows — desktop only; mobile relies on swipe + dots */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:flex md:left-5 md:h-12 md:w-12"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:flex md:right-5 md:h-12 md:w-12"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination dots */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5 sm:bottom-5 sm:gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              className="h-1.5 cursor-pointer rounded-full bg-white/45 shadow-[0_1px_6px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-white/80"
              style={{
                width: index === active ? 26 : 7,
                backgroundColor: index === active ? "#ffffff" : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
