import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API } from "../api";
import { toast } from "../utils/toast";

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  price: "",
  discount_price: "",
  images: [{ image_url: "", is_primary: 1 }],
};

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const book = await API.getBook(id);
        if (!active) return;
        setForm({
          title: book.title || "",
          category: book.category || "",
          description: book.description || "",
          price: book.price == null ? "" : String(book.price),
          discount_price:
            book.discount_price == null || book.discount_price === "" ? "" : String(book.discount_price),
          images:
            book.images && book.images.length
              ? book.images.map((img) => ({
                  image_url: img.image_url || "",
                  is_primary: Number(img.is_primary) || 0,
                }))
              : [{ image_url: "", is_primary: 1 }],
        });
      } catch (err) {
        toast(err.message, "error");
        navigate("/books");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setImage = (index, field, value) => {
    setForm((f) => {
      const images = f.images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
      return { ...f, images };
    });
  };

  const addImage = () =>
    setForm((f) => ({ ...f, images: [...f.images, { image_url: "", is_primary: 0 }] }));

  const removeImage = (index) =>
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== index);
      const hasPrimary = images.some((img) => Number(img.is_primary) === 1);
      return { ...f, images: hasPrimary || !images.length ? images : [{ ...images[0], is_primary: 1 }, ...images.slice(1)] };
    });

  const setPrimary = (index) =>
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => ({ ...img, is_primary: i === index ? 1 : 0 })),
    }));

  const save = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const category = form.category.trim();
    const price = Number(form.price);

    if (!title || !category) {
      toast("Title and category are required", "error");
      return;
    }
    if (form.price === "" || Number.isNaN(price) || price < 0) {
      toast("Please enter a valid price", "error");
      return;
    }

    let discount_price = null;
    if (form.discount_price !== "") {
      const d = Number(form.discount_price);
      if (Number.isNaN(d) || d < 0) {
        toast("Please enter a valid discount price", "error");
        return;
      }
      discount_price = d;
      if (d > price) {
        toast("Discount price should not be higher than the regular price", "error");
        return;
      }
    }

    const images = form.images
      .filter((img) => img.image_url && img.image_url.trim())
      .map((img) => ({
        image_url: img.image_url.trim(),
        is_primary: Number(img.is_primary) || 0,
      }));

    if (!images.some((img) => Number(img.is_primary) === 1) && images.length) {
      images[0].is_primary = 1;
    }

    const payload = {
      title,
      category,
      description: form.description.trim() || null,
      price,
      discount_price,
      images,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await API.updateBook(id, payload);
        toast("Book updated", "success");
      } else {
        await API.createBook(payload);
        toast("Book created", "success");
      }
      navigate("/books");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-64 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-1.5";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/books"
          className="w-10 h-10 grid place-items-center rounded-xl border border-stone-300 hover:border-amber-500 text-stone-700"
          aria-label="Back"
        >
          ←
        </Link>
        <div>
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            {isEdit ? "Edit book" : "Add a new book"}
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {isEdit ? "Update the details of this book." : "Fill in the details to publish a new book."}
          </p>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Clean Code"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <input
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              placeholder="e.g. Programming"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="45.99"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Discount price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.discount_price}
              onChange={(e) => setField("discount_price", e.target.value)}
              placeholder="39.99 (optional)"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="A short description of the book…"
              rows="4"
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Images</label>
            <button
              type="button"
              onClick={addImage}
              className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-amber-500 text-stone-700 text-xs font-semibold"
            >
              ＋ Add image
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-start gap-3 bg-stone-50 rounded-xl p-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0">
                  {img.image_url ? (
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-stone-300 text-lg">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    value={img.image_url}
                    onChange={(e) => setImage(i, "image_url", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_primary"
                        checked={Number(img.is_primary) === 1}
                        onChange={() => setPrimary(i)}
                        className="accent-amber-500"
                      />
                      <span className="text-stone-600">Primary</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      disabled={form.images.length <= 1}
                      className="text-red-600 hover:text-red-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-stone-400">
              The image marked as <span className="font-semibold">Primary</span> is shown first in
              the store. You can paste any image URL.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-stone-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold shadow-sm"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create book"}
          </button>
          <Link
            to="/books"
            className="px-6 py-2.5 rounded-xl border border-stone-300 hover:border-stone-500 text-stone-700 text-sm font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
