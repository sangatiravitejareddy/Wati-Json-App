"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
    FiUsers,
    FiZap,
    FiCreditCard,
    FiTrendingUp,
    FiShield,
    FiBarChart2,
} from "react-icons/fi";

export default function AdminDashboardPage() {
    const { getToken } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/admin/analytics", token);
            setAnalytics(data);
        } catch (err) {
            console.error("Failed to load analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "100px 0",
                }}
            >
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    const stats = analytics
        ? [
            {
                label: "Total Users",
                value: analytics.total_users,
                icon: <FiUsers size={24} />,
                color: "#6366f1",
                bg: "rgba(99,102,241,0.15)",
            },
            {
                label: "Total Flows",
                value: analytics.total_flows,
                icon: <FiZap size={24} />,
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.15)",
            },
            {
                label: "Total Revenue",
                value: `$${analytics.total_revenue?.toFixed(2) || "0.00"}`,
                icon: <FiCreditCard size={24} />,
                color: "#22c55e",
                bg: "rgba(34,197,94,0.15)",
            },
            {
                label: "Payments",
                value: analytics.total_payments,
                icon: <FiTrendingUp size={24} />,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.15)",
            },
            {
                label: "Blocked Users",
                value: analytics.blocked_users,
                icon: <FiShield size={24} />,
                color: "#ef4444",
                bg: "rgba(239,68,68,0.15)",
            },
        ]
        : [];

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
                    Admin <span className="gradient-text">Analytics</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Platform-wide overview and statistics.
                </p>
            </div>

            {/* Stats grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 20,
                    marginBottom: 32,
                }}
            >
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: 24 }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: stat.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: stat.color,
                                marginBottom: 16,
                            }}
                        >
                            {stat.icon}
                        </div>
                        <div
                            style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: 4,
                            }}
                        >
                            {stat.label}
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan distribution */}
            {analytics?.plan_counts && (
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3
                        style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            marginBottom: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <FiBarChart2 size={18} />
                        Plan Distribution
                    </h3>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        {Object.entries(analytics.plan_counts).map(
                            ([plan, count]: [string, any]) => {
                                const total = analytics.total_users || 1;
                                const percent = ((count / total) * 100).toFixed(1);
                                return (
                                    <div key={plan} style={{ flex: 1, minWidth: 150 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <span
                                                className={`badge badge-${plan}`}
                                                style={{ textTransform: "capitalize" }}
                                            >
                                                {plan}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {count} ({percent}%)
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 8,
                                                borderRadius: 4,
                                                background: "var(--bg-input)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${percent}%`,
                                                    borderRadius: 4,
                                                    background:
                                                        plan === "enterprise"
                                                            ? "#a855f7"
                                                            : plan === "pro"
                                                                ? "#6366f1"
                                                                : "#6b6b99",
                                                    transition: "width 0.5s ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
