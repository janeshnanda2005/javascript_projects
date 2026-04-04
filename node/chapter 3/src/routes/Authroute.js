import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router()

router.post('/register',async (req,res)=>{
    const {username,password} = req.body;
    console.log(username,password);
    res.sendStatus(200);
})

router.post('/login',async (req,res)=>{})

export default router;