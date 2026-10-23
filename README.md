# Chrome DevTools: a stylesheet's sourceMappingURL comment wins over its SourceMap header

For scripts, Chrome uses the `SourceMap` response header over a `sourceMappingURL` comment, as [ECMA-426 §11.1](https://tc39.es/ecma426/) requires. For stylesheets it does the opposite: the comment wins and the header is only used when there is no comment.

## Run

```sh
node server.js
```

Open http://localhost:8000 with DevTools open.

`style.css` and `script.js` are each served with a `SourceMap` header pointing at a valid map (`/from-header.*.map`), and each ends with a `sourceMappingURL` comment pointing at a map that doesn't exist (`from-comment.*.map`).

## Expected

Both files use the header's map.

## Actual (Chrome 148, 149, 155)

| File | Source map DevTools uses |
|---|---|
| `script.js` | `/from-header.js.map` (header) |
| `style.css` | `from-comment.css.map` (comment, fails to load) |

Seen via CDP: `Debugger.scriptParsed` → `sourceMapURL` and `CSS.styleSheetAdded` → `header.sourceMapURL`.

## Cause

`InspectorStyleSheet::SourceMapURL()` in `third_party/blink/renderer/core/inspector/inspector_style_sheet.cc` returns the magic comment when present and only falls back to the header value stored by `StyleSheetContents::ParseAuthorStyleSheet`.
