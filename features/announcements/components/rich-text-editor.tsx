'use client'
import { memo, useEffect, useImperativeHandle, type RefObject } from 'react'
import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'

export type RichTextEditorHandle = { getHTML: () => string }
export const RichTextEditor = memo(function RichTextEditor({
  editorRef,
  onReady,
}: {
  editorRef: RefObject<RichTextEditorHandle | null>
  onReady: (ready: boolean) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p></p>',
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  })
  const marks = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive('bold') ?? false,
      italic: editor?.isActive('italic') ?? false,
      bulletList: editor?.isActive('bulletList') ?? false,
      orderedList: editor?.isActive('orderedList') ?? false,
    }),
  })
  useImperativeHandle(editorRef, () => ({ getHTML: () => editor?.getHTML() ?? '<p></p>' }), [
    editor,
  ])
  useEffect(() => {
    onReady(!!editor)
    return () => onReady(false)
  }, [editor, onReady])
  return (
    <div className="min-h-[260px] rounded-md border">
      <div className="flex min-h-[56px] flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          size="sm"
          aria-label="Bold"
          variant={marks?.bold ? 'default' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
        >
          B
        </Button>
        <Button
          type="button"
          size="sm"
          aria-label="Italic"
          variant={marks?.italic ? 'default' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
        >
          I
        </Button>
        <Button
          type="button"
          size="sm"
          variant={marks?.bulletList ? 'default' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
        >
          List
        </Button>
        <Button
          type="button"
          size="sm"
          variant={marks?.orderedList ? 'default' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
        >
          1. List
        </Button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-3 min-h-[200px]" />
    </div>
  )
})
