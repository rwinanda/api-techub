import http from "http";
import app from "./app.js"; // ✅ must include .js extension in ESM

const port = 8000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
