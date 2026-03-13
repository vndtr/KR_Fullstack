// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");

let users = require("../data/users");

// Секретные ключи (в реальном проекте хранят в .env)
const ACCESS_SECRET = "bookstore_access_secret_2026";
const REFRESH_SECRET = "bookstore_refresh_secret_2026";

// Время жизни токенов
const ACCESS_EXPIRES_IN = "15m";  // 15 минут
const REFRESH_EXPIRES_IN = "7d";   // 7 дней

// Хранилище активных refresh-токенов (в памяти)
let refreshTokens = new Set();

// Вспомогательная функция для поиска пользователя по email
function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

// Функции для генерации токенов
function generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         password:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: @mail.ru
 *               firstName:
 *                 type: string
 *                 example: string
 *               lastName:
 *                 type: string
 *                 example: string
 *               password:
 *                 type: string
 *                 example: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации или email уже существует
 */
router.post("/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Пользователь с таким email уже существует" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nanoid(8),
      email,
      firstName,
      lastName,
      password: hashedPassword
    };

    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему, получение access и refresh токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: @mail.ru
 *               password:
 *                 type: string
 *                 example: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  try {
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    // Генерируем токены
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Сохраняем refresh-токен в хранилище
    refreshTokens.add(refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      accessToken,
      refreshToken,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов по refresh-токену
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       400:
 *         description: Refresh token обязателен
 *       401:
 *         description: Невалидный или истекший refresh token
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken обязателен" });
  }

  // Проверяем, есть ли токен в хранилище
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: "Невалидный refresh token" });
  }

  try {
    // Проверяем подпись и срок действия
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Находим пользователя
    const user = users.find(u => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    // Ротация: удаляем старый refresh-токен
    refreshTokens.delete(refreshToken);

    // Генерируем новую пару токенов
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Сохраняем новый refresh-токен
    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    // Если токен истек или невалиден - удаляем его из хранилища
    refreshTokens.delete(refreshToken);
    return res.status(401).json({ error: "Невалидный или истекший refresh token" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные текущего пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
router.get("/me", require("../middleware/auth"), (req, res) => {
  // req.user заполняется в middleware (использует ACCESS_SECRET)
  const userId = req.user.sub;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;