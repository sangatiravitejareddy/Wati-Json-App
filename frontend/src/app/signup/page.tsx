"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { FiZap, FiMail, FiLock, FiUser, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
    const { signup, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Google signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                }}
            />

            <div
                className="glass-card animate-fade-in-up"
                style={{ width: "100%", maxWidth: 440, padding: 40, position: "relative" }}
            >
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                        marginBottom: 32,
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <FiZap size={24} color="#6366f1" />
                    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        WATI <span className="gradient-text">Flow Builder</span>
                    </span>
                </Link>

                <h1
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        marginBottom: 8,
                        textAlign: "center",
                    }}
                >
                    Create your account
                </h1>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        marginBottom: 32,
                    }}
                >
                    Start building WhatsApp flows with AI
                </p>

                {error && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#ef4444",
                            fontSize: "0.9rem",
                            marginBottom: 20,
                        }}
                    >
                        <FiAlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Email
                        </label>
                        <div style={{ position: "relative" }}>
                            <FiMail
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                id="signup-email"
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: 44 }}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <FiLock
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                id="signup-password"
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: 44 }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Confirm Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <FiLock
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                id="signup-confirm-password"
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: 44 }}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: "100%", marginBottom: 16 }}
                    >
                        {loading ? <div className="spinner" /> : "Create Account"}
                    </button>
                </form>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        margin: "8px 0 16px",
                    }}
                >
                    <div
                        style={{ flex: 1, height: 1, background: "var(--border-primary)" }}
                    />
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        or
                    </span>
                    <div
                        style={{ flex: 1, height: 1, background: "var(--border-primary)" }}
                    />
                </div>

                <button
                    onClick={handleGoogle}
                    className="btn-secondary"
                    disabled={loading}
                    style={{ width: "100%", gap: 10 }}
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: 24,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
