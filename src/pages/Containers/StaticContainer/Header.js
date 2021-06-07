import React from 'react';

export default function Header({ title, nav }) {
  return (
    <header>
      <h1>{title}</h1>
      {nav && nav}
    </header>
  );
}
