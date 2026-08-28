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
      const serverError = err.response?.data?.error || err.message || "Failed to log in. Please check your credentials.";
      return { success: false, error: serverError };
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
      const serverError = err.response?.data?.error || err.message || "Failed to register. Please try again.";
      return { success: false, error: serverError };
    }
  };

  /**
   * Google Sign In / Sign Up
   */
  const googleSignIn = async (googleProfile = {}) => {
    if (!googleProfile.email && !googleProfile.credential && !googleProfile.idToken && !googleProfile.accessToken) {
      return { success: false, error: "Google authentication credentials are required." };
    }

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
      return { success: false, error: response.data?.error || "Google authentication failed" };
    } catch (err) {
      const serverError = err.response?.data?.error || err.message || "Google authentication failed.";
      return { success: false, error: serverError };
    }
  };

  const [showProfileModal, setShowProfileModal] = useState(false);

  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  /**
   * Update current user profile
   */
  const updateUserProfile = async (profileData) => {
    try {
      const response = await authApi.updateProfile({
        currentEmail: user?.email,
        ...profileData,
      });

      if (response.data?.ok && response.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        return { success: true, user: updatedUser, message: response.data.message || "Profile updated successfully!" };
      }
      return { success: false, error: response.data?.error || "Failed to update profile." };
    } catch (err) {
      const serverError = err.response?.data?.error || err.message || "Failed to update profile.";
      return { success: false, error: serverError };
    }
  };

  /**
   * Logout (Revert to Guest Mode)
   */
  const logout = () => {
    setUser(null);
    setShowProfileModal(false);
    localStorage.removeItem("codehexa_user");
    localStorage.removeItem("codehexa_token");
  };

  const value = {
    user,
    isGuest: !user,
    showAuthModal,
    showProfileModal,
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
    openProfileModal,
    closeProfileModal,
    updateUserProfile,
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
