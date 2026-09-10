import { useEffect } from "react";
import { io } from "socket.io-client";

export function useSocket(onTaskEvent) {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

    socket.on("taskCreated", onTaskEvent);
    socket.on("taskUpdated", onTaskEvent);
    socket.on("taskDeleted", onTaskEvent);

    return () => socket.disconnect();
  }, [onTaskEvent]);
}