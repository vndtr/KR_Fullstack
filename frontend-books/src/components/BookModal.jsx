// src/components/BookModal.jsx
import React, { useState, useEffect } from "react";

export default function BookModal({ open, mode, initialBook, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  // Заполняем форму данными при открытии/смене книги
  useEffect(() => {
    if (open && initialBook) {
      setTitle(initialBook.title || "");
      setAuthor(initialBook.author || "");
      setCategory(initialBook.category || "");
      setDescription(initialBook.description || "");
      setPrice(initialBook.price?.toString() || "");
      setStock(initialBook.stock?.toString() || "");
      setRating(initialBook.rating?.toString() || "");
      setImage(initialBook.image || "");
    } else {
      // Очищаем форму для создания новой книги
      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setPrice("");
      setStock("");
      setRating("");
      setImage("");
    }
  }, [open, initialBook]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация
    if (!title.trim()) {
      alert("Введите название книги");
      return;
    }

    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      alert("Введите корректную цену (число больше 0)");
      return;
    }

    // Собираем данные для отправки
    const bookData = {
      ...(initialBook?.id && { id: initialBook.id }),
      title: title.trim(),
      author: author.trim() || "Неизвестен",
      category: category.trim() || "другое",
      description: description.trim(),
      price: priceNum,
      stock: stock ? Number(stock) : 0,
      rating: rating ? Number(rating) : 0,
      image: image.trim() || "/images/default.jpg"
    };

    onSubmit(bookData);
  };

  const titleText = mode === "edit" ? "Редактирование книги" : "Добавление новой книги";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titleText}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Автор</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Введите автора"
            />
          </div>

          <div className="form-group">
            <label>Категория</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например: роман, фантастика"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание книги"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Цена *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="990"
                min="0"
                step="1"
              />
            </div>

            <div className="form-group">
              <label>Количество</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Рейтинг</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>URL фото</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/book.jpg"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}