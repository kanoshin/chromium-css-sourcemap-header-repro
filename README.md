# Chrome DevTools: a stylesheet's sourceMappingURL comment wins over its SourceMap header

For scripts, Chrome uses the `SourceMap` response header over a `sourceMappingURL` comment, as [ECMA-426 §11.1](https://tc39.es/ecma426/) requires. For stylesheets it does the opposite: the comment wins and the header is only used when there is no comment.

## Run

```sh
node server.js
```

Open http://localhost:8000 with DevTools open.

`style.css` and `script.js` are each served with a `SourceMap` header (`/from-header.*.map`) and each ends with a `sourceMappingURL` comment (`from-comment.*.map`). All four maps are valid. Each names its original file after the link that led to it (`linked-by-header.*` or `linked-by-comment.*`), and that file starts with a comment saying so. So whichever file DevTools shows or opens is the link it followed.

## Expected

Both files use the header's map.

## Actual (Chrome 148, 149, 155, 156)

| File | Source map DevTools uses |
|---|---|
| `script.js` | `/from-header.js.map` (header) |
| `style.css` | `from-comment.css.map` (comment) |

Where to see it in DevTools:

- **Console:** the `generated` message links to `linked-by-header.js`; clicking it opens a file that starts with `// Linked by the SourceMap header`.
- **Elements → Styles:** the `p { color: red; }` rule links to `linked-by-comment.css`; clicking it opens a file that starts with `/* Linked by the sourceMappingURL comment */`.
- **Sources:** under Authored, the tree lists `linked-by-header.js` and `linked-by-comment.css`.

Through CDP: `Debugger.scriptParsed` → `sourceMapURL` is `/from-header.js.map`, and `CSS.styleSheetAdded` → `header.sourceMapURL` is `from-comment.css.map`. Server logs aren't a reliable signal: DevTools may fetch every linked map, including the one it doesn't use.

Set `PORT` to serve on another port (default 8000).

## Cause

`InspectorStyleSheet::SourceMapURL()` in `third_party/blink/renderer/core/inspector/inspector_style_sheet.cc` returns the magic comment when present and only falls back to the header value stored by `StyleSheetContents::ParseAuthorStyleSheet`.
