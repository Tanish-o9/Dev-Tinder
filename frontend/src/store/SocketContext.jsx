import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SocketContext = createContext(null);

/**
 * Provides a single Socket.IO connection for the entire authenticated session.
 * Mount this inside AuthProvider but only render children once the user is known.
 * Pass `active={!!user}` — the socket connects when true, disconnects when false.
 */
export function SocketProvider({ active, children }) {
  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (active) {
      if (!socket.connected) socket.connect();
    } else {
      socket.disconnect();
    }
  }, [active]);

  // Hard disconnect and recreate on unmount (page unload / full logout)
  useEffect(() => {
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketInstance() {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocketInstance must be used inside SocketProvider");
  return socket;
}
