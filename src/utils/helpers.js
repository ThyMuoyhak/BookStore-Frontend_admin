import { CURRENCY } from "../config";

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='#f5f5f4'/><g fill='#d6d3d1'><rect x='240' y='300' width='120' height='160' rx='10'/><path d='M240 310 h120 M240 330 h120 M240 350 h80'/></g><text x='50%' y='520' font-family='Inter, sans-serif' font-size='26' fill='#a8a29e' text-anchor='middle'>No image</text></svg>`
  );

export function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return CURRENCY + "0.00";
  return CURRENCY + n.toFixed(2);
}

export function primaryImage(book) {
  if (!book || !book.images || !book.images.length) return PLACEHOLDER_IMAGE;
  const primary = book.images.find((i) => Number(i.is_primary) === 1) || book.images[0];
  return primary.image_url || PLACEHOLDER_IMAGE;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper to build a canonical "backup" object for the whole store.
export function buildBackupPayload(books) {
  return {
    app: "bookstore",
    type: "books-backup",
    version: 1,
    exported_at: new Date().toISOString(),
    books: books.map((b) => ({
      title: b.title,
      category: b.category,
      description: b.description,
      price: b.price,
      discount_price: b.discount_price,
      images: (b.images || []).map((img) => ({
        image_url: img.image_url,
        is_primary: Number(img.is_primary) || 0,
      })),
    })),
  };
}

// Normalize any accepted import shape into a list of book payloads.
export function normalizeImportBooks(payload) {
  if (!payload) return [];
  let books = Array.isArray(payload) ? payload : payload.books;
  if (!Array.isArray(books)) books = [];
  return books
    .filter((b) => b && typeof b === "object" && b.title && b.category)
    .map((b) => ({
      title: String(b.title).trim(),
      category: String(b.category).trim(),
      description: b.description == null ? null : String(b.description),
      price: Number(b.price),
      discount_price: b.discount_price == null || b.discount_price === "" ? null : Number(b.discount_price),
      images: Array.isArray(b.images)
        ? b.images
            .filter((img) => img && img.image_url)
            .map((img) => ({
              image_url: String(img.image_url),
              is_primary: Number(img.is_primary) || 0,
            }))
        : [],
    }));
}

// Trigger a browser download for a JSON string.
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
