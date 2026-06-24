"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a1628", color: "#f0f4f8", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>App error</h1>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>{error.message}</p>
            <button
              type="button"
              onClick={reset}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#00d084", color: "#0a1628", fontWeight: 600, cursor: "pointer" }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
