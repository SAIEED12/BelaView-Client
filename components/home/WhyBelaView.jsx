import Image from "next/image";
import Link from "next/link";
import { Leaf, Hammer, Sofa, Truck, ArrowRight } from "lucide-react";

const perks = [
  {
    icon: Hammer,
    title: "Handcrafted in Bangladesh",
    text: "Woven and finished by skilled local artisans.",
  },
  {
    icon: Leaf,
    title: "Natural materials",
    text: "Rattan, wood and cotton chosen for durability.",
  },
  {
    icon: Sofa,
    title: "Made for comfort",
    text: "Deep seats and gentle sway for everyday rest.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    text: "Carefully packed and delivered to your door.",
  },
];

export default function WhyBelaView() {
  return (
    <section aria-label="Why BelaView" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mist">
              <Image
                src="/HeroPortrait.png"
                alt="Handcrafted BelaView swing"
                fill
                unoptimized
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl bg-mist">
              <Image
                src="/55.png"
                alt="Cozy swing corner"
                fill
                unoptimized
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-6 py-3 text-white shadow-xl">
            <span className="font-serif text-2xl text-brand-rose">100%</span>
            <span className="text-xs font-semibold uppercase text-white/80">
              Crafted for comfort
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Why BelaView
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Slow moments, made to last
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-smoke sm:text-base">
            Every BelaView starts as natural fibre and hardwood — woven, sanded and
            tested for daily use. No mass production, no shortcuts. Just a quiet
            corner to read, talk, and unwind.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <p.icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{p.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-smoke">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-dark"
          >
            Explore the collection
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
