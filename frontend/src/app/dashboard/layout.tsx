"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    FiZap,
    FiHome,
    FiCpu,
    FiList,
    FiCreditCard,
    FiLogOut,
    FiSettings,
} from "react-icons/fi";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { href: "/dashboard", icon: <FiHome size={20} />, label: "Dashboard" },
        { href: "/dashboard/flows", icon: <FiList size={20} />, label: "My Flows" },
        {
            href: "/dashboard/pricing",
            icon: <FiCreditCard size={20} />,
            label: "Upgrade",
        },
        // Only show Admin Panel link to admins
        ...(isAdmin
            ? [
                  {
                      href: "/admin",
                      icon: <FiSettings size={20} />,
                      label: "Admin Panel",
                  },
              ]
            : []),
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: 260,
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-primary)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 0",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    zIndex: 50,
                }}
            >
                {/* Logo */}
                <Link
                    href="/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 24px",
                        marginBottom: 36,
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <FiZap size={24} color="#6366f1" />
                    <span style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                        WATI <span className="gradient-text">Flow Builder</span>
                    </span>
                </Link>

                {/* Nav items */}
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 24px",
                                    color: isActive ? "#818cf8" : "var(--text-secondary)",
                                    textDecoration: "none",
                                    fontSize: "0.95rem",
                                    fontWeight: isActive ? 600 : 400,
                                    background: isActive
                                        ? "rgba(99,102,241,0.1)"
                                        : "transparent",
                                    borderRight: isActive
                                        ? "3px solid #6366f1"
                                        : "3px solid transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Identity Card + Logout */}
                <div
                    style={{
                        padding: "16px 16px 16px",
                        borderTop: "1px solid var(--border-primary)",
                    }}
                >
                    {/* Avatar + account info */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "rgba(99,102,241,0.08)",
                            marginBottom: 10,
                        }}
                    >
                        {/* Avatar initials */}
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                            }}
                        >
                            {user.email?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginBottom: 2,
                                }}
                            >
                                Signed in as
                            </div>
                            <div
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.email}
                            </div>
                        </div>
                    </div>

                    {/* Your data only badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.75rem",
                            color: "#22c55e",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            borderRadius: 6,
                            padding: "5px 10px",
                            marginBottom: 10,
                        }}
                    >
                        🔒 Showing only your data
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "color 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.color = "var(--danger)")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.color = "var(--text-secondary)")
                        }
                    >
                        <FiLogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>


            {/* Main content */}
            <main
                style={{
                    marginLeft: 260,
                    flex: 1,
                    padding: "32px 40px",
                    maxWidth: 1200,
                }}
            >
                {children}
            </main>
        </div>
    );
}
