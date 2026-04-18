import express from 'express'
import prisma from '../prismaclient.js'

const router = express.Router()

// Get all todos for logged-in user
router.get('/', async (req, res) => {
    try {
        console.log('Fetching todos for user:', req.userId)
        
        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: req.userId }
        })
        
        if (!userExists) {
            console.log('User does not exist:', req.userId)
            return res.status(401).json({ message: 'User not found - please login again' })
        }
        
        const todos = await prisma.Todo.findMany({
            where: { userId: req.userId }
        })
        console.log('Found todos:', todos)
        res.json(todos)
    } catch(err) {
        console.error('Error fetching todos:', err)
        res.status(500).json({ message: 'Error fetching todos', error: err.message })
    }
})

// Create a new todo
router.post('/', async (req, res) => {
    try {
        const { task } = req.body
        console.log('Creating todo for user:', req.userId, 'task:', task)
        
        if (!task) {
            return res.status(400).json({ message: 'Task is required' })
        }
        
        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: req.userId }
        })
        
        if (!userExists) {
            console.log('User does not exist:', req.userId)
            return res.status(401).json({ message: 'User not found - please login again' })
        }
        
        const todo = await prisma.Todo.create({
            data: {
                task,
                userId: req.userId
            }
        })

        console.log('Todo created:', todo)
        res.json(todo)
    } catch(err) {
        console.error('Error creating todo:', err)
        res.status(500).json({ message: 'Error creating todo', error: err.message })
    }
})

// Update a todo
router.put('/:id', async (req, res) => {
    try {
        const { completed, task } = req.body
        const { id } = req.params
        const userId = req.userId
        
        console.log('Updating todo:', id, 'for user:', userId, 'completed:', completed)
        
        const updatedTodo = await prisma.Todo.updateMany({
            where: { 
                id: parseInt(id),
                userId: userId 
            },
            data: {
                completed,
                task
            }
        })

        res.json({ message: "Todo updated", changes: updatedTodo.count })
    } catch(err) {
        console.error('Error updating todo:', err)
        res.status(500).json({ message: 'Error updating todo', error: err.message })
    }
})

// Delete a todo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        
        console.log('Deleting todo:', id, 'for user:', userId)
        
        const result = await prisma.Todo.deleteMany({
            where: {
                id: parseInt(id),
                userId: userId
            }
        })
        
        res.status(200).json({ message: "Todo deleted", changes: result.count })
    } catch(err) {
        console.error('Error deleting todo:', err)
        res.status(500).json({ message: "Error deleting todo", error: err.message })
    }
})
export default router