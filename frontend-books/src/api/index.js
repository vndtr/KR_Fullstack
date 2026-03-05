
import axios from "axios";

// Создаём экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Объект со всеми методами API
export const api = {
  // Получить все книги
  getBooks: async () => {
    const response = await apiClient.get("/books");
    return response.data;
  },

  //  Получить книгу по ID
  getBookById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },

  // Создать книгу
  createBook: async (bookData) => {
    const response = await apiClient.post("/books", bookData);
    return response.data;
  },

  //  Обновить книгу
  updateBook: async (id, bookData) => {
    const response = await apiClient.patch(`/books/${id}`, bookData);
    return response.data;
  },

  // Удалить книгу
  deleteBook: async (id) => {
    await apiClient.delete(`/books/${id}`);
  }
};