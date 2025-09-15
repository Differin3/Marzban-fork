import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { SafeDOMWrapper } from './SafeDOMWrapper';

interface SafeJsonEditorProps {
  json: any;
  onChange?: (json: any) => void;
  mode?: 'tree' | 'view' | 'form' | 'code' | 'text';
  className?: string;
}

/**
 * Безопасная обертка для JSON редактора
 * Предотвращает ошибки при манипуляциях с DOM элементами редактора
 */
export const SafeJsonEditor: React.FC<SafeJsonEditorProps> = ({ 
  json, 
  onChange,
  mode = 'tree',
  className 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Инициализация редактора только после монтирования компонента
    if (editorRef.current && !isInitialized) {
      try {
        // Проверяем, доступен ли глобальный редактор
        if (typeof window !== 'undefined' && window.jsoneditor) {
          const options = {
            mode: mode,
            onChangeText: (jsonString: string) => {
              try {
                const parsedJson = JSON.parse(jsonString);
                onChange && onChange(parsedJson);
              } catch (e) {
                console.error('Ошибка парсинга JSON:', e);
              }
            }
          };

          const editor = new window.jsoneditor(editorRef.current, options);
          editor.set(json);
          setEditorInstance(editor);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Ошибка инициализации JSON редактора:', error);
      }
    }

    // Функция очистки
    return () => {
      if (editorInstance) {
        try {
          editorInstance.destroy();
        } catch (error) {
          console.error('Ошибка при уничтожении JSON редактора:', error);
        }
      }
    };
  }, [json, onChange, mode, isInitialized, editorInstance]);

  return (
    <SafeDOMWrapper id="json-editor-wrapper" className={className}>
      <Box 
        ref={editorRef} 
        height="400px" 
        width="100%"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      />
    </SafeDOMWrapper>
  );
};
