
// Утилита для обработки ошибок removeChild
export const safeRemoveChild = (parent, child) => {
  try {
    if (parent && child && parent.contains(child)) {
      parent.removeChild(child);
    }
  } catch (error) {
    console.warn('Ошибка при удалении дочернего элемента:', error);
  }
};

// Перехват стандартного метода removeChild для предотвращения ошибок
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function(child) {
  try {
    // Проверяем, является ли элемент дочерним перед удалением
    if (this.contains(child)) {
      return originalRemoveChild.call(this, child);
    }
    console.warn('Попытка удаления элемента, который не является дочерним:', child);
    return null;
  } catch (error) {
    console.warn('Ошибка при удалении дочернего элемента:', error);
    return null;
  }
};

// Перехват стандартного метод appendChild для предотвращения ошибок
const originalAppendChild = Node.prototype.appendChild;
Node.prototype.appendChild = function(child) {
  try {
    return originalAppendChild.call(this, child);
  } catch (error) {
    console.warn('Ошибка при добавлении дочернего элемента:', error);
    return null;
  }
};

// Инициализация при загрузке модуля
if (typeof window !== 'undefined') {
  console.log('DOM Error Handler инициализирован');
}
