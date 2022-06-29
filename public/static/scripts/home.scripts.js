const spinnerElement = document.querySelector('[data-id="spinner"]');
const outputElement = document.querySelector('[data-id="output"]');

const API_PUBLIC_KEY = 'baron-18818k4e8l4yxcb6n';

const BASE_URL = '/api/v1/hits';

const delay = (delayInMilliseconds = 500) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      return resolve(null);
    }, delayInMilliseconds);
  });
};

class ApiRequest {
  _base_url = BASE_URL;

  constructor() {}

  /**
   * - Fecth wrapper
   * @param {Sring} url - "/api/v1/hits"
   * @param {RequestInit} options - Fetch options
   */
  async fetch(url = this._base_url, options) {
    const mergedOptions = { ...options, method: 'PATCH' };

    const apiResponse = await fetch(url, mergedOptions);

    const responseBodyInJSON = await apiResponse.json();

    return {
      responseBodyInJSON,
    };
  }
}

class HitView {
  _class = 'hidden';

  /** @param {{
   *  apiInstance: ApiRequest,
   *  spinnerElement: HTMLElement,
   *  outputElement: HTMLElement,
   * }} options */
  constructor({ apiInstance, spinnerElement, outputElement }) {
    this.apiInstance = apiInstance;

    this.spinnerElement = spinnerElement;
    this.outputElement = outputElement;
  }

  _removeClassName(element, className = this._class) {
    element.classList.remove(className);
  }

  _addClassName(element, className = this._class) {
    element.classList.add(className);
  }

  async setDOM({ hits }) {
    this.outputElement.textContent = hits.toLocaleString();

    // Fake delay/loader
    await delay(800);

    // Defualt: "hidden"
    this._addClassName(this.spinnerElement);
    this._removeClassName(this.outputElement);
  }

  async execute() {
    try {
      const url = `${BASE_URL}/up/${API_PUBLIC_KEY}`;

      const { responseBodyInJSON } = await this.apiInstance.fetch(url, {
        method: 'PATCH',
      });

      // Log/debug
      console.debug({ api: responseBodyInJSON });

      const { hits } = responseBodyInJSON;

      await this.setDOM({ hits });
    } catch (error) {
      console.log(error);

      return alert(
        'Ops, ocorreu um erro.\nTente atualizar a página!\n\nAtenciosamente: EQUIPE.'
      );
    }
  }
}

/** Main/Root */
async function App() {
  const apiInstance = new ApiRequest();

  const view = new HitView({
    apiInstance,
    outputElement,
    spinnerElement,
  });

  await view.execute();
}

window.addEventListener('load', () => App());
