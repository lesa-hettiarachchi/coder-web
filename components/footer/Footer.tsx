import React from 'react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const studentName = "Lesa Hettiarachchi";
  const studentNumber = "21533031";

  return (
    <footer className="footer">
      <p className="footer-text">&copy; {currentYear} {studentName} {studentNumber}</p>
      <p className="footer-text">All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
