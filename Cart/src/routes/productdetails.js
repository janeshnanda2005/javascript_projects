import express from 'express'
const router = express.Router()

// Sample products data (in a real app, this would come from a database)
const products = [
    { id: 1, name: 'Laptop', price: 999.99, description: 'High-performance laptop for work and gaming', category: 'Electronics' },
    { id: 2, name: 'Headphones', price: 199.99, description: 'Noise-cancelling wireless headphones', category: 'Electronics' },
    { id: 3, name: 'Keyboard', price: 149.99, description: 'Mechanical keyboard with RGB lighting', category: 'Electronics' },
    { id: 4, name: 'Mouse', price: 79.99, description: 'Ergonomic wireless mouse', category: 'Electronics' },
    { id: 5, name: 'Monitor', price: 399.99, description: '27-inch 4K monitor', category: 'Electronics' },
    { id: 6, name: 'Webcam', price: 89.99, description: 'HD webcam for video calls', category: 'Electronics' }
];

// Get all products
router.get('/', (req, res) => {
    res.json(products)
})

// Get product by ID
router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id)
    const product = products.find(p => p.id === productId)

    if (!product) {
        return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
})

export default router 