import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface SafeDOMWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Компонент-обертка для безопасной работы с DOM
 * Предотвращает ошибки при манипуляциях с элементами
 */
export const SafeDOMWrapper: React.FC<SafeDOMWrapperProps> = ({ 
  children, 
  id, 
  className 
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Компонент размонтируется безопасно
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <Box 
      ref={wrapperRef} 
      id={id} 
      className={className}
      data-safe-wrapper="true"
    >
      {children}
    </Box>
  );
};
