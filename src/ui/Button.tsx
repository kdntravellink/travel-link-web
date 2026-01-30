import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => (
  <button
    className={
      variant === 'primary'
        ? 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        : 'bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300'
    }
    {...props}
  >
    {children}
  </button>
);

export default Button;
