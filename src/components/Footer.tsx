import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-800 text-white p-4 text-center mt-8">
    &copy; {new Date().getFullYear()} Travel Link. All rights reserved.
  </footer>
);

export default Footer;
