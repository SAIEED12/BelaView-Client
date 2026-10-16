"use client";

import { useEffect, useRef, useState } from "react";
import { formatBDT } from "@/lib/productFilters";
import { useFilterNavigation } from "./FilterNavigationProvider";

const PRICE_DEBOUNCE_MS = 400;

const PRICE_CHIPS = [
  { id: "under-5000", label: `Under ${formatBDT(5000)}`, min: "", max: "5000" },
  {
    id: "5000-15000",
    label: `${formatBDT(5000)}–${formatBDT(15000)}`,
    min: "5000",
    max: "15000",
  },
  { id: "over-15000", label: `${formatBDT(15000)}+`, min: "15000", max: "" },
];

const rangeInputClassName = [
  "pointer-events-none absolute top-0 h-5 w-full cursor-pointer appearance-none bg-transparent outline-none",
  "[&::-webkit-slider-runnable-track]:h-5 [&::-webkit-slider-runnable-track]:bg-transparent",
  "[&::-moz-range-track]:h-5 [&::-moz-range-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md",
].join(" ");

const numberInputClassName =
  "w-full min-w-0 rounded-xl border border-line bg-white py-2 pl-7 pr-3 text-sm text-ink outline-none placeholder:text-smoke focus:border-brand focus:ring-2 focus:ring-brand/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const normalizeBounds = (bounds) => {
  const min = Number(bounds?.min);
  const max = Number(bounds?.max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  return { min, max };
};

const parseNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sameBounds = (a, b) =>
  (a === null && b === null) ||
  (a !== null && b !== null && a.min === b.min && a.max === b.max);

export function PriceFilter({ priceBounds, minPrice = "", maxPrice = "" }) {
  const { navigate } = useFilterNavigation();
  const [minValue, setMinValue] = useState(minPrice);
  const [maxValue, setMaxValue] = useState(maxPrice);
  // Keep the widest price range seen so the slider never traps a committed
  // value. Adjusting during render (instead of an effect) avoids a cascading
  // re-render when the server sends narrower bounds for an active filter.
  const incomingBounds = normalizeBounds(priceBounds);
  const [bounds, setBounds] = useState(incomingBounds);
  const [syncedBounds, setSyncedBounds] = useState(incomingBounds);
  const timerRef = useRef(null);
  const committedRef = useRef(JSON.stringify({ minPrice, maxPrice }));

  if (!sameBounds(syncedBounds, incomingBounds)) {
    setSyncedBounds(incomingBounds);
    if (incomingBounds) {
      setBounds((prev) =>
        prev
          ? {
              min: Math.min(prev.min, incomingBounds.min),
              max: Math.max(prev.max, incomingBounds.max),
            }
          : incomingBounds,
      );
    }
  }

  // Sync only on external URL changes (back/forward, clear-all), never while typing.
  useEffect(() => {
    const snapshot = JSON.stringify({ minPrice, maxPrice });
    if (snapshot !== committedRef.current) {
      committedRef.current = snapshot;
      setMinValue(minPrice);
      setMaxValue(maxPrice);
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commitPrices = (minRaw, maxRaw) => {
    const min = String(minRaw ?? "").trim();
    const max = String(maxRaw ?? "").trim();
    committedRef.current = JSON.stringify({ minPrice: min, maxPrice: max });
    navigate((params) => {
      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }
      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
    });
  };

  const scheduleCommit = (minRaw, maxRaw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => commitPrices(minRaw, maxRaw),
      PRICE_DEBOUNCE_MS,
    );
  };

  const flushCommit = (minRaw, maxRaw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    commitPrices(minRaw, maxRaw);
  };

  const boundsMin = bounds?.min ?? null;
  const boundsMax = bounds?.max ?? null;
  const sliderEnabled = boundsMin !== null && boundsMax !== null;

  const sliderMin = sliderEnabled
    ? clamp(parseNumber(minValue) ?? boundsMin, boundsMin, boundsMax)
    : 0;
  const sliderMax = sliderEnabled
    ? clamp(parseNumber(maxValue) ?? boundsMax, boundsMin, boundsMax)
    : 0;
  const minPercent = sliderEnabled
    ? ((sliderMin - boundsMin) / (boundsMax - boundsMin)) * 100
    : 0;
  const maxPercent = sliderEnabled
    ? ((sliderMax - boundsMin) / (boundsMax - boundsMin)) * 100
    : 100;

  const handleMinSlider = (event) => {
    const raw = clamp(Number(event.target.value), boundsMin, sliderMax);
    const value = raw <= boundsMin ? "" : String(raw);
    setMinValue(value);
    scheduleCommit(value, maxValue);
  };

  const handleMaxSlider = (event) => {
    const raw = clamp(Number(event.target.value), sliderMin, boundsMax);
    const value = raw >= boundsMax ? "" : String(raw);
    setMaxValue(value);
    scheduleCommit(minValue, value);
  };

  const activeChipId =
    PRICE_CHIPS.find(
      (chip) => chip.min === minPrice && chip.max === maxPrice,
    )?.id ?? null;

  const handleChipClick = (chip) => {
    const isActive = activeChipId === chip.id;
    const min = isActive ? "" : chip.min;
    const max = isActive ? "" : chip.max;
    setMinValue(min);
    setMaxValue(max);
    flushCommit(min, max);
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <label htmlFor="products-min-price" className="sr-only">
          Minimum price
        </label>
        <div className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-fog"
          >
            ৳
          </span>
          <input
            id="products-min-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={minValue}
            onChange={(event) => {
              setMinValue(event.target.value);
              scheduleCommit(event.target.value, maxValue);
            }}
            onBlur={() => flushCommit(minValue, maxValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") flushCommit(minValue, maxValue);
            }}
            className={numberInputClassName}
          />
        </div>
        <span aria-hidden="true" className="shrink-0 text-sm text-fog">
          –
        </span>
        <label htmlFor="products-max-price" className="sr-only">
          Maximum price
        </label>
        <div className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-fog"
          >
            ৳
          </span>
          <input
            id="products-max-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={maxValue}
            onChange={(event) => {
              setMaxValue(event.target.value);
              scheduleCommit(minValue, event.target.value);
            }}
            onBlur={() => flushCommit(minValue, maxValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") flushCommit(minValue, maxValue);
            }}
            className={numberInputClassName}
          />
        </div>
      </div>

      {sliderEnabled ? (
        <div className="relative mt-4 h-5">
          <div
            aria-hidden="true"
            className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-line"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            min={boundsMin}
            max={boundsMax}
            step={50}
            value={sliderMin}
            onChange={handleMinSlider}
            aria-label="Minimum price"
            aria-valuetext={formatBDT(sliderMin)}
            className={rangeInputClassName}
            style={{ zIndex: sliderMin >= sliderMax ? 4 : 2 }}
          />
          <input
            type="range"
            min={boundsMin}
            max={boundsMax}
            step={50}
            value={sliderMax}
            onChange={handleMaxSlider}
            aria-label="Maximum price"
            aria-valuetext={formatBDT(sliderMax)}
            className={rangeInputClassName}
            style={{ zIndex: 3 }}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {PRICE_CHIPS.map((chip) => {
          const isActive = activeChipId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip)}
              aria-pressed={isActive}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-white text-smoke hover:border-brand hover:text-brand"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
