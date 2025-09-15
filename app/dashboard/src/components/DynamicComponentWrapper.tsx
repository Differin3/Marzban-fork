import React, { useEffect, useState, Suspense } from 'react';
import { Box } from '@chakra-ui/react';
import { useSafeDOM } from '../hooks/useSafeDOM';

interface DynamicComponentWrapperProps {
  component: React.LazyExoticComponent<any>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Обертка для динамически загружаемых компонентов
 * Предотвращает ошибки при манипуляциях с DOM
 */
export const DynamicComponentWrapper: React.FC<DynamicComponentWrapperProps> = ({
  component: Component,
  props = {},
  fallback,
  className
}) => {
  const { containerRef } = useSafeDOM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <Box ref={containerRef} className={className}>
      <Suspense fallback={fallback || <div>Загрузка...</div>}>
        {isMounted ? <Component {...props} /> : null}
      </Suspense>
    </Box>
  );
};
