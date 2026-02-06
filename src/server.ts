import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("[Socket] Client connected:", socket.id);

        socket.on("join-battle", (battleId) => {
            socket.join(`battle:${battleId}`);
            console.log(`[Socket] User ${socket.id} joined battle room: ${battleId}`);
        });

        socket.on("leave-battle", (battleId) => {
            socket.leave(`battle:${battleId}`);
            console.log(`[Socket] User ${socket.id} left battle room: ${battleId}`);
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Client disconnected:", socket.id);
        });
    });

    // Attach io to global so we can use it in server actions if needed
    // (Note: In production this might not work as expected with multiple workers, 
    // but for this SQLite-based app it should be fine)
    (global as any).io = io;

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
