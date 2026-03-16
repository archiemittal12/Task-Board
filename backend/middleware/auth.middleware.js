const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    // authorization header format is Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header missing',
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Token missing',
      });
    }
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }
    // attach user to request
    req.user = user;
    next();
  } 
  catch (error) {
    console.error(error);
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
module.exports = authMiddleware;