import { OBJECTID_REGEXP } from '../constants/regexp.constants';

/** @function isObjectID */
export function isObjectID(idLike: string): boolean {
  return OBJECTID_REGEXP.test(idLike);
}
