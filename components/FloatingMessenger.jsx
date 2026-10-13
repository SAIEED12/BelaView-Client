'use client';

import { usePathname } from "next/navigation";

export default function FloatingMessenger() {
  const pathname = usePathname();


  if (pathname.includes("dashboard")) return null;
 
  return (
    <a
      href="https://m.me/119744022748237"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on Messenger"
      title="Chat on Messenger"
      className="fixed bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0084FF] sm:bottom-6 sm:right-6"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13" />
      </svg>
    </a>
  );
}
