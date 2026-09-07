'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
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
  // Upload progress lives in React state and renders OUTSIDE the editor.
  //
  // The previous approach inserted a "Uploading image…" placeholder into the
  // document, waited for the upload, then deleted that text and inserted the
  // image at the remembered index. That meant three edits spread across an
  // async gap on a CONTROLLED ReactQuill: the placeholder insert fired
  // onChange, the parent re-rendered, Quill reset its contents from the new
  // value prop, and by the time the upload resolved the delete/insert no
  // longer landed where expected — leaving the placeholder stranded in the
  // saved article. Now the editor is touched exactly once, after the upload
  // has already succeeded.
  const [uploadingImage, setUploadingImage] = useState(false);

  const imageHandler = useCallback(() => {
    if (!onImageUpload) return; // fall back to Quill's default (base64) behavior
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    // Capture the cursor BEFORE the file dialog steals focus. getLength()
    // counts Quill's implicit trailing newline, so the last valid insert
    // position is getLength() - 1.
    const endIndex = Math.max(editor.getLength() - 1, 0);
    const savedIndex = editor.getSelection()?.index ?? endIndex;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');
    input.onchange = async () => {
      const file = input.files?.[0];
      console.log('[BAS image] 1. file picked:', file?.name, file?.type, file?.size);
      if (!file) return;

      // iPhones hand over .heic by default. It uploads fine but no browser can
      // render it in an <img>, so the article would show a broken image with
      // no clue why.
      if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
        alert(
          'This looks like an iPhone HEIC photo, which browsers can\u2019t display on a web page.\n\n' +
          'On iPhone: Settings \u2192 Camera \u2192 Formats \u2192 "Most Compatible" to shoot JPEG, ' +
          'or open the photo and export/share it as JPEG first.'
        );
        return;
      }

      setUploadingImage(true);
      console.log('[BAS image] 2. starting upload…');
      try {
        const withTimeout = (promise, ms) =>
          Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), ms)),
          ]);
        const url = await withTimeout(onImageUpload(file), 20000);
        console.log('[BAS image] 3. upload finished. URL =', url);
        if (!url) throw new Error('Upload returned no URL');

        // Re-read the editor: the component may have re-rendered while the
        // upload was in flight, and the index must be valid against the
        // document as it exists NOW, not as it was when the picker opened.
        const live = quillRef.current?.getEditor?.();
        console.log('[BAS image] 4. editor available?', !!live);
        if (!live) throw new Error('Editor is no longer available');
        const at = Math.min(savedIndex, Math.max(live.getLength() - 1, 0));
        console.log('[BAS image] 5. inserting at index', at, 'of length', live.getLength());

        live.insertEmbed(at, 'image', url, 'user');
        console.log('[BAS image] 6. insertEmbed done. New length =', live.getLength());
        console.log('[BAS image] 7. does HTML now contain an <img>?', /<img/i.test(live.root.innerHTML));
        try {
          live.setSelection(at + 1, 0);
        } catch (e) {
          console.warn('Could not restore cursor after image insert:', e);
        }
      } catch (err) {
        console.error('Inline image upload failed:', err);
        alert(
          err?.message === 'Upload timed out'
            ? 'Image upload timed out after 20 seconds. Check your connection and try again.'
            : `Image upload failed: ${err?.message || 'unknown error'}`
        );
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
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
      {uploadingImage && (
        <div className="flex items-center gap-2 px-3 py-2 mb-1 text-sm text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <span className="inline-block w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          Uploading image…
        </div>
      )}
      <ReactQuill ref={quillRef} theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} />
    </div>
  );
}
