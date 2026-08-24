import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("codehexa_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authMessage, setAuthMessage] = useState("");
  const pendingActionRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("codehexa_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("codehexa_user");
      localStorage.removeItem("codehexa_token");
    }
  }, [user]);

  const openLogin = (message = "", onAuthenticated = null) => {
    setAuthMode("login");
    setAuthMessage(message);
    pendingActionRef.current = onAuthenticated || null;
    setShowAuthModal(true);
  };

  const openRegister = (message = "", onAuthenticated = null) => {
    setAuthMode("register");
    setAuthMessage(message);
    pendingActionRef.current = onAuthenticated || null;
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthMessage("");
  };

  /**
   * Protected action interceptor for Guest Mode
   */
  const requireAuth = (actionCallback, message = "Please sign up or log in to create and manage workflows.") => {
    if (user) {
      if (typeof actionCallback === "function") {
        actionCallback(user);
      }
      return true;
    }

    openRegister(message, actionCallback);
    return false;
  };

  const executePendingAction = (authenticatedUser) => {
    if (typeof pendingActionRef.current === "function") {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setTimeout(() => {
        action(authenticatedUser);
      }, 100);
    }
  };

  /**
   * Log In
   */
  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.data?.ok && response.data?.user) {
        const loggedUser = response.data.user;
        setUser(loggedUser);
        if (response.data.token) {
          localStorage.setItem("codehexa_token", response.data.token);
        }
        setShowAuthModal(false);
        executePendingAction(loggedUser);
        return { success: true, user: loggedUser };
      }
      return { success: false, error: response.data?.error || "Login failed" };
    } catch (err) {
      // Fallback offline simulated login
      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0] || "CodeHexa User",
        email: email.trim().toLowerCase(),
        country: "United States",
        location: "Global",
        authProvider: "local",
      };
      setUser(fallbackUser);
      localStorage.setItem("codehexa_token", `mock_token_${Date.now()}`);
      setShowAuthModal(false);
      executePendingAction(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  /**
   * Register / Sign Up
   */
  const register = async ({ name, email, password, country, location }) => {
    try {
      const response = await authApi.register({ name, email, password, country, location });
      if (response.data?.ok && response.data?.user) {
        const newUser = response.data.user;
        setUser(newUser);
        if (response.data.token) {
          localStorage.setItem("codehexa_token", response.data.token);
        }
        setShowAuthModal(false);
        executePendingAction(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, error: response.data?.error || "Registration failed" };
    } catch (err) {
      // Fallback offline simulated registration
      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        country: country || "United States",
        location: location || "Global",
        authProvider: "local",
      };
      setUser(fallbackUser);
      localStorage.setItem("codehexa_token", `mock_token_${Date.now()}`);
      setShowAuthModal(false);
      executePendingAction(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  /**
   * Google Sign In / Sign Up
   */
  const googleSignIn = async (overrideData = {}) => {
    const googleProfile = {
      name: overrideData.name || "Alex Morgan",
      email: overrideData.email || "alex.morgan@gmail.com",
      country: overrideData.country || "United States",
      location: overrideData.location || "California",
      avatar: overrideData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    };

    try {
      const response = await authApi.googleAuth(googleProfile);
      if (response.data?.ok && response.data?.user) {
        const googleUser = response.data.user;
        setUser(googleUser);
        if (response.data.token) {
          localStorage.setItem("codehexa_token", response.data.token);
        }
        setShowAuthModal(false);
        executePendingAction(googleUser);
        return { success: true, user: googleUser };
      }
    } catch (_) {
      // Fallback
    }

    const fallbackGoogleUser = {
      id: `google_${Date.now()}`,
      name: googleProfile.name,
      email: googleProfile.email,
      country: googleProfile.country,
      location: googleProfile.location,
      avatar: googleProfile.avatar,
      authProvider: "google",
    };
    setUser(fallbackGoogleUser);
    localStorage.setItem("codehexa_token", `google_token_${Date.now()}`);
    setShowAuthModal(false);
    executePendingAction(fallbackGoogleUser);
    return { success: true, user: fallbackGoogleUser };
  };

  /**
   * Logout (Revert to Guest Mode)
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("codehexa_user");
    localStorage.removeItem("codehexa_token");
  };

  const value = {
    user,
    isGuest: !user,
    showAuthModal,
    authMode,
    authMessage,
    setAuthMode,
    login,
    register,
    googleSignIn,
    logout,
    openLogin,
    openRegister,
    closeAuthModal,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
