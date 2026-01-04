'use client';

import { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  language?: string;
}

export default function CodeEditor({ code, onChange, readOnly = false, language = 'python' }: CodeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      {/* Editor Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Template Code</h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {language}
          </span>
        </div>

        <div className="flex gap-2">
          {!readOnly && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isEditing
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditing ? '✓ Editing' : '✏️ Edit Code'}
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              alert('Code copied to clipboard!');
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Code Display/Editor */}
      <div className="relative">
        {isEditing && !readOnly ? (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm rounded-lg border-2 border-accent focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            style={{ minHeight: '400px' }}
            spellCheck={false}
          />
        ) : (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
            <code>{code}</code>
          </pre>
        )}

        {isEditing && !readOnly && (
          <div className="mt-2 text-xs text-gray-500">
            💡 Tip: You're editing a fork of this template. Changes won't affect the original.
          </div>
        )}
      </div>

      {/* Code Stats */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>{code.split('\n').length} lines</span>
        <span>{code.length} characters</span>
        {readOnly && <span>Read-only</span>}
      </div>
    </div>
  );
}
