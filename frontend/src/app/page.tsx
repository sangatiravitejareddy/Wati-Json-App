"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  FiZap,
  FiArrowRight,
  FiMessageSquare,
  FiDownload,
  FiShield,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiZap size={28} color="#6366f1" />
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            WATI <span className="gradient-text">Flow Builder</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <Link href="/dashboard">
              <button className="btn-primary">Dashboard</button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-secondary">Log in</button>
              </Link>
              <Link href="/signup">
                <button className="btn-primary">
                  Get Started <FiArrowRight size={16} />
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        className="animate-fade-in-up"
        style={{
          textAlign: "center",
          padding: "80px 20px 60px",
          maxWidth: 900,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Gradient blob */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 20,
            background: "rgba(99,102,241,0.15)",
            color: "#818cf8",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          ✨ AI-Powered WhatsApp Automation
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: "-0.03em",
          }}
        >
          Build WhatsApp Flows{" "}
          <span className="gradient-text">with AI</span>
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Describe your chatbot automation in plain English. Our AI generates
          production-ready WATI JSON flows you can import directly.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/signup">
            <button className="btn-primary" style={{ padding: "16px 36px", fontSize: "1.05rem" }}>
              Start Building Free <FiArrowRight size={18} />
            </button>
          </Link>
          <Link href="#features">
            <button className="btn-secondary" style={{ padding: "16px 36px", fontSize: "1.05rem" }}>
              See How It Works
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          maxWidth: 1200,
          margin: "40px auto 80px",
          padding: "0 40px",
        }}
      >
        {[
          {
            icon: <FiCpu size={28} />,
            title: "AI-Generated Flows",
            desc: "Describe your automation in natural language. AI creates complete WATI-compatible JSON with nodes and edges.",
          },
          {
            icon: <FiMessageSquare size={28} />,
            title: "15+ Node Types",
            desc: "Supports Message, Question, Condition, Interactive Buttons/Lists, Webhooks, and many more WATI node types.",
          },
          {
            icon: <FiDownload size={28} />,
            title: "One-Click Export",
            desc: "Download validated JSON files and import them directly into WATI Automation Builder — no manual editing.",
          },
          {
            icon: <FiShield size={28} />,
            title: "Validated Output",
            desc: "Every generated flow is validated against the WATI schema. Only valid, importable JSON is delivered.",
          },
          {
            icon: <FiZap size={28} />,
            title: "Instant Generation",
            desc: "Powered by fast local AI with cloud fallback. Get your automation flow in seconds, not hours.",
          },
          {
            icon: <FiCheckCircle size={28} />,
            title: "Production Ready",
            desc: "Generated flows are battle-tested and ready for production use in your WATI WhatsApp Business account.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="glass-card animate-fade-in-up"
            style={{
              padding: 32,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
                marginBottom: 20,
              }}
            >
              {f.icon}
            </div>
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                fontSize: "0.95rem",
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Pricing Preview */}
      <section
        style={{
          textAlign: "center",
          padding: "60px 20px 100px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 48,
            fontSize: "1.1rem",
          }}
        >
          Start free. Upgrade when you need more.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              features: ["3 flows total", "All node types", "JSON export", "Community support"],
              badge: "badge-free",
              cta: "Get Started",
            },
            {
              name: "Pro",
              price: "$5",
              period: "/month",
              features: [
                "20 flows/month",
                "All node types",
                "JSON export",
                "Priority support",
                "Flow templates",
              ],
              badge: "badge-pro",
              cta: "Upgrade to Pro",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              features: [
                "Unlimited flows",
                "All node types",
                "JSON export",
                "Dedicated support",
                "Custom templates",
                "API access",
              ],
              badge: "badge-enterprise",
              cta: "Contact Us",
            },
          ].map((plan, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 36,
                position: "relative",
                border: plan.highlighted
                  ? "1px solid rgba(99,102,241,0.5)"
                  : undefined,
                boxShadow: plan.highlighted ? "var(--glow-primary)" : undefined,
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
                  textAlign: "left",
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
              <Link href="/signup">
                <button
                  className={plan.highlighted ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%" }}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-primary)",
          padding: "32px 40px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        © 2026 AI WATI Flow Builder. All rights reserved.
      </footer>
    </div>
  );
}
