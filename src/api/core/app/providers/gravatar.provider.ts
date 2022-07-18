import { createHash } from 'crypto';
import { GRAVATAR_URL } from '@shared/constants/url.constants';

type D = '404' | 'retro';

type URLOptions = {
  size?: number;
  d?: D;
};

type Md5Output = {
  hash: string;
  email: string;
};

/** @function md5 */
export function md5(email: string): Md5Output {
  const HASH_TYPE = 'md5';

  const hash = createHash(HASH_TYPE).update(email).digest('hex');

  return { hash, email };
}

export function url(email: string, options: URLOptions = {}): string {
  const { size = 400, d = 'retro' } = options;

  const { hash } = md5(email);

  /// Example: 'https://www.gravatar.com/avatar/hash/?s=400&d=retro'
  return `${GRAVATAR_URL}/${hash}/?s=${size}&d=${d}`;
}
