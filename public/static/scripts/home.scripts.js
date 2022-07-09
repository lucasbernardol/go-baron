const spinnerElement = document.querySelector('[data-id="spinner"]');
const outputElement = document.querySelector('[data-id="output"]');

const feedbackForm = document.querySelector('[data-id="form"]');

const checkboxElements = document.querySelectorAll('input[type="checkbox"]');
const inputElments = document.querySelectorAll('input');
const textareaElements = document.querySelectorAll('textarea');

/**
 * Modals
 */
const DOMFeedbackModalOverlay = document.querySelector('[data-id="modal"]');

const DOMModalOpenButton = document.querySelector('[data-id="modal-floating"]');
const DOMModalCloseButton = document.querySelector('[data-id="modal-close"]');

const DOMModalTooltipOverlay = document.querySelector(
  '[data-id="tooltip-modal"]'
);

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
    const mergedOptions = {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      ...options,
    };

    const apiResponse = await fetch(url, mergedOptions);

    const responseBodyInJSON = await apiResponse.json();

    return {
      body: responseBodyInJSON,
    };
  }
}

class Modal {
  #common_css_class = 'hidden';

  get className() {
    return this.#common_css_class;
  }

  set className(className) {
    this.#common_css_class = className;
  }

  /** @param {{
   *   modals: [{
   *     key: string;
   *     overlay: string;
   *     isOpenned: boolean;
   *     timeoutHandleValue: number;
   *     onClose: () => void;
   *   }];
   *   className?: string;
   *   onChange: (data: object) => void;
   *  }} options */
  constructor({ modals, className, onChange } = {}) {
    this.modals = Array.from(modals);

    // Base: "hidden"
    if (className) this.className = className;

    // Callback function
    if (onChange) {
      this.hasCallback = true;
      this.onChange = onChange;
    }
  }

  overlayByKey(overlayKey) {
    function handleKey({ key }) {
      return key === overlayKey.trim();
    }

    const modal = this.modals.find((overlay) => handleKey(overlay));

    const modalIndex = this.modals.findIndex((overlay) => handleKey(overlay));

    ///if (!overlay) throw new Error(`Modal ERROR: "${overlayKey}"`);

    return { modal, modalIndex };
  }

  setOverlayStateByKey(key, data) {
    const { modal, modalIndex } = this.overlayByKey(key);

    const modalState = Object.assign({ ...modal }, data);

    this.modals[modalIndex] = modalState;

    return modalState;
  }

  #hasClassName(element, className = this.className) {
    return element.classList.contains(className);
  }

  /** utils */
  #removeClassName(element, className = this.className) {
    element.classList.remove(className);
  }

  #addClassName(element, className = this.className) {
    element.classList.add(className);
  }

  /**
   * - Callback function
   * @param {String} key
   * @param {Object} state
   */
  #onChangeCallbackHandleFunction(key, state) {
    if (this.hasCallback) {
      return this.onChange(key, state);
    }
  }

  open(key) {
    const { modal } = this.overlayByKey(key);

    const { overlay } = modal;

    const currentOverlayIsClosed = this.#hasClassName(overlay); // "hidden";

    if (currentOverlayIsClosed) {
      this.#removeClassName(overlay);

      const state = this.setOverlayStateByKey(key, { isOpenned: true });

      /** Callback function */
      this.#onChangeCallbackHandleFunction(key, state);
    }

    return this;
  }

  close(key) {
    const { modal } = this.overlayByKey(key);

    const { overlay, onClose } = modal; // HTMLElement

    const isModalOverlayOpnned = !this.#hasClassName(overlay);

    if (isModalOverlayOpnned) {
      this.#addClassName(overlay);

      const state = this.setOverlayStateByKey(key, { isOpenned: false });

      /** Callback function */
      const isCallBackFunction = onClose && typeof onClose === 'function';

      isCallBackFunction ? onClose() : null;

      this.#onChangeCallbackHandleFunction(key, state);
    }
  }

  automaticClosing(key, secondsToCloseOverlay = 5) {
    const { modal } = this.overlayByKey(key);

    const isModalOverlayClosed = modal.isOpenned;

    const handleCallbackClosing = (key) => this.close(key);

    if (isModalOverlayClosed) {
      const secondsToMilliseconds = Math.floor(secondsToCloseOverlay * 1000);

      setTimeout(() => {
        handleCallbackClosing(key);
      }, secondsToMilliseconds);
    }
  }
}

class Feedback {
  /**
   * @param {{
   *  formElement: HTMLFormElement;
   *  checkboxs: HTMLElement[];
   *  textareaElements: HTMLTextAreaElement[];
   *  inputElments: HTMLInputElement[];
   *  api: ApiRequest;
   *  modal: Modal;
   * }} options
   **/
  constructor({
    formElement,
    checkboxs,
    inputElments,
    textareaElements,
    api,
    modal,
  }) {
    this.checkboxs = Array.from(checkboxs);

    this.inputs = Array.from(inputElments);
    this.textareas = Array.from(textareaElements);

    this.formElement = formElement;

    this.api = api;
    this.modal = modal;
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

  async execute({ submitter: buttonElement }) {
    const fields = this.values();

    let isRequestError = false;

    try {
      buttonElement.disabled = true;

      const url = `${BASE_URL}/feedbacks`;

      const { body } = await this.api.fetch(url, {
        method: 'POST',
        body: JSON.stringify(fields),
      });

      console.log({ request: body });
    } catch (error) {
      isRequestError = true;

      alert('Ocorreu um erro. tente novamente.');
    } finally {
      // Close "form" modal.
      this.modal.close('feedback-modal');

      if (isRequestError) return;

      // Open tooltip/alert modal.
      this.modal.open('tooltip-modal').automaticClosing('tooltip-modal');

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
   *  api: ApiRequest,
   *  spinnerElement: HTMLElement,
   *  outputElement: HTMLElement,
   * }} options */
  constructor({ api, spinnerElement, outputElement }) {
    this.api = api;

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

      const { body } = await this.api.fetch(url, {
        method: 'PATCH',
      });

      const { hits } = body;

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
  const api = new ApiRequest();

  const view = new HitView({
    outputElement,
    spinnerElement,
    api,
  });

  // Modal Config
  const modal = new Modal({
    modals: [
      {
        key: 'feedback-modal',
        overlay: DOMFeedbackModalOverlay,
        isOpenned: false,
        timeoutHandleValue: null,
        onClose: () => form.clearFields(),
      },
      {
        key: 'tooltip-modal',
        overlay: DOMModalTooltipOverlay,
        isOpenned: false,
        timeoutHandleValue: null,
        onClose: () => {},
      },
    ],
    className: 'hidden',
    onChange: (key, state) => console.log({ key, state }),
  });

  const form = new Feedback({
    formElement: feedbackForm,
    checkboxs: checkboxElements,
    inputElments,
    textareaElements,
    api,
    modal,
  });

  /** Feedback Modal Events */
  DOMModalOpenButton.addEventListener('click', () =>
    modal.open('feedback-modal')
  );

  DOMModalCloseButton.addEventListener('click', () =>
    modal.close('feedback-modal')
  );

  /** Run && init */
  await view.execute();

  form.init();
}

window.addEventListener('load', () => App());
