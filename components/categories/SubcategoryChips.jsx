import Link from "next/link";
import { categoryHref, subcategoryHref } from "@/lib/categories";

// Shared pill row for browsing sub-categories — the category and sub-category
// pages both render it so the two stay visually identical.
const CHIP =
  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold no-underline transition-colors";
const CHIP_IDLE = `${CHIP} border-line bg-sand-soft text-ink hover:border-brand hover:text-brand`;
const CHIP_ACTIVE = `${CHIP} border-brand bg-brand text-white`;

const CountBadge = ({ count, active = false }) => {
  if (!(count > 0)) return null;
  return (
    <span
      className={`text-[10px] font-semibold ${
        active ? "text-white/80" : "text-fog"
      }`}
    >
      {count}
    </span>
  );
};

const SubcategoryChips = ({
  parent,
  activeSlug = "",
  showAll = false,
  className = "",
}) => {
  const subcategories = Array.isArray(parent?.subcategories)
    ? parent.subcategories
    : [];
  if (!parent || subcategories.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {showAll ? (
        <li>
          {activeSlug ? (
            <Link href={categoryHref(parent)} className={CHIP_IDLE}>
              All {parent.name}
            </Link>
          ) : (
            <span aria-current="page" className={CHIP_ACTIVE}>
              All {parent.name}
            </span>
          )}
        </li>
      ) : null}

      {subcategories.map((entry) => {
        const count = Number(entry.productCount) || 0;

        if (activeSlug && entry.slug === activeSlug) {
          return (
            <li key={entry.slug}>
              <span aria-current="page" className={CHIP_ACTIVE}>
                {entry.name}
                <CountBadge count={count} active />
              </span>
            </li>
          );
        }

        return (
          <li key={entry.slug}>
            <Link href={subcategoryHref(parent, entry)} className={CHIP_IDLE}>
              {entry.name}
              <CountBadge count={count} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SubcategoryChips;
