import { useCallback, useEffect, useState } from "react";
import { useSocketInstance } from "../store/SocketContext";
import { getNotifications, markAllRead, markOneRead } from "../services/notificationApi";

export function useNotifications() {
  const socket = useSocketInstance();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch on mount — one request, no polling
  const load = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.data ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silently ignore — bell shows stale state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time delivery via the shared socket — no second connection
  useEffect(() => {
    const handler = (notification) => {
      setNotifications((prev) => {
        // Deduplicate in case of reconnect replay
        if (prev.some((n) => String(n._id) === String(notification._id))) return prev;
        return [notification, ...prev].slice(0, 50);
      });
      setUnreadCount((c) => c + 1);
    };
    socket.on("new_notification", handler);
    return () => socket.off("new_notification", handler);
  }, [socket]);

  const markOne = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (String(n._id) === String(id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markOneRead(id);
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (String(n._id) === String(id) ? { ...n, isRead: false } : n))
      );
      setUnreadCount((c) => c + 1);
    }
  }, []);

  const markAll = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllRead();
    } catch {
      // Reload on failure to restore accurate state
      load();
    }
  }, [load]);

  return { notifications, unreadCount, loading, markOne, markAll };
}
