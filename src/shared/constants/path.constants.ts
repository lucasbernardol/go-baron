import { resolve } from 'path';

const FAVICON = 'hat.png';

// public/
//  static
//  views
const publicBaseDir = resolve(__dirname, '..', '..', '..', 'public');

export const STATIC_DIRECTORY = resolve(publicBaseDir, 'static');

export const ASSETS_DIRECTORY = resolve(STATIC_DIRECTORY, 'assets');

export const VIEWS_DIRECTORY = resolve(publicBaseDir, 'views');

export const HAT_FAVICON_PATH = resolve(ASSETS_DIRECTORY, 'icons', FAVICON);
