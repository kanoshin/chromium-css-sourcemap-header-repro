// node server.js, then open http://localhost:8000 with DevTools open.
const http = require('http');

const files = {
    '/': ['text/html', '<link rel="stylesheet" href="/style.css"><script src="/script.js"></script><p>Check DevTools</p>'],
    '/style.css': ['text/css', 'p { color: red; }\n/*# sourceMappingURL=from-comment.css.map */\n', '/from-header.css.map'],
    '/script.js': ['text/javascript', 'console.log("generated");\n//# sourceMappingURL=from-comment.js.map\n', '/from-header.js.map'],
    '/from-header.css.map': ['application/json', JSON.stringify({ version: 3, sources: ['original.css'], sourcesContent: ['p { color: red; }'], names: [], mappings: 'AAAA' })],
    '/from-header.js.map': ['application/json', JSON.stringify({ version: 3, sources: ['original.js'], sourcesContent: ['console.log("original");'], names: [], mappings: 'AAAA' })],
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
}).listen(8000, () => console.log('http://localhost:8000'));
