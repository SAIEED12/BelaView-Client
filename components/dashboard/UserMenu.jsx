"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, LogOut } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "A";

  // Close when clicking anywhere outside the trigger/popover.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setOpen(false);
            router.push("/");
            router.refresh();
          },
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={menuId}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-mist px-3 py-2.5 text-left transition-colors hover:bg-brand-soft/60"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">
            {user?.name ?? "Account"}
          </span>
          <span className="block truncate text-xs text-fog">
            {user?.email ?? ""}
          </span>
        </span>
        <ChevronUp
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-fog transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-black/10"
        >
          <div className="px-4 py-3">
            <p className="break-words text-sm font-semibold text-ink">
              {user?.name ?? "Account"}
            </p>
            {user?.email ? (
              <p className="mt-0.5 break-all text-xs text-fog">{user.email}</p>
            ) : null}
          </div>
          <div className="border-t border-line p-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
