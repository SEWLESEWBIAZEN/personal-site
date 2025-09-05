import React, { useRef, useEffect } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import List from '@editorjs/list';
import InlineCode from '@editorjs/inline-code';
import SimpleImage from '@editorjs/image'
import { Button } from '../ui/button';
import RawTool from '@editorjs/raw';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table'
import Paragraph from 'editorjs-paragraph-with-alignment';
import DrawingTool from '@blade47/editorjs-drawing-tool';
import AttachesTool from '@editorjs/attaches';
import ToggleBlock from 'editorjs-toggle-block';
import Warning from '@editorjs/warning';
import Delimiter from '@coolbytes/editorjs-delimiter'
import Header from 'editorjs-header-with-alignment'
import Header1 from 'editorjs-header-with-anchor'
import Title from "title-editorjs";
import AudioTool from '@furison-tech/editorjs-audio';
import ColorPicker from 'editorjs-color-picker';
import Marker from '@editorjs/marker';
import TextSpoiler from 'editorjs-inline-spoiler-tool'
import editorjsCodeflask from '@calumk/editorjs-codeflask';

import createGenericInlineTool, {
  ItalicInlineTool,
  UnderlineInlineTool,
} from 'editorjs-inline-tool'
import supabase from '@/lib/utils/supabase';


type EditorComponentProps = {
  onChange?: (data: OutputData) => void;
  holderId?: string;
};


const EditorComponent: React.FC<EditorComponentProps> = ({
  onChange,
  holderId = 'editorjs-container'
}) => {

  const editorRef = useRef<EditorJS | null>(null);
  const handleSave = async () => {
    const data = await editorRef.current?.save();
    if (data && onChange) {
      onChange(data);
    }

    editorRef.current.clear();
  };

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: holderId,
        autofocus: true,
        tools: {
          TextSpoiler: TextSpoiler,
          Marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
          },
          ColorPicker: {
            class: ColorPicker,
          },        
          
          title: Title,
        //    code: (window as any).CodeTool,
            code : editorjsCodeflask,
          audio: {
            class: AudioTool,
            config: {
              endpoints: {
                byFile: `${supabase.supabaseUrl}/functions/v1/uploadAudio`, // Your backend file uploader endpoint
                
                // byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
              },
              // additionalReqHeaders: {
              //   Authorization: `Bearer ${supabase.supabaseKey}`,
              // },
              // body: {
              //   // Add any additional data you want to send with the request
              //   name: "Functions"
              // },

            }
          },
          warning: Warning,
          delimiter: {
            class: Delimiter,
            config: {
              styleOptions: ['star', 'dash', 'line'],
              defaultStyle: 'star',
              lineWidthOptions: [8, 15, 25, 35, 50, 60, 100],
              defaultLineWidth: 25,
              lineThicknessOptions: [1, 2, 3, 4, 5, 6],
              defaultLineThickness: 2,
            },

          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          toggle: {
            class: ToggleBlock,
            inlineToolbar: true,
          },
        //   attaches: {
        //     class: AttachesTool,
        //     config: {
        //       endpoint: `${apiUrl}/lessons/lesson/uploadFileContent2`,
        //       fieldName: 'image'
        //     }
        //   },
          drawingTool: {
            class: DrawingTool,
          },
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header with alighment',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 3,
              defaultAlignment: 'left'
            }
          },
          header1: {
            class: Header1,
            config: {
              placeholder: 'Enter a header with Anchor',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 3,
              defaultAlignment: 'left'
            },
            inlineToolbar: true
          },
          raw: RawTool,
          inlineCode: {
            class: InlineCode,
            shortcut: 'ctrl+SHIFT+M',
          },
          // checklist: {
          //   class: Checklist,
          //   inlineToolbar: true,
          // },

        //   image: {
        //     class: SimpleImage,
        //     config: {
        //       endpoints: {
        //         byFile: `${apiUrl}/lessons/lesson/uploadFileContent`,
        //         byUrl: `${apiUrl}/lessons/content/fetchUrl`,
        //       }
        //     }
        //   },
          embed: Embed,
          table: Table,

          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          // List: {
          //   class: EditorjsList,
          //   inlineToolbar: true,
          //   config: {
          //     defaultStyle: 'unordered'
          //   },
          // },
          
        },
        onChange: async () => {
        },

      });

      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };


    }
  }, [holderId]);

  return (
    <div className='w-full'>
      <div id={holderId} className="w-full bg-transparent border h-full rounded-xl " />
      <Button className='mt-2' onClick={handleSave}>Save</Button>
    </div>
  )
};

export default EditorComponent;
