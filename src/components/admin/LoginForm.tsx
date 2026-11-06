"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setLoading(true);
    const result = await loginAction(String(form.get("email")), String(form.get("password")));
    setLoading(false);
    if (result.success) {
      router.replace("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 36 }}>
          <div className="brand" style={{ marginBottom: 28 }}>
            <span className="brand-mark">SB</span>
            <span className="brand-name">
              STUDIO ADMIN<span className="brand-period">.</span>
            </span>
          </div>
          <h1 style={{ font: '600 30px "Space Grotesk"', letterSpacing: "-.05em", margin: 0 }}>Sign in</h1>
          <p className="admin-subtitle">CONTENT MANAGEMENT</p>
        </div>
        <form onSubmit={handleSubmit} noValidate={false}>
          {error && (
            <div role="alert" style={{ padding: "10px 14px", background: "#d6454512", border: "1px solid #d6454540", color: "#d64545", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="email">EMAIL</label>
            <input id="email" name="email" type="email" className="admin-form-input" required autoComplete="email" autoFocus />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="password">PASSWORD</label>
            <input id="password" name="password" type="password" className="admin-form-input" required autoComplete="current-password" />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
