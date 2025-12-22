import React from 'react';
import { GeometricBackground } from '../ui/geometric-background';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackground?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className = '',
  showBackground = true 
}) => {
  return (
    <div className={`min-h-screen bg-black text-white relative ${className}`}>
      {showBackground && <GeometricBackground />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;