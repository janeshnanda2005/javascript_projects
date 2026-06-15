import { DatabaseSync } from 'node:sqlite'
const db = new DatabaseSync('./todos.db')

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON')

// Execute SQL statements from strings
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`)

db.exec(`
    
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task TEXT,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )    
`)

export default db