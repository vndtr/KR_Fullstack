const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");

const path = require("path");
const booksPath = path.join(__dirname, "../data/books.js");
let books = require(booksPath);

// Вспомогательная функция для поиска книги по ID
function findById(id) {
  const num = Number(id);
  if (isNaN(num)) return null;
  return books.find(b => b.id === num);
}

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Возвращает список всех книг
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Список книг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

// GET /api/books
router.get("/", (req, res) => {
  res.json(books);
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Получает книгу по ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Данные книги
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книга не найдена
 */


// GET /api/books/:id
router.get("/:id", (req, res) => {
const book = findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: "Книга не найдена" });
  }
  
  res.json(book);
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Создаёт новую книгу
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Книга успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Ошибка валидации
 */

// POST /api/books
router.post("/", (req, res) => {
 const { title, author, category, description, price, stock, rating, image } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: "Название и цена обязательны" });
  }

 const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  
 const newBook = {
    id: newId,
    title,
    author: author || "Неизвестен",
    category: category || "другое",
    description: description || "",
    price: Number(price),
    stock: stock || 0,
    rating: rating || 0,
    image: image || "/images/default.jpg"
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Обновляет данные книги
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID книги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлённая книга
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книга не найдена
 *       400:
 *         description: Ошибка валидации
 */

// PATCH /api/books/:id
router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) return res.status(404).json({ error: "Книга не найдена" });

  const { title, author, category, description, price, stock, rating, image } = req.body;

  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;
  if (description) book.description = description;
  if (price) book.price = Number(price);
  if (stock !== undefined) book.stock = stock;
  if (rating) book.rating = rating;
  if (image) book.image = image;

  res.json(book);
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Удаляет книгу
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID книги
 *     responses:
 *       204:
 *         description: Книга успешно удалена (нет тела ответа)
 *       404:
 *         description: Книга не найдена
 */


// DELETE /api/books/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Книга не найдена" });
  
  books.splice(index, 1);
  res.status(204).send();
});

module.exports = router;

