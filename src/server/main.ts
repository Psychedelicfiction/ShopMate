import express from "express";
import ViteExpress from "vite-express";
const app = express();


import { startServer } from "./server.js" ;

startServer();


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
