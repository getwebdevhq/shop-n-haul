"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[150px] p-4 bg-charcoal border border-stone/20 text-sm text-ivory",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-stone/20 flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-[#1c1c1c] border-b border-stone/20">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("bold") ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("italic") ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 2 }) ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("bulletList") ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("orderedList") ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 transition-colors cursor-pointer ${
            editor.isActive("blockquote") ? "text-gold bg-stone/10" : "text-stone/40 hover:text-ivory"
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px bg-stone/20 mx-2 self-stretch" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 text-stone/40 hover:text-ivory transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 text-stone/40 hover:text-ivory transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
