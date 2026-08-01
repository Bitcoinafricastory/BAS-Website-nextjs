'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const fontSizeArr = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

// Named fonts writers can pick from the toolbar dropdown.
// Slugs must be lowercase, no spaces (Quill's Parchment requirement).
// `family` uses next/font CSS variables where possible so browsers use the
// fonts we've actually loaded rather than a random system fallback.
const FONT_CHOICES = [
  { value: 'montserrat', label: 'Montserrat', family: 'var(--font-montserrat), system-ui, sans-serif' },
  { value: 'poppins', label: 'Poppins', family: 'var(--font-poppins), system-ui, sans-serif' },
  { value: 'inter', label: 'Inter', family: 'var(--font-inter), system-ui, sans-serif' },
  { value: 'georgia', label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { value: 'merriweather', label: 'Merriweather', family: 'var(--font-merriweather), Georgia, serif' },
  { value: 'courier', label: 'Courier', family: '"Courier New", Courier, monospace' },
];

const FONT_WHITELIST = FONT_CHOICES.map((f) => f.value);

const toolbarConfig = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: FONT_WHITELIST }],
  [{ size: fontSizeArr }],
  [{ align: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
  ['link', 'image', 'video'],
  ['clean'],
];

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'list', 'indent',
  'align',
  'link', 'image', 'video',
];

// CSS that must apply BOTH inside the Quill editor AND on the public article
// page (since Quill emits e.g. <span class="ql-font-poppins"> into stored HTML).
// Loaded once on client mount below AND injected into globals for public reads.
const fontCss = FONT_CHOICES
  .map((f) => `
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${f.value}"]::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${f.value}"]::before {
      content: "${f.label}";
      font-family: ${f.family};
    }
    .ql-font-${f.value} { font-family: ${f.family}; }
  `)
  .join('\n');

// Light-mode baseline — without this, the page's own (often white, on a
// dark-themed site) text color inherits straight into Quill's white canvas,
// making typed text invisible. Always applied; darkStyles below layers on
// top of this when dark=true.
const lightStyles = `
.bas-quill-light .ql-editor {
  color: #1f2937;
}
.bas-quill-light .ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
}
`;

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

export default function StoryEditor({ value, onChange, dark = false, onImageUpload }) {
  const quillRef = useRef(null);

  // Register the named fonts with Quill's Parchment. Must run only on the
  // client (Quill imports break during SSR) and only once per page load.
  useEffect(() => {
    let cancelled = false;
    import('react-quill-new').then((mod) => {
      if (cancelled) return;
      const Quill = mod.Quill || (mod.default && mod.default.Quill);
      if (!Quill) return;
      try {
        const Font = Quill.import('attributors/class/font');
        Font.whitelist = FONT_WHITELIST;
        Quill.register(Font, true);
      } catch {
        // Registration is idempotent-safe to fail silently on hot reload.
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Without this, Quill's default image button base64-encodes the picked file
  // directly into the article HTML. A single photo becomes 1-2MB+ of inline
  // text, and Firestore hard-caps a document at 1MB — so articles with a few
  // images silently fail to save (or hang) once that limit is crossed. If the
  // caller passes onImageUpload, we upload to Firebase Storage instead and
  // insert just the resulting URL, keeping the saved document tiny regardless
  // of how many images the article has.
  const imageHandler = useCallback(() => {
    if (!onImageUpload) return; // fall back to Quill's default (base64) behavior
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const editor = quillRef.current?.getEditor?.();
      const range = editor?.getSelection(true);
      const insertAt = range ? range.index : editor?.getLength() - 1 || 0;
      // Placeholder text so the writer sees something is happening instead of
      // a dead toolbar click while the upload is in flight.
      editor?.insertText(insertAt, 'Uploading image…', 'italic', true);
      try {
        const withTimeout = (promise, ms) =>
          Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), ms)),
          ]);
        const url = await withTimeout(onImageUpload(file), 20000);
        editor?.deleteText(insertAt, 'Uploading image…'.length);
        editor?.insertEmbed(insertAt, 'image', url, 'user');
        editor?.setSelection(insertAt + 1, 0);
      } catch (err) {
        editor?.deleteText(insertAt, 'Uploading image…'.length);
        console.error('Inline image upload failed:', err);
        alert(
          err?.message === 'Upload timed out'
            ? 'Image upload timed out after 20 seconds. This usually means a network or permissions issue with image storage — check your connection and try again, or contact your developer if it keeps happening.'
            : 'Image upload failed. Please try again.'
        );
      }
    };
  }, [onImageUpload]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarConfig,
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  return (
    <div className={dark ? 'bas-quill-dark' : 'bas-quill-light'}>
      <style dangerouslySetInnerHTML={{ __html: fontCss }} />
      <style dangerouslySetInnerHTML={{ __html: lightStyles }} />
      {dark && <style dangerouslySetInnerHTML={{ __html: darkStyles }} />}
      <ReactQuill ref={quillRef} theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} />
    </div>
  );
}
