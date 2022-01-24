export function getJSON(path: string, format: string[]) {
  return `{"translate":"${path}","format":["${format.join('","')}"]}`;
}
