import Link from "next/link";
import { PackageOpen, ShieldAlert, Truck, XCircle } from "lucide-react";

export const metadata = {
  title: "Return Policy | BelaView",
  description:
    "How returns work at BelaView: check your order at delivery, report damage right away, and why made-to-order products can't be returned for change of mind.",
};

const steps = [
  {
    title: "Read the product details before you order",
    text: "Check the description, size, colour and materials carefully. Many of our products are made for you, so it helps to be sure before you place the order.",
  },
  {
    title: "Open the package in front of the delivery person",
    text: "When your order arrives, unpack it while the delivery person is still there and look it over for cracks, breaks or other damage.",
  },
  {
    title: "Report any problem to us immediately",
    text: "If you find a crack or a similar problem, tell us right away. Send us your order details and a photo if you can.",
  },
  {
    title: "We arrange the return and send the product back to you",
    text: "Once the problem is confirmed, the damaged product is returned and we ship the product to you again as soon as we can.",
  },
];

const ReturnPolicyPage = () => {
  return (
    <div className="bg-white">
      {/* Intro */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-brand">Return policy</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Check your order at delivery. Tell us right away if something is
            wrong.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
            Most of our products are made just for you, so we can&apos;t take
            returns for change of mind. If your order arrives damaged, we will
            make it right.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section
        aria-label="How returns work"
        className="border-y border-line bg-mist"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              What to do when your order arrives
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-smoke">
              Follow these four steps in order. They protect you and let us
              fix problems quickly.
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

      {/* Covered / not covered */}
      <section
        aria-label="What we accept and don't accept"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"
      >
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="border-t border-line pt-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
              <ShieldAlert size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">
              We will help if
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-smoke">
              <li className="flex gap-3">
                <PackageOpen
                  size={20}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>
                  The product arrives cracked, broken or damaged in a similar
                  way.
                </span>
              </li>
              <li className="flex gap-3">
                <Truck
                  size={20}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>
                  You opened it in front of the delivery person and reported
                  the problem to us immediately.
                </span>
              </li>
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink">
              <XCircle size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">
              We can&apos;t accept returns if
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-smoke">
              <li className="flex gap-3">
                <XCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-smoke"
                  aria-hidden="true"
                />
                <span>You simply don&apos;t like the product.</span>
              </li>
              <li className="flex gap-3">
                <XCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-smoke"
                  aria-hidden="true"
                />
                <span>You no longer need it.</span>
              </li>
            </ul>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-smoke">
              Each product is made just for you, so we can&apos;t resell it to
              someone else.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-ink px-6 py-12 text-center sm:px-12 md:py-14">
          <p className="font-serif text-2xl leading-tight text-brand-rose sm:text-3xl">
            Got a damaged order or a question?
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
            Message us with your order details as soon as you notice the
            problem, and we will take it from there.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact us
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Back to products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicyPage;