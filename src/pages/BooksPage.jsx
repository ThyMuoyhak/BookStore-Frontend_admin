import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { BOOKS_PER_PAGE } from "../config";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDateTime, formatPrice, primaryImage, PLACEHOLDER_IMAGE } from "../utils/helpers";
import { toast } from "../utils/toast";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const limit = BOOKS_PER_PAGE;

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [cats, data] = await Promise.all([
          categories.length ? Promise.resolve({ items: [] }) : API.getBooks({ limit: 100 }),
          API.getBooks({ skip: (page - 1) * limit, limit, category, search }),
        ]);
        if (!active) return;
        if (!categories.length) {
          setCategories([
            ...new Set((cats.items || []).map((b) => b.category).filter(Boolean)),
          ]);
        }
        setBooks(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (active) {
          setError(err.message);
          toast(err.message, "error");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await API.deleteBook(deleting.id);
      toast(`Deleted "${deleting.title}"`, "success");
      setDeleting(null);
      const data = await API.getBooks({ skip: (page - 1) * limit, limit, category, search });
      setBooks(data.items || []);
      setTotal(data.total || 0);
      if ((data.items || []).length === 0 && page > 1) setPage((p) => p - 1);
    } catch (err) {
      toast(err.message, "error");
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-stone-900">Books</h2>
          <p className="text-stone-500 text-sm mt-1">
            {total} book{total === 1 ? "" : "s"} in the catalog.
          </p>
        </div>
        <Link
          to="/books/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm"
        >
          ＋ Add book
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || category) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-amber-500 text-stone-700 text-sm font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Book</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Updated</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-stone-400">
                    <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-sm">Loading books…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              ) : books.length ? (
                books.map((b) => {
                  const hasDiscount = b.discount_price != null;
                  return (
                    <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImage(b)}
                            alt=""
                            className="w-10 h-14 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate max-w-[220px]">
                              {b.title}
                            </p>
                            {b.description && (
                              <p className="text-xs text-stone-400 line-clamp-2 max-w-[220px]">
                                {b.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {hasDiscount ? (
                          <>
                            <span className="font-bold text-red-600">
                              {formatPrice(b.discount_price)}
                            </span>
                            <span className="ml-1.5 text-xs text-stone-400 line-through">
                              {formatPrice(b.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-stone-900">
                            {formatPrice(b.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs whitespace-nowrap">
                        {formatDateTime(b.updated_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/books/${b.id}/edit`}
                            className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-amber-500 text-stone-700 text-xs font-semibold"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleting(b)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-stone-500 text-sm">
                      No books found.
                      {(search || category) && " Try clearing the filters."}
                    </p>
                    {(search || category) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white text-stone-700 border border-stone-300 hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="text-sm text-stone-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white text-stone-700 border border-stone-300 hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete book"
        message={
          deleting
            ? `Are you sure you want to delete "${deleting.title}"? This action cannot be undone and will also remove its images.`
            : ""
        }
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
