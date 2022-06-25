import { resolve } from 'path';

// public/
//  static
//  views
const publicBaseDir = resolve(__dirname, '..', '..', '..', 'public');

export const STATIC_DIRECTORY = resolve(publicBaseDir, 'static');

export const VIEWS_DIRECTORY = resolve(publicBaseDir, 'views');
