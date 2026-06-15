import {DatabaseSync} from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, '../../cart.db')

const db = new DatabaseSync(dbPath)

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS cart(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER,
    Product TEXT,
    nos INTEGER DEFAULT 0,
    FOREIGN KEY(userid) REFERENCES users(id),
    UNIQUE(userid, Product)
    )`)

export default db