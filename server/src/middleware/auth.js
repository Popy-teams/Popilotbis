import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Non authentifié' });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expirée' });
  }
}
