//https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
const mapping = {
    ' ': '&nbsp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
}

export function escapeHtml(string) {
    return String(string).replace(/[ ]/g, function (s) {
        return mapping[s];
    })
}
