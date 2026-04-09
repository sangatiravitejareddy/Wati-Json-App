"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
    FiUsers,
    FiShield,
    FiTrendingUp,
    FiTrendingDown,
    FiSlash,
    FiCheck,
    FiRefreshCw,
} from "react-icons/fi";

export default function AdminUsersPage() {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/admin/users", token);
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (userId: string, plan: string) => {
        setActionLoading(userId);
        try {
            const token = await getToken();
            await api.post("/admin/upgrade-user", { user_id: userId, plan }, token);
            await loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleBlock = async (userId: string, block: boolean) => {
        setActionLoading(userId);
        try {
            const token = await getToken();
            await api.post(
                "/admin/block-user",
                { user_id: userId, is_blocked: block },
                token
            );
            await loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetUsage = async (userId: string) => {
        setActionLoading(userId);
        try {
            const token = await getToken();
            await api.post(
                "/admin/reset-usage",
                { user_id: userId },
                token
            );
            await loadUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
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
                    User <span className="gradient-text">Management</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    {users.length} registered users
                </p>
            </div>

            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Flows</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.uid || u.userId}>
                                <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                                    {u.email}
                                </td>
                                <td>
                                    <span
                                        className={`badge badge-${u.plan || "free"}`}
                                        style={{ textTransform: "capitalize" }}
                                    >
                                        {u.plan || "free"}
                                    </span>
                                </td>
                                <td>{u.flows_generated || u.flowsGenerated || 0}</td>
                                <td>
                                    {u.is_blocked ? (
                                        <span className="badge badge-danger">Blocked</span>
                                    ) : (
                                        <span className="badge badge-success">Active</span>
                                    )}
                                </td>
                                <td>
                                    {u.createdAt
                                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {actionLoading === (u.uid || u.userId) ? (
                                            <div className="spinner" style={{ width: 18, height: 18 }} />
                                        ) : (
                                            <>
                                                <select
                                                    value={u.plan || "free"}
                                                    onChange={(e) =>
                                                        handleUpgrade(u.uid || u.userId, e.target.value)
                                                    }
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 8,
                                                        border: "1px solid var(--border-primary)",
                                                        background: "var(--bg-input)",
                                                        color: "var(--text-primary)",
                                                        fontSize: "0.8rem",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="pro">Pro</option>
                                                    <option value="enterprise">Enterprise</option>
                                                </select>
                                                <button
                                                    onClick={() =>
                                                        handleResetUsage(u.uid || u.userId)
                                                    }
                                                    title="Reset Usage"
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 8,
                                                        border: "1px solid rgba(245,158,11,0.3)",
                                                        background: "transparent",
                                                        color: "#f59e0b",
                                                        cursor: "pointer",
                                                        fontSize: "0.8rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}
                                                >
                                                    <FiRefreshCw size={12} /> Reset
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleBlock(u.uid || u.userId, !u.is_blocked)
                                                    }
                                                    title={u.is_blocked ? "Unblock" : "Block"}
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 8,
                                                        border: "1px solid",
                                                        borderColor: u.is_blocked
                                                            ? "rgba(34,197,94,0.3)"
                                                            : "rgba(239,68,68,0.3)",
                                                        background: "transparent",
                                                        color: u.is_blocked
                                                            ? "var(--success)"
                                                            : "var(--danger)",
                                                        cursor: "pointer",
                                                        fontSize: "0.8rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}
                                                >
                                                    {u.is_blocked ? (
                                                        <>
                                                            <FiCheck size={12} /> Unblock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiSlash size={12} /> Block
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
}
