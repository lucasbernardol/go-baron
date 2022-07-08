const spinnerElement = document.querySelector('[data-id="spinner"]');
const outputElement = document.querySelector('[data-id="output"]');

const feedbackForm = document.querySelector('[data-id="form"]');

const checkboxElements = document.querySelectorAll('input[type="checkbox"]');
const inputElments = document.querySelectorAll('input');
const textareaElements = document.querySelectorAll('textarea');

const API_PUBLIC_KEY = 'baron-18818k4e8l4yxcb6n';
const BASE_URL = '/api/v1';

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
    const mergedOptions = { method: 'PATCH', ...options };

    const apiResponse = await fetch(url, mergedOptions);

    const responseBodyInJSON = await apiResponse.json();

    return {
      responseBodyInJSON,
    };
  }
}

class Feedback {
  /**
   * @param {{
   *  formElement: HTMLFormElement;
   *  checkboxs: HTMLElement[];
   *  textareaElements: HTMLTextAreaElement[];
   *  inputElments: HTMLInputElement[];
   *  apiInstance: ApiRequest,
   * }} options
   **/
  constructor({
    formElement,
    checkboxs,
    inputElments,
    textareaElements,
    apiInstance,
  }) {
    this.checkboxs = Array.from(checkboxs);

    this.inputs = Array.from(inputElments);
    this.textareas = Array.from(textareaElements);

    this.formElement = formElement;
    this.api = apiInstance;
  }

  values() {
    const fieldsArray = [...this.checkboxs, ...this.inputs, ...this.textareas];

    const fields = fieldsArray.reduce((accumulator, element) => {
      let value = null;

      const HTML_ELEMENT_TYPE = element.getAttribute('type');

      switch (HTML_ELEMENT_TYPE) {
        case 'checkbox':
          value = element.checked;
          break;

        default:
          value = element.value || null;
      }

      const key = element.getAttribute('name');

      return { ...accumulator, [key]: value };
    }, {});

    return fields;
  }

  clearFields() {
    const fieldsArray = [...this.textareas, ...this.inputs];

    fieldsArray.forEach((element) => (element.value = null));
  }

  async execute(event) {
    const { submitter: buttonElement } = event;

    const fields = this.values();

    try {
      buttonElement.disabled = true;

      const url = `${BASE_URL}/feedbacks`;

      const { responseBodyInJSON } = await this.api.fetch(url, {
        method: 'POST',
        body: JSON.stringify(fields),
        headers: {
          'Content-type': 'application/json',
        },
      });

      console.log({ ...responseBodyInJSON });
    } catch (error) {
    } finally {
      this.clearFields();

      buttonElement.disabled = false;
    }
  }

  init() {
    this.formElement.addEventListener('submit', (event) => {
      event.preventDefault();

      this.execute(event);
    });
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
      const url = `${BASE_URL}/hits/up/${API_PUBLIC_KEY}`;

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

  const form = new Feedback({
    formElement: feedbackForm,
    checkboxs: checkboxElements,
    inputElments,
    textareaElements,
    apiInstance,
  });

  await view.execute();

  form.init();
}

window.addEventListener('load', () => App());
