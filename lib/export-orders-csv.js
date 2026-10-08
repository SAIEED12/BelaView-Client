const CSV_INJECTION_RE = /^[=+\-@]/;
const BOM = "\uFEFF";

const pad2 = (n) => String(n).padStart(2, "0");

export const formatOrderDateCell = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const summarizeItems = (items) => {
  if (!Array.isArray(items)) return "";
  return items
    .map((item) => {
      const qty = Number(item?.quantity ?? 0);
      const title = String(item?.title ?? "Untitled product").replace(/\s+/g, " ").trim();
      return `${Number.isFinite(qty) ? qty : 0} x ${title || "Untitled product"}`;
    })
    .join("; ");
};

const escapeCell = (raw) => {
  let text = raw === null || raw === undefined ? "" : String(raw);
  // Single-line cells: an address/note with a line break would corrupt the row.
  text = text.replace(/[\r\n]+/g, " ").trim();
  // Guard against CSV formula injection (e.g. a note starting with "=SUM(").
  if (CSV_INJECTION_RE.test(text)) text = `'${text}`;
  if (text.includes('"') || text.includes(",") || text.includes(";")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const ordersToCsv = (orders) => {
  const header = [
    "Order ID",
    "Date",
    "Customer Name",
    "Phone",
    "Address",
    "Items",
    "Item Count",
    "Subtotal",
    "Delivery Charge",
    "Total",
    "Status",
    "Note",
  ];
  const lines = [header.map(escapeCell).join(",")];
  for (const order of Array.isArray(orders) ? orders : []) {
    lines.push(
      [
        order?._id ?? "",
        formatOrderDateCell(order?.createdAt),
        order?.customer?.name ?? "",
        order?.customer?.phone ?? "",
        order?.customer?.address ?? "",
        summarizeItems(order?.items),
        order?.itemCount ?? (Array.isArray(order?.items) ? order.items.length : 0),
        Number(order?.subtotal ?? 0),
        Number(order?.deliveryCharge ?? 0),
        Number(order?.totalAmount ?? 0),
        order?.orderStatus ?? "",
        order?.note ?? "",
      ]
        .map(escapeCell)
        .join(","),
    );
  }
  // BOM so Excel detects UTF-8 (Taka sign / Bangla text) correctly.
  return BOM + lines.join("\n");
};

export const downloadCsv = (filename, csvText) => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const buildOrdersFilename = ({ date = "", status = "", q = "" } = {}) => {
  const today = new Date();
  const stamp = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  const parts = ["orders", date || stamp];
  const cleanStatus = String(status ?? "").trim().toLowerCase();
  if (cleanStatus && cleanStatus !== "all") parts.push(cleanStatus);
  const cleanQ = String(q ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  if (cleanQ) parts.push(cleanQ);
  return `${parts.join("-")}.csv`;
};
