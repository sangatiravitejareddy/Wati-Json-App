"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
    FiCheckCircle,
    FiZap,
    FiStar,
    FiCreditCard,
} from "react-icons/fi";

export default function PricingPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadUsage();
    }, []);

    const loadUsage = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/user-usage", token);
            setUsage(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpgrade = async (plan: string) => {
        setLoading(plan);
        setError("");
        try {
            const token = await getToken();
            const result = await api.post("/create-payment", { plan }, token);
            if (result.checkout_url) {
                window.location.href = result.checkout_url;
            }
        } catch (err: any) {
            setError(err.message || "Failed to create checkout");
        } finally {
            setLoading(null);
        }
    };

    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            features: [
                "3 flows total",
                "All 15+ node types",
                "JSON export",
                "Community support",
            ],
            badge: "badge-free",
            cta: "Current Plan",
            planId: "free",
        },
        {
            name: "Pro",
            price: "$5",
            period: "/month",
            features: [
                "20 flows/month",
                "All 15+ node types",
                "JSON export",
                "Priority support",
                "Flow templates",
                "Monthly reset",
            ],
            badge: "badge-pro",
            cta: "Upgrade to Pro",
            planId: "pro",
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "$29",
            period: "/month",
            features: [
                "Unlimited flows",
                "All 15+ node types",
                "JSON export",
                "Dedicated support",
                "Custom templates",
                "API access",
                "Team collaboration",
            ],
            badge: "badge-enterprise",
            cta: "Go Enterprise",
            planId: "enterprise",
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        marginBottom: 8,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Upgrade <span className="gradient-text">Plan</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Unlock more flows and features with a premium plan.
                </p>
            </div>

            {error && (
                <div
                    style={{
                        padding: "14px 18px",
                        borderRadius: 12,
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444",
                        fontSize: "0.9rem",
                        marginBottom: 24,
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 24,
                }}
            >
                {plans.map((plan) => {
                    const isCurrent = usage?.plan === plan.planId;
                    return (
                        <div
                            key={plan.planId}
                            className="glass-card"
                            style={{
                                padding: 32,
                                position: "relative",
                                border: plan.highlighted
                                    ? "1px solid rgba(99,102,241,0.5)"
                                    : isCurrent
                                        ? "1px solid rgba(34,197,94,0.5)"
                                        : undefined,
                                boxShadow: plan.highlighted
                                    ? "var(--glow-primary)"
                                    : undefined,
                            }}
                        >
                            {plan.highlighted && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -12,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        background: "var(--accent-gradient)",
                                        padding: "4px 16px",
                                        borderRadius: 20,
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        color: "white",
                                    }}
                                >
                                    MOST POPULAR
                                </div>
                            )}
                            {isCurrent && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -12,
                                        right: 20,
                                        background: "rgba(34,197,94,0.2)",
                                        padding: "4px 12px",
                                        borderRadius: 20,
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: "var(--success)",
                                        border: "1px solid rgba(34,197,94,0.3)",
                                    }}
                                >
                                    CURRENT
                                </div>
                            )}

                            <span className={`badge ${plan.badge}`}>{plan.name}</span>
                            <div
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: 800,
                                    margin: "20px 0 4px",
                                }}
                            >
                                {plan.price}
                                <span
                                    style={{
                                        fontSize: "1rem",
                                        color: "var(--text-muted)",
                                        fontWeight: 400,
                                    }}
                                >
                                    {plan.period}
                                </span>
                            </div>

                            <ul
                                style={{
                                    listStyle: "none",
                                    margin: "24px 0",
                                }}
                            >
                                {plan.features.map((f, j) => (
                                    <li
                                        key={j}
                                        style={{
                                            padding: "8px 0",
                                            color: "var(--text-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        <FiCheckCircle size={16} color="#6366f1" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button
                                    className="btn-secondary"
                                    disabled
                                    style={{ width: "100%", opacity: 0.6 }}
                                >
                                    <FiCheckCircle size={16} /> Current Plan
                                </button>
                            ) : plan.planId === "free" ? null : (
                                <button
                                    className={
                                        plan.highlighted ? "btn-primary" : "btn-secondary"
                                    }
                                    onClick={() => handleUpgrade(plan.planId)}
                                    disabled={loading === plan.planId}
                                    style={{ width: "100%" }}
                                >
                                    {loading === plan.planId ? (
                                        <div className="spinner" />
                                    ) : (
                                        <>
                                            <FiCreditCard size={16} />
                                            {plan.cta}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
