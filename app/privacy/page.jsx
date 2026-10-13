import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | BelaView",
  description:
    "How BelaView collects, uses and protects your personal information when you shop with us.",
};

const sections = [
  {
    title: "What we collect",
    text: "When you order or contact us, we collect your name, phone number, delivery address and order details. We only ask for what is needed to confirm, make and deliver your order.",
  },
  {
    title: "How we use it",
    text: "Your information is used to confirm your order, arrange courier delivery, and contact you about your purchase. We do not sell your personal information to anyone.",
  },
  {
    title: "Who sees it",
    text: "Only our team and the courier delivering your order see your delivery details. Payment information is handled directly between you and the payment receiver or courier.",
  },
  {
    title: "Your choices",
    text: "You can ask us at any time what information we hold about you, or ask us to correct or delete it. Contact us and we will help.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-white">
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-brand">Privacy policy</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Your information stays yours.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
            We collect as little as possible, use it only for your order, and
            never sell it.
          </p>
        </div>
      </section>

      <section
        aria-label="Privacy policy details"
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
          Questions about your privacy?{" "}
          <Link
            href="/contact"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Contact us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
