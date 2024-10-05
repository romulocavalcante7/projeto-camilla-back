import { Server } from "http";
import app from "./app";
import prisma from "./client";
import config from "./config/config";
import logger from "./config/logger";
import { Server as SocketIOServer } from "socket.io";

let server: Server;
let activeUsers = 0;

prisma.$connect().then(() => {
  logger.info("Connected to SQL Database");

  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    activeUsers++;
    io.emit("activeUsers", activeUsers);
    logger.info(`User connected: ${socket.id}. Active users: ${activeUsers}`);

    socket.on("disconnect", () => {
      activeUsers--;
      io.emit("activeUsers", activeUsers);
      logger.info(`User disconnected: ${socket.id}. Active users: ${activeUsers}`);
    });
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
