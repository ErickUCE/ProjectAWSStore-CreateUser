const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const jwtSecret = process.env.JWT_SECRET || 'secretoPorDefecto';
        const decoded = jwt.verify(token, jwtSecret);

        req.user = decoded; // ✅ Guardamos los datos del usuario en `req.user`
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateToken;
