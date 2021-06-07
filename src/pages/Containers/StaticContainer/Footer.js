import React from 'react';

export default function Footer() {
  const date = new Date();
  return (
    <footer>
      <p className="notranslate" translate="no">
        Parallel Reader <span id="footer__date">{date.getFullYear()}</span>
      </p>
    </footer>
  );
}
