import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aura_user")); } catch { return null; }
  });
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your booking at Luminary Studio is confirmed!", time: "2m ago", read: false, type: "booking" },
    { id: 2, text: "New review received — 5 stars ✨", time: "1h ago", read: false, type: "review" },
    { id: 3, text: "Priya accepted your booking request", time: "3h ago", read: true, type: "booking" },
  ]);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aura_favorites")) || []; } catch { return []; }
  });

  function login(userData, token) {
    localStorage.setItem("aura_token", token);
    localStorage.setItem("aura_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("aura_token");
    localStorage.removeItem("aura_user");
    setUser(null);
  }

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: Date.now(), read: false, time: "just now", ...notif }, ...prev]);
  }, []);

  const toggleFavorite = useCallback((salonId) => {
    setFavorites(prev => {
      const updated = prev.includes(salonId)
        ? prev.filter(id => id !== salonId)
        : [...prev, salonId];
      localStorage.setItem("aura_favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((salonId) => favorites.includes(salonId), [favorites]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      notifications, unreadCount, markNotificationRead, markAllRead, addNotification,
      favorites, toggleFavorite, isFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
