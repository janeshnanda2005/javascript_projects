import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import db from '../db.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    const {user, password } = req.body

    if (!user || !password) {
        return res.status(400).json({ message: "Username and password are required" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        const result = insertUser.run(user, hashedPassword)
        const userId = result.lastInsertRowid

        const token = jwt.sign({ id: userId, username: user }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ message: "Username already exists" })
        } else {
            res.sendStatus(503)
        }
    }
})

router.post('/login', async (req, res) => {
    const { user, password } = req.body

    if (!user || !password) {
        return res.status(400).json({ message: "Username and password are required" })
    }

    try {
        const getUser = db.prepare('SELECT * FROM users WHERE username = ?')
        const userData = getUser.get(user)

        if (!userData) {
            return res.status(404).json({ message: "User not found" })
        }

        const isValid = await bcrypt.compare(password, userData.password)
        if (!isValid) {
            return res.status(401).json({ message: "Invalid password" })
        }

        const token = jwt.sign({ id: userData.id, username: userData.username }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router
