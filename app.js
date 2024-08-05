import express from "express";
import path from 'path';
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import expressSession from 'express-session';

dotenv.config({
    path: './.env'
});

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'mysecrectagain'
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(flash());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes import
import userRouter from './routes/user.routes.js';
import indexRouter from './routes/index.routes.js';
import adminRouter from './routes/admin.routes.js';

// Routes declaration
app.use("/", userRouter);
app.use("/", indexRouter);
app.use("/admin", adminRouter);

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app };
