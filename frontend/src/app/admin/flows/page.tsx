"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FiDownload, FiEye, FiX } from "react-icons/fi";

export default function AdminFlowsPage() {
    const { getToken } = useAuth();
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFlow, setSelectedFlow] = useState<any>(null);

    useEffect(() => {
        loadFlows();
    }, []);

    const loadFlows = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/admin/flows", token);
            setFlows(data.flows || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (flow: any) => {
        const blob = new Blob([JSON.stringify(flow.json, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wati-flow-${flow.flowId}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
                    All <span className="gradient-text">Flows</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    {flows.length} flows generated across all users
                </p>
            </div>

            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Prompt</th>
                            <th>User</th>
                            <th>Nodes</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flows.map((flow) => (
                            <tr key={flow.flowId}>
                                <td
                                    style={{
                                        maxWidth: 300,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {flow.prompt}
                                </td>
                                <td style={{ fontSize: "0.85rem" }}>{flow.userId}</td>
                                <td>{flow.json?.flowNodes?.length || 0}</td>
                                <td>
                                    {flow.createdAt
                                        ? new Date(flow.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "—"}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => setSelectedFlow(flow)}
                                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                        >
                                            <FiEye size={14} />
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handleDownload(flow)}
                                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                        >
                                            <FiDownload size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {flows.length === 0 && (
                    <div
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        No flows generated yet
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedFlow && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: 20,
                    }}
                    onClick={() => setSelectedFlow(null)}
                >
                    <div
                        className="glass-card"
                        style={{
                            width: "100%",
                            maxWidth: 700,
                            maxHeight: "80vh",
                            display: "flex",
                            flexDirection: "column",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "20px 24px",
                                borderBottom: "1px solid var(--border-primary)",
                            }}
                        >
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                                Flow Preview
                            </h3>
                            <button
                                onClick={() => setSelectedFlow(null)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
                            <div
                                style={{
                                    fontSize: "0.85rem",
                                    color: "var(--text-secondary)",
                                    marginBottom: 8,
                                }}
                            >
                                <strong>User:</strong> {selectedFlow.userId}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.85rem",
                                    color: "var(--text-secondary)",
                                    marginBottom: 16,
                                }}
                            >
                                <strong>Prompt:</strong> {selectedFlow.prompt}
                            </div>
                            <pre
                                style={{
                                    background: "var(--bg-primary)",
                                    border: "1px solid var(--border-primary)",
                                    borderRadius: 12,
                                    padding: 20,
                                    overflow: "auto",
                                    fontSize: "0.82rem",
                                    lineHeight: 1.5,
                                    color: "#818cf8",
                                }}
                            >
                                {JSON.stringify(selectedFlow.json, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
