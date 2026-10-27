// node server.js, then open http://localhost:8000 with DevTools open.
// Every map is valid and names its original file after where it was linked from,
// so DevTools shows which link it followed.
const http = require('http');

const PORT = Number(process.env.PORT ?? 8000);

function map(source, content) {
    return ['application/json', JSON.stringify({ version: 3, sources: [source], sourcesContent: [content], names: [], mappings: 'AAAA' })];
}

const files = {
    '/': ['text/html', '<link rel="stylesheet" href="/style.css"><script src="/script.js"></script><p>Check DevTools</p>'],
    '/style.css': ['text/css', 'p { color: red; }\n/*# sourceMappingURL=from-comment.css.map */\n', '/from-header.css.map'],
    '/script.js': ['text/javascript', 'console.log("generated");\n//# sourceMappingURL=from-comment.js.map\n', '/from-header.js.map'],
    '/from-header.css.map': map('linked-by-header.css', 'p { color: red; }'),
    '/from-comment.css.map': map('linked-by-comment.css', 'p { color: red; }'),
    '/from-header.js.map': map('linked-by-header.js', 'console.log("generated");'),
    '/from-comment.js.map': map('linked-by-comment.js', 'console.log("generated");'),
};

http.createServer((req, res) => {
    const file = files[req.url];
    if (!file) {
        res.writeHead(404).end();
        return;
    }
    const [type, body, sourceMap] = file;
    res.writeHead(200, { 'Content-Type': type, ...(sourceMap && { SourceMap: sourceMap }) });
    res.end(body);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
