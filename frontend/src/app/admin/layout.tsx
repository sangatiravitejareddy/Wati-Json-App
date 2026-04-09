"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    FiZap,
    FiBarChart2,
    FiUsers,
    FiList,
    FiCreditCard,
    FiLogOut,
    FiArrowLeft,
} from "react-icons/fi";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin, isAdminLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Redirect to dashboard if authenticated but not admin
    useEffect(() => {
        if (!loading && !isAdminLoading && user && !isAdmin) {
            router.push("/dashboard");
        }
    }, [user, loading, isAdmin, isAdminLoading, router]);

    if (loading || isAdminLoading) {
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

    if (!user || !isAdmin) return null;

    const navItems = [
        {
            href: "/admin",
            icon: <FiBarChart2 size={20} />,
            label: "Analytics",
        },
        {
            href: "/admin/users",
            icon: <FiUsers size={20} />,
            label: "Users",
        },
        {
            href: "/admin/flows",
            icon: <FiList size={20} />,
            label: "Flows",
        },
        {
            href: "/admin/payments",
            icon: <FiCreditCard size={20} />,
            label: "Payments",
        },
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 24px",
                        marginBottom: 12,
                    }}
                >
                    <FiZap size={24} color="#6366f1" />
                    <span style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                        WATI <span className="gradient-text">Admin</span>
                    </span>
                </div>

                <Link
                    href="/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 24px",
                        marginBottom: 20,
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                    }}
                >
                    <FiArrowLeft size={14} />
                    Back to Dashboard
                </Link>

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
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

                <div
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid var(--border-primary)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Admin
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: 12,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {user.email}
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
                        }}
                    >
                        <FiLogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>

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
