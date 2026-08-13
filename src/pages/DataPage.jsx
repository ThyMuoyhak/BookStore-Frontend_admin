import { useRef, useState } from "react";
import { API } from "../api";
import {
  buildBackupPayload,
  downloadJson,
  normalizeImportBooks,
} from "../utils/helpers";
import { toast } from "../utils/toast";

export default function DataPage() {
  const fileRef = useRef(null);
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [lastBackup, setLastBackup] = useState(null);
  const [result, setResult] = useState(null);

  // ---------- Backup ----------
  const handleBackup = async () => {
    setBackingUp(true);
    setResult(null);
    try {
      const books = await API.getAllBooks();
      const payload = buildBackupPayload(books);
      const stamp = new Date()
        .toISOString()
        .replace(/[:T]/g, "-")
        .replace(/\..+/, "");
      downloadJson(`bookstore-backup-${stamp}.json`, payload);
      setLastBackup(new Date());
      toast(`Backup created — ${books.length} book${books.length === 1 ? "" : "s"} included`, "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBackingUp(false);
    }
  };

  // ---------- Import ----------
  const handleImportFile = async (file) => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setProgress({ current: 0, total: 0 });
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("The selected file is not valid JSON.");
      }

      const books = normalizeImportBooks(parsed);
      if (!books.length) {
        throw new Error(
          "No valid books found. Expected a JSON array of books, or an object with a “books” array (each item needs a title and category)."
        );
      }

      // Existing titles — used to skip duplicates during import.
      const existing = await API.getAllBooks();
      const existingTitles = new Set(existing.map((b) => b.title.trim().toLowerCase()));

      const total = books.length;
      let imported = 0;
      let skipped = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < total; i += 1) {
        const book = books[i];
        if (existingTitles.has(book.title.toLowerCase())) {
          skipped += 1;
        } else {
          try {
            await API.createBook(book);
            existingTitles.add(book.title.toLowerCase());
            imported += 1;
          } catch (err) {
            failed += 1;
            errors.push(`${book.title}: ${err.message}`);
          }
        }
        setProgress({ current: i + 1, total });
      }

      setResult({ imported, skipped, failed, errors: errors.slice(0, 8), totalErrors: errors.length });
      toast(
        `Import finished — ${imported} added, ${skipped} skipped, ${failed} failed`,
        imported ? "success" : "info"
      );
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setImporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const pct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-semibold text-stone-900">Backup & Import</h2>
        <p className="text-stone-500 text-sm mt-1">
          Export your book catalog to a JSON file, or restore it from a previous backup.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* ---------- Backup ---------- */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 text-xl">
            ⬇️
          </span>
          <h3 className="font-display text-lg font-semibold text-stone-900 mt-3">
            Backup database
          </h3>
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            Downloads every book (including images and prices) as a{" "}
            <code className="text-amber-600">.json</code> file that you can store safely.
          </p>
          <button
            onClick={handleBackup}
            disabled={backingUp}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold"
          >
            {backingUp ? "Preparing backup…" : "💾 Backup database"}
          </button>
          {lastBackup && (
            <p className="mt-3 text-xs text-stone-400">
              Last backup: {lastBackup.toLocaleTimeString()} — the file was saved to your
              Downloads folder.
            </p>
          )}
        </div>

        {/* ---------- Import ---------- */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 text-xl">
            ⬆️
          </span>
          <h3 className="font-display text-lg font-semibold text-stone-900 mt-3">
            Import database
          </h3>
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            Restore books from a backup <code className="text-amber-600">.json</code> file.
            Books with a title that already exists are skipped to avoid duplicates.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              handleImportFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            disabled={importing}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-semibold"
          >
            {importing ? "Importing…" : "📥 Import database (.json)"}
          </button>
        </div>
      </div>

      {/* ---------- Progress ---------- */}
      {(importing || progress.total > 0) && (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-stone-700">
              Importing {progress.current} of {progress.total} books…
            </span>
            <span className="font-semibold text-amber-600">{pct}%</span>
          </div>
          <div className="mt-3 h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* ---------- Result ---------- */}
      {result && !importing && (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="font-display text-lg font-semibold text-stone-900">Import summary</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{result.imported}</p>
              <p className="text-xs font-medium text-emerald-700 mt-0.5">Imported</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
              <p className="text-xs font-medium text-amber-700 mt-0.5">Skipped (duplicates)</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              <p className="text-xs font-medium text-red-700 mt-0.5">Failed</p>
            </div>
          </div>
          {result.failed > 0 && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm">
              <p className="font-semibold text-red-700">
                {result.totalErrors} error{result.totalErrors === 1 ? "" : "s"}
                {result.totalErrors > result.errors.length ? " (showing first few)" : ""}:
              </p>
              <ul className="mt-2 space-y-1 text-red-600">
                {result.errors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ---------- Notes ---------- */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-500">
        <h4 className="font-semibold text-stone-700 mb-1.5">💡 How it works</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <span className="font-medium">Backup</span> exports all books through the API (
            <code>GET /api/books</code>, paged until complete) and saves them as a JSON file.
          </li>
          <li>
            <span className="font-medium">Import</span> reads a backup file and creates each book
            via <code>POST /api/books</code>. Titles already in the store are skipped.
          </li>
          <li>Both actions require you to be signed in to the admin panel.</li>
        </ul>
      </div>
    </div>
  );
}
