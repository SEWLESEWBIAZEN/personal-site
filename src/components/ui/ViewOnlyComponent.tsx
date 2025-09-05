import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import SimpleImage from '@editorjs/image';
import RawTool from '@editorjs/raw';
import LinkTool from '@editorjs/link';
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote';
import DrawingTool from '@blade47/editorjs-drawing-tool';
import AttachesTool from '@editorjs/attaches';
import Table from '@editorjs/table'
import AudioTool from '@furison-tech/editorjs-audio';
// import SKMFlipBox from 'skm-flipbox';
import Title from "title-editorjs";
import ToggleBlock from 'editorjs-toggle-block';
import Warning from '@editorjs/warning';
import Delimiter from '@coolbytes/editorjs-delimiter'

type ReadOnlyViewerProps = {
  content: OutputData;
  holderId?: string;
};

export const ReadOnlyViewer: React.FC<ReadOnlyViewerProps> = ({
  content
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const hasSubscribed = useRef(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: editorContainerRef.current!,
        readOnly: true,
        data: content,
        tools: {
          attaches: {
            class: AttachesTool,
          },
          warning: {
            class: Warning,
          },
          toggle: {
            class: ToggleBlock,
          },
          delimiter: Delimiter,
          drawingTool: {
            class: DrawingTool,
          },
          title: Title,
          audio: {
            class: AudioTool,
          },
          header: Header,
          linkTool: LinkTool,
          raw: RawTool,
          list: List,
          inlineCode: InlineCode,
          checklist: {
            class: Checklist,
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
              }
            }
          },
          table: Table,
          quote: {
            class: Quote,
          },
          image: SimpleImage,
        },
        onReady: () => {
      
          hasSubscribed.current = true;
        }
      });
    }

    return () => {
      if (hasSubscribed.current) {
        editorRef.current?.destroy?.();
      }
      editorRef.current = null;
      hasSubscribed.current = false;
    };
  }, []);

  return <div id="readonly-editor" className="m-0 p-0"
    style={{ margin: 0, padding: 0 }} ref={editorContainerRef} />;
};
