import express from 'express';
import path,{ dirname } from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRouter from './routes/Authroute.js';
import todoRouter from './routes/todoroute.js';
import authMiddleware from './middleware/Authmiddleware.js';

dotenv.config();

const app =  express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname,'../public')));
app.use(express.json());

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/index.html'));
})

app.use('/auth',authRouter)
app.use('/todos',authMiddleware,todoRouter)

console.log("Hello world");
app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}  http://localhost:${PORT}`);
})
