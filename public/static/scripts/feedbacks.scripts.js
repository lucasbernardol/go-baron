const DOMFeedbacksListElement = document.querySelector(
  '[data-id="feedbacks-list"]'
);

const DOMFullscreenLoaderElement = document.querySelector(
  '[data-id="fullscreen-loader"]'
);

/** Constants  */
const TEMPLATE_SEPARATOR = ''; // join

const GITHUB_BASE_URL = 'https://github.com';
const BASE_AVATAR_URL =
  'https://www.gravatar.com/avatar/a46b49cef36d59dda408ca2bef8eff88?d=mp&s=200';

const API_RESORUCE_URL =
  '/api/v1/feedbacks/?sort=created_at&order=desc&limit=12'; // last feedbacks

const removeLoader = () => DOMFullscreenLoaderElement.remove();

const setHTMLTemplate = (template) =>
  (DOMFeedbacksListElement.innerHTML = template);

/** Functions */
async function fetchFeedbacks() {
  const response = await fetch(API_RESORUCE_URL, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const { feedbacks } = await response.json();

  return {
    feedbacks,
  };
}

function format(format, dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString(format, {
    year: '2-digit',
    day: '2-digit',
    month: 'short',
    weekday: 'long',
  });
}

/** @function  singleTemplate */
function singleTemplate(data) {
  const {
    id,
    title,
    github_username,
    long_description,
    avatar_url,
    author_name,
    created_at,
    is_critical,
  } = data;

  return `
    <div class="feedback__item ${
      is_critical ? 'bug' : ''
    }" data-feedback-id="${id}">

      <img class="feedback__image" src="${
        avatar_url ? avatar_url : BASE_AVATAR_URL
      }" alt="${author_name}" />
      
      <div class="feedback__content">
        <strong class="feedback__author">${author_name}</strong>
        <h2 class="feedback__title" title="${title}">${title}</h2>
        <p class="feedback__description">${long_description}</p>

        <a 
          class="feedback__github" 
          target="_blank" 
          href="${GITHUB_BASE_URL}/${github_username}"
        >
          <img src="/assets/github-icon.svg" alt="Github" /> Github
        </a>
      </div>

      <span class="feedback__time">${format('pt-BR', created_at)}</span>
    </div>
  `;
}

async function main() {
  try {
    const { feedbacks } = await fetchFeedbacks();

    const templates = feedbacks.map((feedback) => singleTemplate(feedback));

    const template = templates.join(TEMPLATE_SEPARATOR);

    // @TODO: 1 - Remove loader, 2 - add "HTML" template.
    removeLoader();

    setHTMLTemplate(template);
  } catch (error) {
    console.log(error);
  }
}

/** @function App  */
async function App() {
  await main();
}

window.addEventListener('load', () => App());
