// src/components/BooksList.jsx
import React from "react";
import BookItem from "./BookItem";

export default function BooksList({ books, onEdit, onDelete }) {
  if (!books || books.length === 0) {
    return <div className="empty-list">Книг нет</div>;
  }

  return (
    <div className="books-list">
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}