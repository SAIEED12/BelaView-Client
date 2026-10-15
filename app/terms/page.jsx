import Link from "next/link";

export const metadata = {
  title: "Terms of Service | BelaView",
  description:
    "The terms for shopping with BelaView: made-to-order products, 20% advance confirmation, and cash on delivery.",
};

const sections = [
  {
    title: "Made to order",
    text: "Every product is made in the size and colour you choose after you order. Because of this, confirmed orders cannot be cancelled once we start making your product.",
  },
  {
    title: "Confirming your order",
    text: "Your order is confirmed when you pay 20% of the price in advance. We begin making your product only after this payment.",
  },
  {
    title: "Delivery and payment",
    text: "We deliver by courier anywhere in Bangladesh. You pay the remaining 80% to the courier when your order arrives. Please open the package in front of the courier and check it.",
  },
  {
    title: "Damaged or wrong items",
    text: "If your package arrives damaged or the wrong product, tell us immediately with photos. Our return policy explains what happens next.",
  },
];

export default function TermsOfService() {
  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-brand">Terms of service</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Simple terms for made-to-order shopping.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
            By ordering from BelaView, you agree to the terms below.
          </p>
        </div>
      </section>

      <section
        aria-label="Terms of service details"
        className="border-y border-line bg-mist"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <ol className="grid gap-10 md:grid-cols-2 md:gap-12">
            {sections.map((section, i) => (
              <li key={section.title} className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink sm:text-lg">
                    {section.title}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
                    {section.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-smoke sm:text-base">
          Found damage when you opened your package?{" "}
          <Link
            href="/return-policy"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Read our return policy
          </Link>{" "}
          or{" "}
          <Link
            href="/contact"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            contact us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
