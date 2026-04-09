"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
    FiSend,
    FiCpu,
    FiDownload,
    FiCopy,
    FiCheck,
    FiAlertCircle,
    FiZap,
} from "react-icons/fi";

export default function DashboardPage() {
    const { user, getToken } = useAuth();
    const [prompt, setPrompt] = useState("");
    const [generatedFlow, setGeneratedFlow] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [usage, setUsage] = useState<any>(null);

    useEffect(() => {
        loadUsage();
    }, []);

    const loadUsage = async () => {
        try {
            const token = await getToken();
            const data = await api.get("/user-usage", token);
            setUsage(data);
        } catch (err) {
            console.error("Failed to load usage:", err);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setError("");
        setLoading(true);
        setGeneratedFlow(null);

        try {
            const token = await getToken();
            const result = await api.post("/generate-flow", { prompt }, token);
            setGeneratedFlow(result);
            await loadUsage(); // Refresh usage after generation
        } catch (err: any) {
            setError(err.message || "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedFlow) return;
        // Use json_data if present, otherwise fall back to the response itself
        const flowData = generatedFlow.json_data || generatedFlow;
        const blob = new Blob(
            [JSON.stringify(flowData, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wati-flow-${generatedFlow.flow_id || "export"}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!generatedFlow) return;
        const flowData = generatedFlow.json_data || generatedFlow;
        navigator.clipboard.writeText(
            JSON.stringify(flowData, null, 2)
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const usagePercent = usage
        ? usage.is_unlimited
            ? 0
            : (usage.flows_generated / usage.monthly_limit) * 100
        : 0;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        marginBottom: 8,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Generate <span className="gradient-text">Flow</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Describe your WhatsApp automation and AI will create the WATI flow.
                </p>
            </div>

            {/* Logged-in user context */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(99,102,241,0.07)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    marginBottom: 20,
                    flexWrap: "wrap",
                    gap: 8,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {user?.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Generating as <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
                    </span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#22c55e" }}>
                    🔒 Flows saved to your account only
                </span>
            </div>


            {/* Usage Meter */}
            {usage && (
                <div
                    className="glass-card"
                    style={{
                        padding: "20px 24px",
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <FiZap size={20} color="#6366f1" />
                        <div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                Plan:{" "}
                                <span
                                    className={`badge badge-${usage.plan}`}
                                    style={{ marginLeft: 4 }}
                                >
                                    {usage.plan}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                                {usage.is_unlimited
                                    ? "Unlimited flows"
                                    : `${usage.flows_generated} / ${usage.monthly_limit} flows used`}
                            </div>
                        </div>
                    </div>
                    {!usage.is_unlimited && (
                        <div
                            style={{
                                width: 200,
                                height: 6,
                                borderRadius: 3,
                                background: "var(--bg-input)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${Math.min(usagePercent, 100)}%`,
                                    borderRadius: 3,
                                    background:
                                        usagePercent >= 90
                                            ? "var(--danger)"
                                            : usagePercent >= 70
                                                ? "var(--warning)"
                                                : "var(--accent-primary)",
                                    transition: "width 0.5s ease",
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Prompt Input */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: 12,
                        color: "var(--text-primary)",
                    }}
                >
                    <FiCpu
                        size={16}
                        style={{ marginRight: 8, verticalAlign: "middle" }}
                    />
                    Describe your automation
                </label>
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a customer support bot that greets the user, asks for their issue category using interactive buttons (Billing, Technical, General), then routes to the appropriate team..."
                    style={{
                        width: "100%",
                        minHeight: 140,
                        padding: 16,
                        borderRadius: 12,
                        border: "1px solid var(--border-primary)",
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        fontSize: "0.95rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s",
                        lineHeight: 1.6,
                    }}
                    onFocus={(e) =>
                        (e.target.style.borderColor = "var(--accent-primary)")
                    }
                    onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border-primary)")
                    }
                />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 16,
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        {prompt.length} / 2000 characters
                    </span>
                    <button
                        id="generate-button"
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FiSend size={16} />
                                Generate Flow
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "14px 18px",
                        borderRadius: 12,
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444",
                        fontSize: "0.9rem",
                        marginBottom: 24,
                    }}
                >
                    <FiAlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Generated Flow Preview */}
            {generatedFlow && (
                <div
                    className="glass-card animate-fade-in-up"
                    style={{ padding: 28 }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.2rem",
                                fontWeight: 700,
                            }}
                        >
                            ✅ Generated Flow
                        </h2>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                className="btn-secondary"
                                onClick={handleCopy}
                                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                            >
                                {copied ? (
                                    <>
                                        <FiCheck size={14} /> Copied
                                    </>
                                ) : (
                                    <>
                                        <FiCopy size={14} /> Copy
                                    </>
                                )}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleDownload}
                                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                            >
                                <FiDownload size={14} /> Download JSON
                            </button>
                        </div>
                    </div>

                    {/* Flow Stats */}
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                background: "rgba(99,102,241,0.1)",
                                fontSize: "0.85rem",
                                color: "#818cf8",
                            }}
                        >
                            {(generatedFlow.json_data || generatedFlow).flowNodes?.length || 0} Nodes
                        </div>
                        <div
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                background: "rgba(139,92,246,0.1)",
                                fontSize: "0.85rem",
                                color: "#a78bfa",
                            }}
                        >
                            {(generatedFlow.json_data || generatedFlow).flowEdges?.length || 0} Edges
                        </div>
                    </div>

                    {/* JSON Preview */}
                    <pre
                        style={{
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-primary)",
                            borderRadius: 12,
                            padding: 20,
                            overflow: "auto",
                            maxHeight: 500,
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            color: "#818cf8",
                        }}
                    >
                        {JSON.stringify(generatedFlow.json_data || generatedFlow, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
