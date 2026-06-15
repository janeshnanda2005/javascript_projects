import express from 'express'
import bcrypt from 'bcryptjs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import dashboard from './routes/dashboard.js'
import authRoute from './routes/authroute.js'
import productRoute from './routes/productdetails.js'
import db from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, "../public")))
app.use(express.json())

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, "../public/index.html"))
})


app.use('/auth', authRoute)
app.use('/dashboard', dashboard)
app.use('/products', productRoute)

app.listen(PORT, () => {
    return console.log("Server is running on port " + PORT + " http://localhost:" + PORT)
})