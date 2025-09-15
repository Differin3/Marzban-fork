// Простое решение для предотвращения ошибки removeChild
if (typeof window !== 'undefined') {
  // Безопасный метод removeChild
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    try {
      if (this.contains(child)) {
        return originalRemoveChild.call(this, child);
      }
      return null;
    } catch (e) {
      console.warn('Ошибка при удалении элемента:', e);
      return null;
    }
  };

  // Безопасный метод appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    try {
      return originalAppendChild.call(this, child);
    } catch (e) {
      console.warn('Ошибка при добавлении элемента:', e);
      return null;
    }
  };

  console.log('Безопасные методы DOM инициализированы');
}
