/**
 * Authentication hook + context provider.
 * Wraps Firebase Auth and exposes user state + auth methods.
 * Includes isAdmin derived from /api/me backend call.
 */
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { api } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isAdminLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);

    useEffect(() => {
        // Guard: skip if Firebase auth is not initialized (SSR or missing config)
        if (!auth) {
            setLoading(false);
            setIsAdminLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Fetch role from backend
                try {
                    const token = await firebaseUser.getIdToken();
                    const profile = await api.get("/me", token);
                    setIsAdmin(profile?.is_admin === true);
                } catch {
                    setIsAdmin(false);
                } finally {
                    setIsAdminLoading(false);
                }
            } else {
                setIsAdmin(false);
                setIsAdminLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase not initialized");
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase not initialized");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        await api.post("/register", {}, token);
    };

    const loginWithGoogle = async () => {
        if (!auth || !googleProvider) throw new Error("Firebase not initialized");
        const cred = await signInWithPopup(auth, googleProvider);
        const token = await cred.user.getIdToken();
        await api.post("/register", {}, token);
    };

    const logout = async () => {
        if (!auth) return;
        setIsAdmin(false);
        await signOut(auth);
    };

    const getToken = async (): Promise<string | null> => {
        if (!user) return null;
        return user.getIdToken();
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, isAdmin, isAdminLoading, login, signup, loginWithGoogle, logout, getToken }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
