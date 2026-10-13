'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";

export default function CategoryCarousel({ items = [] }) {
  const swiperRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(mq.matches);
    const onChange = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (reduceMotion) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }
  }, [reduceMotion]);

  if (!items.length) return null;

  const syncNav = (swiper) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  return (
    <div className="mt-8">
      <Swiper
        modules={[A11y, Autoplay, Navigation, Pagination]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          syncNav(swiper);
        }}
        onSlideChange={syncNav}
        onResize={syncNav}
        slidesPerView={1.15}
        spaceBetween={12}
        speed={500}
        loop
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        watchOverflow
        pagination={{ clickable: true, el: ".category-carousel-pagination" }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        className="pb-10!"
      >
        {items.map((item) => (
          <SwiperSlide key={item.slug} className="h-auto!">
            <div className="group relative h-full overflow-hidden rounded-2xl bg-mist">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 639px) 80vw, (min-width: 1024px) 30vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              {/* Whole-card link sits under the content so sub-category
                  links stay independently clickable. */}
              <Link
                href={item.href}
                className="absolute inset-0 z-0 no-underline"
                aria-label={item.name}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-3 sm:p-5">
                <div className="flex items-end justify-between gap-2 sm:gap-3">
                  <div>
                    <h3 className="font-serif text-base text-white sm:text-xl">{item.name}</h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                      {item.count} {item.count === 1 ? "product" : "products"}
                      {Number.isFinite(item.minPrice)
                        ? ` · from ৳${Number(item.minPrice).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors group-hover:bg-brand">
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                {item.subs.length > 0 ? (
                  <ul className="relative z-20 flex flex-wrap gap-1.5 pt-1">
                    {item.subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={sub.href}
                          className="pointer-events-auto inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white no-underline backdrop-blur-md transition-colors hover:bg-brand"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="relative mt-2 flex items-center justify-center gap-4">
        <div className="category-carousel-pagination flex items-center justify-center gap-1.5 [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-line [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet-active]:w-7 [&_.swiper-pagination-bullet-active]:bg-brand" />
        <div className="absolute right-0 hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={!canPrev}
            aria-label="Previous categories"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={!canNext}
            aria-label="Next categories"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
