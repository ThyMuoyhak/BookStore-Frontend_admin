/* ============================================================
   Anti Developer Tools
   Casual protection: blocks common DevTools entry points,
   detects when the tools open and shows a warning overlay,
   and silences console output once tools are open.

   NOTE: This cannot fully hide DevTools (it's browser UI).
   It only deters casual users, not determined ones.
   ============================================================ */
(function () {
  "use strict";

  var DETECT_THRESHOLD = 160; // px gap between outer and inner window size
  var devtoolsOpen = false;
  var warningShown = false;

  function prevent(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
  }

  // Allow right-click copy/paste inside form fields, block it everywhere else.
  function allowContext(e) {
    var t = e.target;
    if (!t) return false;
    var tag = (t.tagName || "").toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      t.isContentEditable === true
    );
  }

  /* 1) Disable right-click -> Inspect */
  document.addEventListener("contextmenu", function (e) {
    if (allowContext(e)) return;
    prevent(e);
  });

  /* 2) Disable common DevTools keyboard shortcuts */
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toUpperCase();
    var mod = e.ctrlKey || e.metaKey;
    var blocked = false;

    if (k === "F12") blocked = true;
    else if (mod && e.shiftKey && ["I", "J", "C", "K", "S"].indexOf(k) !== -1)
      blocked = true; // Ctrl/Cmd+Shift+I / J / C / K / S
    else if (mod && k === "U") blocked = true; // view source
    else if (k === "F5" && e.shiftKey) blocked = true; // hard refresh

    if (blocked) prevent(e);
  });

  /* 3) Detect DevTools opening (docked bottom/right) */
  function checkDevTools() {
    var w = window.outerWidth - window.innerWidth > DETECT_THRESHOLD;
    var h = window.outerHeight - window.innerHeight > DETECT_THRESHOLD;
    var open = w || h;

    if (open && !devtoolsOpen) {
      devtoolsOpen = true;
      onDevToolsOpen();
    } else if (!open && devtoolsOpen) {
      devtoolsOpen = false;
      onDevToolsClose();
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkDevTools, 200);
  });

  /* Chromium-only event (best effort for undocked tools) */
  window.addEventListener("devtoolschange", function (e) {
    if (e && e.detail && e.detail.open) onDevToolsOpen();
  });

  function onDevToolsOpen() {
    try {
      window.console.clear();
    } catch (err) {}

    if (!warningShown) {
      warningShown = true;
      var overlay = document.createElement("div");
      overlay.id = "devtools-warning";
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;background:#1c1917;color:#fafaf9;" +
        "display:flex;align-items:center;justify-content:center;flex-direction:column;" +
        "gap:14px;font-family:Inter,system-ui,sans-serif;text-align:center;padding:24px;";
      overlay.innerHTML =
        '<div style="font-size:64px;line-height:1">🛑</div>' +
        '<h1 style="font-size:22px;font-weight:700;margin:0">Developer tools are disabled</h1>' +
        '<p style="color:#a8a29e;max-width:420px;margin:0">' +
        "Please close the developer tools to continue browsing this site.</p>";
      document.body.appendChild(overlay);
    }

    // Silence our own console output while the tools are open.
    ["log", "warn", "error", "info", "debug"].forEach(function (m) {
      if (window.console && typeof window.console[m] === "function") {
        try {
          window.console[m] = function () {};
        } catch (err) {}
      }
    });
  }

  function onDevToolsClose() {
    var overlay = document.getElementById("devtools-warning");
    if (overlay) overlay.remove();
    warningShown = false;
  }

  checkDevTools();
})();
