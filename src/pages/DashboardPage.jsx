import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import StatCard from "../components/StatCard";
import { formatPrice, primaryImage, PLACEHOLDER_IMAGE } from "../utils/helpers";
import { toast } from "../utils/toast";

export default function DashboardPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await API.getAllBooks();
        if (active) setBooks(all);
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
  }, []);

  const total = books.length;
  const categories = new Set(books.map((b) => b.category).filter(Boolean)).size;
  const onSale = books.filter((b) => b.discount_price != null).length;
  const withImages = books.filter((b) => b.images && b.images.length).length;
  const latest = [...books]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-stone-900">Overview</h2>
      <p className="text-stone-500 text-sm mt-1">A quick snapshot of your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="📚" label="Total books" value={loading ? "…" : total} sub="in the catalog" tone="amber" />
        <StatCard icon="🏷️" label="Categories" value={loading ? "…" : categories} sub="unique categories" tone="sky" />
        <StatCard icon="🔥" label="On sale" value={loading ? "…" : onSale} sub="with discount price" tone="rose" />
        <StatCard icon="🖼️" label="With images" value={loading ? "…" : withImages} sub={`${total ? Math.round((withImages / total) * 100) : 0}% of books`} tone="emerald" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="font-display text-lg font-semibold text-stone-900">Quick actions</h3>
          <div className="mt-4 space-y-3">
            <Link
              to="/books/new"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold"
            >
              ＋ Add a new book
            </Link>
            <Link
              to="/books"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-300 hover:border-amber-500 text-stone-700 text-sm font-semibold"
            >
              📚 Manage books
            </Link>
            <Link
              to="/data"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-300 hover:border-amber-500 text-stone-700 text-sm font-semibold"
            >
              💾 Backup / Import database
            </Link>
          </div>
        </div>

        {/* Recent books */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-stone-900">Latest books</h3>
            <Link to="/books" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
              View all →
            </Link>
          </div>

          {error ? (
            <p className="mt-6 text-sm text-red-600">{error}</p>
          ) : loading ? (
            <div className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-16 bg-stone-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : latest.length ? (
            <ul className="mt-4 divide-y divide-stone-100">
              {latest.map((b) => (
                <li key={b.id} className="py-3 flex items-center gap-4">
                  <img
                    src={primaryImage(b)}
                    alt=""
                    className="w-12 h-16 rounded-lg object-cover bg-stone-100 border border-stone-200"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 truncate">{b.title}</p>
                    <p className="text-xs text-stone-500">
                      {b.category} · {formatPrice(b.price)}
                    </p>
                  </div>
                  <Link
                    to={`/books/${b.id}/edit`}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700 shrink-0"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-stone-500 text-sm">No books yet. Add your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
