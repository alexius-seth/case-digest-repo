"use client";

import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
  value: string;
  onChange: (val?: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <div data-color-mode="auto">
      <MDEditor
        value={value}
        onChange={onChange}
        height={220}
        preview="edit"
        textareaProps={{ placeholder }}
      />
    </div>
  );
}