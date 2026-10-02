import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery | BelaView",
  description:
    "How ordering, payment and delivery work at BelaView: pay 20% to confirm your made-to-order product, get free choice of size and colour, and pay the rest to the courier. Home delivery across Bangladesh.",
};

const steps = [
  {
    title: "Choose your size and colour",
    text: "Every product is made in the size and colour you pick, so check the details carefully before you order.",
  },
  {
    title: "Confirm your order with 20% of the price",
    text: "We start making your product once you confirm the order and pay 20% of the price in advance.",
  },
  {
    title: "We deliver to your home",
    text: "Your order is sent by courier to your home address, anywhere in Bangladesh.",
  },
  {
    title: "Pay the remaining amount to the courier",
    text: "When the courier arrives, open the package in front of them, check it, and pay the remaining 80%.",
  },
];

const channelLink =
  "inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-brand-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const ShippingAndDelivery = () => {
  return (
    <div className="bg-white">
      {/* Intro */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-brand">
            Shipping &amp; delivery
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Pay 20% to confirm. Pay the rest to the courier.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
            Every product is made in your choice of size and colour, and we
            deliver to your home all over Bangladesh.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section
        aria-label="How ordering and delivery work"
        className="border-y border-line bg-mist"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              From order to your door
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-smoke">
              Four steps, in this order.
            </p>
          </div>

          <ol className="space-y-8">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Payment */}
      <section
        aria-label="Payment"
        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8"
      >
        <div>
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Why we ask for 20% first
          </h2>
          <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-smoke">
            <p>
              Your product is made in the size and colour you choose, so it
              can&apos;t be sold to anyone else. The 20% advance confirms your
              order and lets us start making it.
            </p>
            <p>
              The remaining 80% is paid to the courier when your order
              arrives.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-mist p-6 sm:p-8">
          <h3 className="text-base font-semibold text-ink">
            Example: a product that costs ৳5,000
          </h3>
          <dl className="mt-4 divide-y divide-line text-base">
            <div className="flex items-center justify-between py-3">
              <dt className="text-smoke">Pay to confirm your order (20%)</dt>
              <dd className="font-semibold text-ink">৳1,000</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-smoke">Pay to the courier (80%)</dt>
              <dd className="font-semibold text-ink">৳4,000</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-smoke">
            This is only an example. Your own amounts depend on the product
            you choose.
          </p>
        </div>
      </section>

      {/* Related policy */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
        <p className="max-w-2xl border-t border-line pt-6 text-sm leading-relaxed text-smoke sm:text-base">
          Found damage when you opened your package? Tell us immediately.{" "}
          <Link
            href="/return-policy"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Read our return policy
          </Link>{" "}
          for what to do.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-ink px-6 py-12 text-center sm:px-12 md:py-14">
          <p className="font-serif text-2xl leading-tight text-brand-rose sm:text-3xl">
            Ready to confirm your order?
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
            Contact us with your product, size and colour, and we will confirm
            your order.
          </p>

          <ul className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <li>
              <a href="https://wa.me/+8801965599181" className={channelLink}>
                <MessageCircle size={16} aria-hidden="true" />
                Message on WhatsApp
              </a>
            </li>
            <li>
              <a href="tel:+8801965599181" className={channelLink}>
                <Phone size={16} aria-hidden="true" />
                +8801965599181
              </a>
            </li>
            <li>
              <a href="mailto:belaviewbd@gmail.com" className={channelLink}>
                <Mail size={16} aria-hidden="true" />
                belaviewbd@gmail.com
              </a>
            </li>
          </ul>

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

export default ShippingAndDelivery;