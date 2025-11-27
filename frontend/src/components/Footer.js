import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} Marcelo Antony Accacio Olhier. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Footer;