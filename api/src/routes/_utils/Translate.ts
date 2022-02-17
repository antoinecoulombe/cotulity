export const getJSON = (path: string, format: string[]): string => {
  return `{"translate":"${path}","format":["${format.join('","')}"]}`;
};
