import express from "express";
import authRouter from "./Modules/Auth/auth.controller.js";
import { DB_Connection } from "./DB/connection.js";
import { globalErrorHandler } from "./Common/Response.js";
import userRouter from "./Modules/user/user.controller.js";
import cors from "cors";
import path from "path";
import { redisConnection } from "./DB/redis.connection.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

async function bootstrap() {
  const app = express();
  const port = 3000;
  await DB_Connection();
  await redisConnection();
  app.use(express.json());
  app.use(cors());
  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      limit: 10, // limit each IP to 10 requests per windowMs
      legacyHeaders: false, 
      message: {
        message: "Too many requests, please try again later.",
      },
      requestPropertyName: "rateLimit", // Store rate limit info in req.rateLimit
      keyGenerator: (req) => {
        return `${req.ip}-${req.path}`; // Use IP (server ip for testing) and path as the key for rate limiting
      }
    }),
  );

  // for testing purpose
  // app.use((req, res, next) => {
  //   console.log(req.rateLimit);
  //   next();
  // });

  app.use(helmet());
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
  });
}
export default bootstrap;
