"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
    FiDownload,
    FiTrash2,
    FiEye,
    FiX,
    FiCopy,
    FiCheck,
    FiList,
} from "react-icons/fi";

interface Flow {
    flow_id: string;
    prompt: string;
    json_data: any;
    created_at: string;
}

export default function FlowsPage() {
    const { getToken, user } = useAuth();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadFlows();
    }, []);

    const loadFlows = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/flows", token);
            setFlows(data.flows || []);
        } catch (err) {
            console.error("Failed to load flows:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (flowId: string) => {
        if (!confirm("Are you sure you want to delete this flow?")) return;
        setDeleting(flowId);
        try {
            const token = await getToken();
            await api.del(`/flow/${flowId}`, token);
            setFlows(flows.filter((f) => f.flow_id !== flowId));
            if (selectedFlow?.flow_id === flowId) setSelectedFlow(null);
        } catch (err) {
            console.error("Failed to delete flow:", err);
        } finally {
            setDeleting(null);
        }
    };

    const handleDownload = (flow: Flow) => {
        const blob = new Blob([JSON.stringify(flow.json_data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wati-flow-${flow.flow_id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!selectedFlow) return;
        navigator.clipboard.writeText(
            JSON.stringify(selectedFlow.json_data, null, 2)
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        marginBottom: 8,
                        letterSpacing: "-0.02em",
                    }}
                >
                    My <span className="gradient-text">Flows</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    View, preview, and download your generated WATI flows.
                </p>
            </div>

            {/* User identity + data scope notice */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(99,102,241,0.07)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    marginBottom: 24,
                    flexWrap: "wrap",
                    gap: 8,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {user?.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Showing flows for <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#22c55e" }}>
                    🔒 Your data only — other users cannot see these
                </div>
            </div>

            {flows.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: "60px 40px",
                        textAlign: "center",
                    }}
                >
                    <FiList
                        size={48}
                        style={{ color: "var(--text-muted)", marginBottom: 16 }}
                    />
                    <h3
                        style={{
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            marginBottom: 8,
                        }}
                    >
                        No flows yet
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Head to the dashboard and generate your first WATI flow!
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {flows.map((flow) => (
                        <div
                            key={flow.flow_id}
                            className="glass-card"
                            style={{
                                padding: "20px 24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 20,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        marginBottom: 6,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {flow.prompt}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        fontSize: "0.8rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    <span>
                                        {flow.json_data?.flowNodes?.length || 0} nodes
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {new Date(flow.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setSelectedFlow(flow)}
                                    style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                                >
                                    <FiEye size={14} />
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleDownload(flow)}
                                    style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                                >
                                    <FiDownload size={14} />
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleDelete(flow.flow_id)}
                                    disabled={deleting === flow.flow_id}
                                    style={{
                                        padding: "8px 12px",
                                        fontSize: "0.8rem",
                                        color: "var(--danger)",
                                        borderColor: "rgba(239,68,68,0.3)",
                                    }}
                                >
                                    {deleting === flow.flow_id ? (
                                        <div className="spinner" style={{ width: 14, height: 14 }} />
                                    ) : (
                                        <FiTrash2 size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="btn-secondary"
                                    onClick={handleCopy}
                                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                >
                                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleDownload(selectedFlow)}
                                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                >
                                    <FiDownload size={14} /> Download
                                </button>
                                <button
                                    onClick={() => setSelectedFlow(null)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--text-secondary)",
                                        cursor: "pointer",
                                        padding: 4,
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                padding: 24,
                                overflow: "auto",
                                flex: 1,
                            }}
                        >
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
                                {JSON.stringify(selectedFlow.json_data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
