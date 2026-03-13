const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const logger = require("./middleware/logger");
const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");

const app = express();
const PORT = 3000;

app.use(cors());
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

// Swagger настройки
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API книжного магазина с JWT',
      version: '1.0.0',
      description: 'API для книг с аутентификацией через JWT',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Маршруты
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);

app.get("/", (req, res) => {
  res.send(" API книжного магазина работает. Используйте /api/books или /api-docs");
});

app.listen(PORT, () => {
  console.log(` Книжный магазин API запущен: http://localhost:${PORT}`);
  console.log(` Swagger UI: http://localhost:${PORT}/api-docs`);
});