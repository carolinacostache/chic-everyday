import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import pinRouter from "./routes/pin.route.js";
import commentRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import adminRouter from "./routes/admin.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import connectDB from "./utils/connectDB.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

dotenv.config();


const app = express();

const allowedOrigins =[
  process.env.CLIENT_URL,
  "http://192.168.0.136:5173"
]

app.use(express.json());
app.use(cors({ origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },credentials: true }));
app.use(cookieParser());
app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024}}
));

app.use("/users", userRouter);
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/admin", adminRouter);
app.use("/notifications", notificationRouter);

app.use((error, req, res, next) => {
  res.status(error.status || 500);

  res.json({
    message: error.message || "Something went wrong!",
    status: error.status,
    stack: error.stack,
  });
});



app.listen(3000, '0.0.0.0', () => {
  connectDB();
  console.log("Server is running!");
});