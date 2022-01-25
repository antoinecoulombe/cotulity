"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSON = void 0;
function getJSON(path, format) {
    return `{"translate":"${path}","format":["${format.join('","')}"]}`;
}
exports.getJSON = getJSON;
