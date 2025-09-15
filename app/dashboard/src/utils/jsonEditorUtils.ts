/**
 * Утилиты для безопасной работы с JSON редактором
 * Предотвращают ошибки при манипуляциях с DOM
 */

/**
 * Безопасно инициализирует JSON редактор
 */
export const safeJsonEditorInit = (element: HTMLElement, options: any) => {
  try {
    if (typeof window !== 'undefined' && window.jsoneditor) {
      const editor = new window.jsoneditor(element, options);
      return editor;
    } else {
      console.warn('JSON редактор не доступен');
      return null;
    }
  } catch (error) {
    console.error('Ошибка инициализации JSON редактора:', error);
    return null;
  }
};

/**
 * Безопасно уничтожает JSON редактор
 */
export const safeJsonEditorDestroy = (editor: any) => {
  try {
    if (editor && typeof editor.destroy === 'function') {
      editor.destroy();
    }
  } catch (error) {
    console.error('Ошибка при уничтожении JSON редактора:', error);
  }
};

/**
 * Безопасно устанавливает значение в JSON редактор
 */
export const safeJsonEditorSetValue = (editor: any, value: any) => {
  try {
    if (editor && typeof editor.set === 'function') {
      editor.set(value);
    }
  } catch (error) {
    console.error('Ошибка при установке значения JSON редактора:', error);
  }
};

/**
 * Безопасно получает значение из JSON редактора
 */
export const safeJsonEditorGetValue = (editor: any) => {
  try {
    if (editor && typeof editor.get === 'function') {
      return editor.get();
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении значения JSON редактора:', error);
    return null;
  }
};
