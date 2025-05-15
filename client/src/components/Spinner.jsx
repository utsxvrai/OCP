import React from 'react';

function Spinner({ size = 'md', color = 'primary' }) {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-gray-500',
    white: 'border-white',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500'
  };
  
  return (
    <div className={`spinner inline-block rounded-full border-t-transparent animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner; 