import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Contact Us | BelaView",
  description:
    "Contact BelaView by email, phone or WhatsApp with questions about products, orders, delivery or returns.",
};

const EMAIL = "belaviewbd@gmail.com";
const PHONE_DISPLAY = "+8801965599181";
const PHONE_HREF = "tel:+8801965599181";
const WHATSAPP_HREF = "https://wa.me/+8801965599181";

const ADDRESS_LINES = ["Rampura, Banasree", "Dhaka-1219"];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS_LINES.join(", ")
)}`;

const channelLink =
  "text-base font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand hover:decoration-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

const tips = [
  "The product name or a link to it",
  "Your name and order details, if you have already ordered",
  "A photo, if you are reporting damage or asking about colour or size",
];

const ContactPage = () => {
  return (
    <div className="bg-white">
      {/* Intro */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-brand">Contact us</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            Questions about a product or an order? Talk to us directly.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke sm:text-lg">
            Message us about sizes, colours, materials, delivery or a problem
            with your order. A real person will reply.
          </p>
        </div>
      </section>

      {/* Channels */}
      <section
        aria-label="Ways to contact us"
        className="border-y border-line bg-mist"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-line pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                <MessageCircle size={20} aria-hidden="true" />
              </span>
              <dt className="mt-4 text-sm text-smoke">WhatsApp</dt>
              <dd className="mt-1">
                <a href={WHATSAPP_HREF} className={channelLink}>
                  Message us
                </a>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  Best for quick questions and sending photos.
                </p>
              </dd>
            </div>

            <div className="border-t border-line pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Phone size={20} aria-hidden="true" />
              </span>
              <dt className="mt-4 text-sm text-smoke">Phone</dt>
              <dd className="mt-1">
                <a href={PHONE_HREF} className={channelLink}>
                  {PHONE_DISPLAY}
                </a>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  Call us to place or check an order.
                </p>
              </dd>
            </div>

            <div className="border-t border-line pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Mail size={20} aria-hidden="true" />
              </span>
              <dt className="mt-4 text-sm text-smoke">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${EMAIL}`} className={channelLink}>
                  {EMAIL}
                </a>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  Best for longer questions or details.
                </p>
              </dd>
            </div>

            <div className="border-t border-line pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <dt className="mt-4 text-sm text-smoke">Address</dt>
              <dd className="mt-1">
                <address className="text-base font-semibold not-italic leading-relaxed text-ink">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                  Open in Google Maps
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* What to include */}
      <section
        aria-label="What to include in your message"
        className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8"
      >
        <div>
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Help us help you faster
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-smoke">
            Including these details in your first message saves a round of
            back and forth.
          </p>
        </div>

        <div>
          <ul className="divide-y divide-line border-y border-line">
            {tips.map((tip) => (
              <li
                key={tip}
                className="py-4 text-base leading-relaxed text-ink"
              >
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
            Received a damaged product? Tell us right away. Read our{" "}
            <Link
              href="/return-policy"
              className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
            >
              return policy
            </Link>{" "}
            to see how we handle it.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;