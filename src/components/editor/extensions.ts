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

const lowlight = createLowlight(common);

// Single source of the editor's document schema, shared by the editor and tests.
export function editorExtensions(placeholder = "Start writing…") {
  return [
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
  ];
}
