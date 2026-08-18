/* ============================================================
   Global configuration for the Book Store admin frontend.
   ============================================================ */

// Base URL of the FastAPI backend.
// - Local development: defaults to http://127.0.0.1:8000
// - Production (Netlify): set the REACT_APP_API_URL environment variable
//   on Netlify (Site settings -> Environment variables) to your deployed
//   backend URL, then rebuild. It is inlined into the bundle at build time.
export const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  "http://127.0.0.1:8000";

// Currency symbol used when formatting prices.
export const CURRENCY = "$";

// How many books the admin lists per page.
export const BOOKS_PER_PAGE = 15;

