import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  MessageCircle,
  PackageCheck,
  Shirt,
  Sofa,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Us | BelaView",
  description:
    "BelaView brings swing chairs and furniture, sarees and fashion wear, and cosmetics and beauty products together in one easy-to-shop store.",
};

const collections = [
  {
    icon: Sofa,
    title: "Swing & Furniture",
    text: "Swing chairs and furniture built to last, for balconies, bedrooms and living rooms. We choose pieces that look good and stay comfortable through daily use.",
    examples: ["Swing chairs", "Living room pieces", "Home accents"],
    image: "/Hero1.jpg",
    alt: "Handcrafted swing chair",
  },
  {
    icon: Shirt,
    title: "Saree & Fashion",
    text: "Sarees and fashion wear for ordinary days, family gatherings and big celebrations. Pick something simple for the week or something special for the occasion.",
    examples: ["Everyday sarees", "Festive and occasion wear", "Fashion pieces"],
    image: "/Hero2.jpg",
    alt: "Cozy home corner with swing",
  },
  {
    icon: Sparkles,
    title: "Cosmetics & Beauty",
    text: "Cosmetics and beauty products chosen to fit into a real daily routine, from quick everyday essentials to a little something for dressing up.",
    examples: ["Skincare and care", "Makeup", "Beauty essentials"],
    image: "/Hero1.jpg",
    alt: "Beauty products arranged on a table",
  },
];

const promises = [
  {
    icon: BadgeCheck,
    title: "Chosen with care",
    text: "We look at quality, finish and value before a product reaches the store.",
  },
  {
    icon: PackageCheck,
    title: "Packed to arrive well",
    text: "Orders are packed carefully so your furniture, fabrics and beauty products arrive in good condition.",
  },
  {
    icon: MessageCircle,
    title: "Easy to reach",
    text: "Questions about a size, shade or delivery? Message us and a real person will reply.",
  },
  {
    icon: HeartHandshake,
    title: "Fair and simple",
    text: "Clear prices and clear information, so you know what you are getting.",
  },
];

const faqs = [
  {
    q: "What does BelaView sell?",
    a: "Swing chairs and furniture, sarees and fashion wear, and cosmetics and beauty products. You can browse all three in one store and order them together.",
  },
  {
    q: "How do I place an order?",
    a: "Open Products, choose what you like and follow the checkout steps. If you would rather order with help, contact us and we will guide you.",
  },
  {
    q: "Can I ask about a product before buying?",
    a: "Yes. Send us a message with the product name and your question. We can help with sizes, colours, materials and delivery details.",
  },
  {
    q: "What if something is not right with my order?",
    a: "Contact us as soon as you receive it, with your order details and a photo if possible. We will work out the next step with you.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-brand">About BelaView</p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
              For the home you live in, the clothes you wear and the way you
              feel.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
              BelaView is an online store for comfort, style and beauty. You
              will find swing chairs and furniture, sarees and fashion wear,
              and cosmetics and beauty products, all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Shop the collection
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-3/4 overflow-hidden rounded-[2rem] bg-mist">
              <Image
                src="/Hero1.jpg"
                alt="Handcrafted swing chair"
                fill
                priority
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 aspect-3/4 overflow-hidden rounded-[2rem] bg-mist">
              <Image
                src="/Hero2.jpg"
                alt="Cozy home corner with swing"
                fill
                priority
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-y border-line bg-mist">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Why we put these three together
          </h2>
          <div className="max-w-2xl space-y-4 text-base leading-[1.75] text-smoke">
            <p>
              A good day at home, an outfit you feel great in and a beauty
              routine you enjoy all come from the same idea: small things that
              make everyday life feel better.
            </p>
            <p>
              That is why BelaView brings furniture, fashion and beauty into
              one store. Whether you are refreshing a corner of your home,
              looking for a saree for an occasion or restocking your
              essentials, you can find it here without hunting across
              different shops.
            </p>
            <p>
              Every product we list has to meet the same standard: quality you
              can see, style you will want to keep and a price that feels
              fair.
            </p>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section
        id="collections"
        aria-label="Our collections"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"
      >
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Our collections
          </h2>
          <p className="mt-3 text-base leading-relaxed text-smoke">
            Three collections, one store. Start with what you need today and
            come back for the rest.
          </p>
        </div>

        <div className="mt-12 space-y-14 md:space-y-20">
          {collections.map((item, i) => (
            <article
              key={item.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <div
                className={`relative aspect-4/3 overflow-hidden rounded-[2rem] bg-mist ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-smoke">
                  {item.text}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.examples.map((ex) => (
                    <li
                      key={ex}
                      className="rounded-full border border-line px-3 py-1 text-sm text-ink font-semibold"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                  Browse {item.title.toLowerCase()}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Promises */}
      <section className="bg-mist">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <h2 className="max-w-2xl font-serif text-3xl leading-tight text-ink sm:text-4xl">
            What you can expect from us
          </h2>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p) => (
              <div key={p.title} className="border-t border-line pt-5">
                <p.icon size={22} className="text-brand" aria-hidden="true" />
                <dt className="mt-3 text-base font-semibold text-ink">
                  {p.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-smoke">
                  {p.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-ink px-6 py-14 text-center sm:px-12 md:py-16">
          <p className="font-serif text-3xl leading-tight text-brand-rose sm:text-4xl">
            Style your home. Express yourself. Feel beautiful.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
            Refresh your home, update your wardrobe or add to your beauty
            collection. We&apos;ll make it simple and enjoyable.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop the collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;