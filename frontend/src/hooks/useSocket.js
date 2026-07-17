import { useSocketInstance } from "../store/SocketContext";

/**
 * Returns the shared Socket.IO instance.
 * The socket is managed by SocketProvider in AuthContext —
 * connected when the user is logged in, disconnected on logout.
 */
export function useSocket() {
  return useSocketInstance();
}
