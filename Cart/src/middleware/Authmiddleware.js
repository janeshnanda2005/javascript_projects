import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']

    if (!token) {
        console.log('No authorization header')
        return res.status(401).json({ message: "No token provided" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT verification failed:', err.message)
            return res.status(401).json({ message: "Invalid token" })
        }

        console.log('JWT verified - userId:', decoded.id)
        req.userId = decoded.id
        req.username = decoded.username
        next()
    })
}

export default authMiddleware