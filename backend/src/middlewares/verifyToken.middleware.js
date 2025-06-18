const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      res.clearCookie('token');
      return res.status(401).json({ error: 'Session expired, please login again' });
    }

    return res.status(403).json({ error: 'Invalid authentication token' });
  }
}

module.exports = verifyToken;