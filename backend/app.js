const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");
const booksRouter = require("./routes/books");

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());
app.use(logger);

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор книги
 *           example: 1
 *         title:
 *           type: string
 *           description: Название книги
 *           example: "Кафка на пляже"
 *         author:
 *           type: string
 *           description: Автор книги
 *           example: "Харуки Мураками"
 *         category:
 *           type: string
 *           description: Жанр / категория
 *           example: "роман"
 *         description:
 *           type: string
 *           description: Краткое описание
 *           example: "Мистический роман японского писателя..."
 *         price:
 *           type: number
 *           description: Цена в рублях
 *           example: 990
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 15
 *         rating:
 *           type: number
 *           description: Рейтинг книги (0-5)
 *           example: 4.8
 *         image:
 *           type: string
 *           description: Путь к изображению
 *           example: "/images/kafka.jpg"
 */

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API книжного магазина',
      version: '1.0.0',
      description: 'API для управления книгами в интернет-магазине',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./routes/*.js', './app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/api/books", booksRouter);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`📚 Книжный магазин API запущен: http://localhost:${PORT}`);
});