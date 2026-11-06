"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, SquareCode, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Minus, Undo, Redo, Table as TableIcon, Video, Rows3, Columns3, Trash,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaItem } from "@/components/admin/upload";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content?: object | null;
  onChange: (json: object, html: string) => void;
  placeholder?: string;
  media: MediaItem[];
}

function ToolbarButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={active ? "is-active" : ""} aria-label={label} aria-pressed={active} title={label}>
      {children}
    </button>
  );
}

function isSafeUrl(url: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(url.trim());
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (url === "") return void editor.chain().focus().extendMarkRange("link").unsetLink().run();
    if (!isSafeUrl(url)) return void window.alert("Only http(s), mailto or site-relative links are allowed.");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addVideo = () => {
    const url = window.prompt("YouTube URL");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const codeBlock = () => {
    if (editor.isActive("codeBlock")) return void editor.chain().focus().toggleCodeBlock().run();
    const language = window.prompt("Language (e.g. ts, python, bash) — optional", "ts");
    if (language === null) return;
    editor.chain().focus().toggleCodeBlock({ language: language.trim().toLowerCase() || undefined } as never).run();
  };

  const inTable = editor.isActive("table");

  return (
    <div className="tiptap-toolbar" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolbarButton>
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={16} /></ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={16} /></ToolbarButton>
      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={codeBlock}><SquareCode size={16} /></ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolbarButton>
      <ToolbarButton label="Image" onClick={onImage}><ImageIcon size={16} /></ToolbarButton>
      <ToolbarButton label="YouTube video" onClick={addVideo}><Video size={16} /></ToolbarButton>
      <ToolbarButton label="Table" active={inTable} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 size={16} /></ToolbarButton>
          <ToolbarButton label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 size={16} /></ToolbarButton>
          <ToolbarButton label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}><Trash size={16} /></ToolbarButton>
        </>
      )}
      <span style={{ flex: 1 }} />
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></ToolbarButton>
    </div>
  );
}

export function TiptapEditor({ content, onChange, placeholder = "Start writing…", media }: TiptapEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
      ImageExtension,
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => onChange(editor.getJSON(), editor.getHTML()),
    immediatelyRender: false,
  });

  const insertImage = useCallback(
    (item: MediaItem) => {
      editor?.chain().focus().setImage({ src: item.url, alt: item.altText ?? "" }).run();
      setPickerOpen(false);
    },
    [editor],
  );

  if (!editor) return <div className="tiptap-editor tiptap-loading">Loading editor…</div>;

  return (
    <div className="tiptap-editor">
      <Toolbar editor={editor} onImage={() => setPickerOpen(true)} />
      <div className="tiptap-content prose">
        <EditorContent editor={editor} />
      </div>
      <MediaPicker open={pickerOpen} media={media} onClose={() => setPickerOpen(false)} onSelect={insertImage} />
    </div>
  );
}
