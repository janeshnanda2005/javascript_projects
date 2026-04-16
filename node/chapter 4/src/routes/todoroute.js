import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get all todos for logged-in user
router.get('/', (req, res) => {
    try {
        console.log('Fetching todos for user:', req.userId)
        
        // Verify user exists
        const userCheck = db.prepare('SELECT id FROM users WHERE id = ?')
        const userExists = userCheck.get(req.userId)
        
        if (!userExists) {
            console.log('User does not exist:', req.userId)
            return res.status(401).json({ message: 'User not found - please login again' })
        }
        
        const getTodos = db.prepare('SELECT * FROM todos WHERE user_id = ?')
        const todos = getTodos.all(req.userId)
        console.log('Found todos:', todos)
        res.json(todos)
    } catch(err) {
        console.error('Error fetching todos:', err)
        res.status(500).json({ message: 'Error fetching todos', error: err.message })
    }
})

// Create a new todo
router.post('/', (req, res) => {
    try {
        const { task } = req.body
        console.log('Creating todo for user:', req.userId, 'task:', task)
        
        if (!task) {
            return res.status(400).json({ message: 'Task is required' })
        }
        
        // Verify user exists
        const userCheck = db.prepare('SELECT id FROM users WHERE id = ?')
        const userExists = userCheck.get(req.userId)
        
        if (!userExists) {
            console.log('User does not exist:', req.userId)
            return res.status(401).json({ message: 'User not found - please login again' })
        }
        
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        const result = insertTodo.run(req.userId, task)

        console.log('Todo created:', result)
        res.json({ id: result.lastInsertRowid, task, completed: 0 })
    } catch(err) {
        console.error('Error creating todo:', err)
        res.status(500).json({ message: 'Error creating todo', error: err.message })
    }
})

// Update a todo
router.put('/:id', (req, res) => {
    try {
        const { completed, task } = req.body
        const { id } = req.params
        const userId = req.userId
        
        console.log('Updating todo:', id, 'for user:', userId, 'completed:', completed)
        
        const updatedTodo = db.prepare('UPDATE todos SET completed = ?, task = ? WHERE id = ? AND user_id = ?')
        updatedTodo.run(completed, task, id, userId)

        res.json({ message: "Todo updated" })
    } catch(err) {
        console.error('Error updating todo:', err)
        res.status(500).json({ message: 'Error updating todo', error: err.message })
    }
})

// Delete a todo
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        
        console.log('Deleting todo:', id, 'for user:', userId)
        
        const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
        const result = deleteTodo.run(id, userId)
        
        res.json({ message: "Todo deleted", changes: result.changes })
    } catch(err) {
        console.error('Error deleting todo:', err)
        res.status(500).json({ message: 'Error deleting todo', error: err.message })
    }
})

export default router