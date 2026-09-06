import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3003;

const httpServer = createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, port: PORT, connections: io.engine.clientsCount }));
    return;
  }

  // Broadcast endpoint — chamado pelas API routes do Next.js
  if (req.url === "/broadcast" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { event, room, data } = JSON.parse(body);
        if (room) {
          io.to(room).emit(event, data);
        } else {
          io.emit(event, data);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, emitted: event, room: room || "*" }));
      } catch (e: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`[realtime] client connected: ${socket.id}`);

  // Join rooms
  socket.on("join", (rooms: string | string[]) => {
    const list = Array.isArray(rooms) ? rooms : [rooms];
    list.forEach((r) => {
      socket.join(r);
      console.log(`[realtime] ${socket.id} joined ${r}`);
    });
  });

  socket.on("leave", (room: string) => {
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log(`[realtime] client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[brito-realtime] Socket.IO server running on port ${PORT}`);
});
