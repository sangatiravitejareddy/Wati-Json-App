"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FiCreditCard } from "react-icons/fi";

export default function AdminPaymentsPage() {
    const { getToken } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/admin/payments", token);
            setPayments(data.payments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

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
                    Payment <span className="gradient-text">History</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    {payments.length} total payments
                </p>
            </div>

            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>User</th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p.paymentId}>
                                <td
                                    style={{
                                        fontFamily: "monospace",
                                        fontSize: "0.8rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {p.paymentId?.substring(0, 8)}...
                                </td>
                                <td style={{ fontSize: "0.85rem" }}>{p.userId}</td>
                                <td>
                                    <span
                                        className={`badge badge-${p.plan || "pro"}`}
                                        style={{ textTransform: "capitalize" }}
                                    >
                                        {p.plan}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                    ${p.amount?.toFixed(2) || "0.00"}
                                </td>
                                <td>
                                    <span
                                        className={`badge ${p.status === "completed"
                                                ? "badge-success"
                                                : p.status === "failed"
                                                    ? "badge-danger"
                                                    : "badge-warning"
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                                <td>
                                    {p.createdAt
                                        ? new Date(p.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && (
                    <div
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        <FiCreditCard
                            size={32}
                            style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }}
                        />
                        No payments recorded yet
                    </div>
                )}
            </div>
        </div>
    );
}
