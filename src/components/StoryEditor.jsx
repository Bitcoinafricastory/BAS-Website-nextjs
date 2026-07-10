'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const fontSizeArr = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: fontSizeArr }],
    [{ align: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image', 'video',
];

// Dark-theme overrides for use inside the dashboard (Quill's default "snow"
// theme is light). Scoped to .bas-quill-dark so the public light editor is
// unaffected.
const darkStyles = `
.bas-quill-dark .ql-toolbar {
  background: #111113;
  border-color: #27272a;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.bas-quill-dark .ql-container {
  background: #0a0a0a;
  border-color: #27272a;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  color: #e5e7eb;
  font-size: 16px;
  min-height: 320px;
}
.bas-quill-dark .ql-editor {
  min-height: 320px;
}
.bas-quill-dark .ql-editor.ql-blank::before {
  color: #6b7280;
  font-style: normal;
}
.bas-quill-dark .ql-editor a { color: #eab308; }
.bas-quill-dark .ql-editor blockquote {
  border-left-color: #eab308;
  color: #d1d5db;
}
/* Toolbar icons */
.bas-quill-dark .ql-toolbar .ql-stroke { stroke: #9ca3af; }
.bas-quill-dark .ql-toolbar .ql-fill { fill: #9ca3af; }
.bas-quill-dark .ql-toolbar .ql-picker { color: #9ca3af; }
.bas-quill-dark .ql-toolbar button:hover .ql-stroke,
.bas-quill-dark .ql-toolbar button.ql-active .ql-stroke { stroke: #eab308; }
.bas-quill-dark .ql-toolbar button:hover .ql-fill,
.bas-quill-dark .ql-toolbar button.ql-active .ql-fill { fill: #eab308; }
.bas-quill-dark .ql-toolbar .ql-picker-label:hover,
.bas-quill-dark .ql-toolbar .ql-picker-item:hover,
.bas-quill-dark .ql-toolbar .ql-picker-label.ql-active { color: #eab308; }
/* Dropdown menus */
.bas-quill-dark .ql-picker-options {
  background: #18181b;
  border-color: #27272a;
  color: #e5e7eb;
}
.bas-quill-dark .ql-toolbar .ql-picker-label { border-color: transparent; }
`;

export default function StoryEditor({ value, onChange, dark = false }) {
  return (
    <div className={dark ? 'bas-quill-dark' : ''}>
      {dark && <style dangerouslySetInnerHTML={{ __html: darkStyles }} />}
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} />
    </div>
  );
}
