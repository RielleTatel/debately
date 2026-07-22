'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'

export function RichTextEditor({ value, onChange, disabled }: { value: string; onChange: (html: string) => void; disabled?: boolean }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button type="button" size="sm" variant={editor.isActive('bold') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>B</Button>
        <Button type="button" size="sm" variant={editor.isActive('italic') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>I</Button>
        <Button type="button" size="sm" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>List</Button>
        <Button type="button" size="sm" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>1. List</Button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-3 min-h-[200px]" />
    </div>
  )
}
