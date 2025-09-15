import { Component, ErrorInfo } from 'react';

/**
 * Глобальный обработчик ошибок для React компонентов
 */
export class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку
    console.error('Произошла ошибка:', error, errorInfo);

    // Проверяем, является ли ошибка связанной с DOM манипуляцией
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      console.warn('Обнаружена ошибка манипуляции DOM:', error);

      // Здесь можно добавить дополнительную логику обработки
      // Например, перезагрузку компонента или сброс состояния

      // Пытаемся восстановить состояние
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      // Рендерим запасной UI при ошибке
      return (
        <div>
          <h1>Что-то пошло не так.</h1>
          <p>Произошла ошибка в интерфейсе. Пожалуйста, обновите страницу.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Обработчик глобальных ошибок
 */
export const handleGlobalError = (event: ErrorEvent) => {
  console.error('Глобальная ошибка:', event.error);

  // Проверяем, является ли ошибка связанной с DOM манипуляцией
  if (event.error && event.error.message && 
      (event.error.message.includes('removeChild') || event.error.message.includes('Node'))) {
    console.warn('Обнаружена глобальная ошибка манипуляции DOM:', event.error);

    // Предотвращаем стандартное поведение браузера
    event.preventDefault();

    // Можно добавить дополнительную логику обработки
    return false;
  }
};

// Инициализация обработчика глобальных ошибок
if (typeof window !== 'undefined') {
  window.addEventListener('error', handleGlobalError);
  console.log('Глобальный обработчик ошибок инициализирован');
}
