import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { encryptMessage, decryptMessage } from "./services/encryptionService.js";
import  Message  from "./models/Message.js";
import  Conversation  from "./models/Conversation.js";

dotenv.config();

const socketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinConversation", async (conversationId) => {
      socket.join(conversationId);
      console.log(`Client ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("sendMessage", async ({ conversationId, message, senderId }) => {
      const encryptedMessage = encryptMessage(message);
      const newMessage = new Message({
        content: encryptedMessage,
        sender: senderId,
        conversation: conversationId,
      });

      await newMessage.save();

      io.to(conversationId).emit("messageReceived", {
        ...newMessage._doc,
        content: decryptMessage(encryptedMessage),
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return server;
};

export default socketServer;