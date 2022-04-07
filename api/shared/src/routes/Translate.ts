/**
 * Gets a JSON string used for translation with i18n.
 * @param treePath The string location in the translation file JSON tree.
 * @param substitutions The substitutions for '{i}' occurences in the string found at 'treePath'.
 * @returns A JSON string containing the unformatted string path and the substitutions required to
 * make it a readable sentence.
 */
export const getJSON = (treePath: string, substitutions: string[]): string => {
  return `{"translate":"${treePath}","format":["${substitutions.join(
    '","'
  )}"]}`;
};
