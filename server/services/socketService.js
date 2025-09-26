import { Server } from "socket.io";
import Message from "../models/Message.js";
import { encryptMessage, decryptMessage } from "../services/encryptionService.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendMessage", async ({ content, senderId, conversationId }) => {
      const encryptedContent = encryptMessage(content);
      const message = new Message({
        content: encryptedContent,
        sender: senderId,
        conversation: conversationId,
      });

      await message.save();

      const decryptedMessage = {
        ...message._doc,
        content: decryptMessage(encryptedContent),
      };

      io.to(conversationId).emit("messageReceived", decryptedMessage);
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Client ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return io;
};