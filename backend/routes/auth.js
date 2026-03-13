// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

let users = require("../data/users");

// Функция для поиска пользователя по email
function findUserByEmail(email) {
  return users.find(u => u.email === email);
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
 *           description: Уникальный ID пользователя
 *         email:
 *           type: string
 *           description: Email (логин)
 *         firstName:
 *           type: string
 *           description: Имя
 *         lastName:
 *           type: string
 *           description: Фамилия
 *         password:
 *           type: string
 *           description: Хешированный пароль
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации или email уже существует
 */
router.post("/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  // Валидация
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  // Проверка, существует ли уже такой email
  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Пользователь с таким email уже существует" });
  }

  try {
    // Хешируем пароль (10 раундов соли)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nanoid(8),
      email,
      firstName,
      lastName,
      password: hashedPassword
    };

    users.push(newUser);
    
    // Не возвращаем пароль в ответе
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
 *     summary: Вход в систему
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
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

    // Не возвращаем пароль
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;