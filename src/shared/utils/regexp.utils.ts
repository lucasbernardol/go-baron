/**
 * - MongoDB
 * @function likeRegexpOperator
 **/
export function likeRegexpOperator(content: string): RegExp {
  return new RegExp(`${content}`, 'i');
}
