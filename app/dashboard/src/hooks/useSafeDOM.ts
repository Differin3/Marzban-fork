import { useEffect, useRef } from 'react';

/**
 * Хук для безопасной работы с DOM элементами
 * Предотвращает ошибки при манипуляциях с DOM
 */
export const useSafeDOM = () => {
  const containerRef = useRef<HTMLElement>(null);

  /**
   * Безопасно удаляет дочерние элементы
   */
  const safeClearChildren = () => {
    if (containerRef.current) {
      try {
        while (containerRef.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      } catch (error) {
        console.warn('Ошибка при очистке дочерних элементов:', error);
      }
    }
  };

  /**
   * Безопасно добавляет HTML разметку
   */
  const safeInnerHTML = (html: string) => {
    if (containerRef.current) {
      try {
        containerRef.current.innerHTML = html;
      } catch (error) {
        console.warn('Ошибка при установке innerHTML:', error);
      }
    }
  };

  /**
   * Безопасно добавляет дочерний элемент
   */
  const safeAppendChild = (child: HTMLElement) => {
    if (containerRef.current) {
      try {
        if (!containerRef.current.contains(child)) {
          containerRef.current.appendChild(child);
        }
      } catch (error) {
        console.warn('Ошибка при добавлении дочернего элемента:', error);
      }
    }
  };

  /**
   * Безопасно удаляет дочерний элемент
   */
  const safeRemoveChild = (child: HTMLElement) => {
    if (containerRef.current && containerRef.current.contains(child)) {
      try {
        containerRef.current.removeChild(child);
      } catch (error) {
        console.warn('Ошибка при удалении дочернего элемента:', error);
      }
    }
  };

  return {
    containerRef,
    safeClearChildren,
    safeInnerHTML,
    safeAppendChild,
    safeRemoveChild
  };
};
