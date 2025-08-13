// Use es6 import style `import module from "path";`
// Node.js require is old school and will throw errors

import 'dotenv/config';
import express from "express";
const  app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/dbConn";
connectDB();
import registerRoutes from "./Auth/routes/authRoutes";

app.use(express.json());
app.use(
	cors({
		origin: " http://localhost:3000",
		credentials: true,
	}),
);
app.use(cookieParser());

app.use("/api/auth", registerRoutes);

const PORT = process.env.PORT || 5000;

// Make a function
export const startServer = () =>{ 
	app.listen(	PORT, () => {
	console.log(`server is running on ${PORT}`);

})
};
