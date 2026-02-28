import express from 'express';
import authRouter from './Modules/Auth/auth.controller.js';
import { DB_Connection } from './DB/connection.js';
import { globalErrorHandler } from './Common/Response.js';
import userRouter from './Modules/user/user.controller.js';

function bootstrap() {
    const app = express();
    const port = 3000;
    DB_Connection()
    app.use(express.json());
    app.use("/auth" , authRouter);
    app.use("/user" , userRouter);





    app.use(globalErrorHandler);
    app.listen(port, () => {
        console.log(`server is running on port : ${port}`);
    })
}
export default bootstrap;