
const jwt = require("jsonwebtoken");

// Секретный ключ для подписи токенов 
const JWT_SECRET = "bookstore_secret_key_2026";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  // Ожидаем формат: Bearer <token>
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ 
      error: "Missing or invalid Authorization header" 
    });
  }

  try {
    // Проверяем токен
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Сохраняем данные пользователя в запрос
    req.user = payload; // { sub, email, firstName, lastName, iat, exp }
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: "Invalid or expired token" 
    });
  }
}

module.exports = authMiddleware;