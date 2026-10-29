import { useState } from "react";
import { api } from "../api";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body =
        mode === "signup" ? { name, email, password } : { email, password };
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      onAuth(data); // gives { user, token } to App
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2>{mode === "login" ? "Log in" : "Create account"}</h2>

      {mode === "signup" && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 8 characters)"
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>

      <p className="switch" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login"
          ? "No account? Sign up"
          : "Already have an account? Log in"}
      </p>
    </form>
  );
}