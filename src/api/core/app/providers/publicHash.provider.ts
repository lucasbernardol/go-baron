import uniqueID from 'uniqid';

const prefixID = 'baron-';

/** @function publicHash */
export function hash(prefix = prefixID): string {
  return uniqueID(prefix);
}
