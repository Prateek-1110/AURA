import { useAuth } from "../api/AuthContext";

const typeIcon = {
  booking: "📅",
  review: "⭐",
  message: "💬",
  system: "🔔",
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useAuth();

  return (
    <div className="fixed top-16 right-4 z-50 w-80 bg-white rounded-2xl shadow-card-hover border border-gray-100 animate-scale-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-charcoal">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-burgundy text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-burgundy hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-cream transition border-b border-gray-50 last:border-0 ${
                !n.read ? "bg-burgundy/3" : ""
              }`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? "text-charcoal font-medium" : "text-gray-600"}`}>
                  {n.text}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-burgundy rounded-full flex-shrink-0 mt-1.5" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
