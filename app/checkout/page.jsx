import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout | BelaView",
  description: "Complete your purchase with cash on delivery.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 flex-col bg-sand-soft">
          <header className="border-b border-sand-line bg-sand">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Secure checkout
              </p>
              <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
                Checkout
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-smoke">
                Preparing checkout…
              </p>
            </div>
          </header>
        </main>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
