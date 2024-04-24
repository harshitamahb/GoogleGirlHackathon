import express from 'express';
import mongoose from 'mongoose';
import {config} from 'dotenv';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import doctorRouter from './routes/doctor.js';
import { checkRole, userAuth } from './middlewares/authMiddlewares.js';
import swagger from 'swagger-ui-express'; 
import data from './docs/swagger_output.json' assert { type: "json" };
import {connectDB} from './utils/connection.js';
import { rateLimiterMiddleware } from './middlewares/rateLimiter.js';
const app=express();

config({path:'./config.env'});

await connectDB();


if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
    app.use(morgan('dev'));
}


app.use(express.json());
app.use("/api-docs", swagger.serve, swagger.setup(data));
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/users",userAuth,rateLimiterMiddleware,userRouter); //No check here because doctor should be able to view user data.
app.use("/api/v1/doctors",userAuth,checkRole("doctor"),rateLimiterMiddleware,doctorRouter);

app.get('/',(req,res)=>{
    res.status(200).send('AetherWell api running');
});


const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});