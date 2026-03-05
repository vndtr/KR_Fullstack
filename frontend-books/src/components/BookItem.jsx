import React from "react";

export default function BookItem({ book, onEdit, onDelete }) {
  return (
    <div className="book-row">
   
      <div className="book-image">
        <img src={book.image} alt={book.title} />
      </div>

      <div className="book-main">
        <div className="book-id">#{book.id}</div>
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        <div className="book-category">{book.category}</div>
        <div className="book-price">{book.price} ₽</div>
        <div className="book-stock">В наличии: {book.stock}</div>
        {book.rating && (
          <div className="book-rating">⭐ {book.rating}</div>
        )}
      </div>

      <div className="book-actions">
        <button className="btn btn--edit" onClick={() => onEdit(book)}>
          Редактировать
        </button>
        <button className="btn btn--delete" onClick={() => onDelete(book.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}