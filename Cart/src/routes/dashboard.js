import express from 'express'
import db from '../db.js'
import authMiddleware from '../middleware/Authmiddleware.js'

const router = express.Router()

// Get user's cart items
router.get('/cart', authMiddleware, (req, res) => {
    try {
        const getCartItems = db.prepare('SELECT * FROM cart WHERE userid = ?')
        const cartItems = getCartItems.all(req.userId)
        res.json(cartItems)
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// Add item to cart
router.post('/cart', authMiddleware, (req, res) => {
    try {
        const { product, quantity } = req.body

        if (!product || quantity < 1) {
            return res.status(400).json({ message: 'Product and valid quantity required' })
        }

        const insertOrUpdateCart = db.prepare(`
            INSERT INTO cart (userid, Product, nos)
            VALUES (?, ?, ?)
            ON CONFLICT(userid, Product) DO UPDATE SET
            nos = nos + excluded.nos
        `)

        const result = insertOrUpdateCart.run(req.userId, product, quantity)
        res.json({ message: 'Item added to cart', changes: result.changes })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)  
    }
})

router.put('/cart/:id', authMiddleware, (req, res) => {
    try {
        const { quantity } = req.body
        const cartId = req.params.id

        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' })
        }

        const updateCart = db.prepare('UPDATE cart SET nos = ? WHERE id = ? AND userid = ?')
        const result = updateCart.run(quantity, cartId, req.userId)

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Cart item not found' })
        }

        res.json({ message: 'Cart updated', changes: result.changes })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// Remove item from cart
router.delete('/cart/:id', authMiddleware, (req, res) => {
    try {
        const cartId = req.params.id
        const deleteCartItem = db.prepare('DELETE FROM cart WHERE id = ? AND userid = ?')
        const result = deleteCartItem.run(cartId, req.userId)

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Cart item not found' })
        }

        res.json({ message: 'Item removed from cart', changes: result.changes })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
    try {
        const getProfile = db.prepare('SELECT id, username FROM users WHERE id = ?')
        const profile = getProfile.get(req.userId)

        if (!profile) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router