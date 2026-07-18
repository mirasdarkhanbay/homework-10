// ============================================================
// script.js - L 7: JavaScript for the Browser
// Adds interactivity to the Lab 6 portfolio:
//   1) Theme toggle      2) Live character counter
//   3) Project/hobby filter    4) Debugging checkpoints
//
// Loaded with <script src="script.js" defer></script>, so this
// file always runs *after* the HTML has been fully parsed —
// no need to wrap anything in a DOMContentLoaded listener.
// ============================================================

// --- Part 2: select the elements we'll need ---------------------------
const themeBtn      = document.querySelector('#theme-toggle');
const themeLabel    = document.querySelector('#theme-toggle-label');
const msgInput      = document.querySelector('#message');
const counter       = document.querySelector('#char-counter');
const filterBtns    = document.querySelectorAll('.filter-btn');
const projectCards  = document.querySelectorAll('.project-card');

// const for elements that never change once selected.
// let for isDark — it WILL be reassigned every time the button is clicked.
let isDark = false;

// --- Part 3a: Theme toggle ---------------------------------------------
// A small function that flips the theme state and updates the DOM.
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('dark-mode', isDark);
  themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

themeBtn.addEventListener('click', () => {
  toggleTheme();
  console.log('Theme toggled:', isDark); // debug checkpoint
});

// --- Part 3b: Live character counter -----------------------------------
// Fires on every keystroke in the message textarea (the 'input' event).
msgInput.addEventListener('input', () => {
  const len = msgInput.value.length;
  counter.textContent = `${len}/1000`;
  console.log('Char count:', len); // debug checkpoint
});

// --- Part 3c: Project / hobby filter ------------------------------------
// Each filter button carries data-category; each hobby card carries a
// matching data-category. Clicking a button shows only matching cards.
filterBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    // Part 4: deliberate breakpoint — pauses execution here while
    // DevTools is open. Inspect e.target and category in the Scope panel,
    // then step over to watch the filtering happen line by line.
    //
    // NOTE FOR SUBMISSION: the lab's grading rubric awards points for
    // having a debugger; statement, but the "before you submit" checklist
    // asks for none left active. Demonstrate it while DevTools is open
    // during testing, then comment out the line below before your final
    // submission and mention in your notes where/why you used it.
    //debugger;

    const category = e.target.dataset.category;
    console.log('Filtering by:', category); // debug checkpoint

    // Highlight whichever button is currently active
    filterBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');

    // Show/hide project cards depending on the chosen category
    projectCards.forEach((card) => {
      const show = category === 'all' || card.dataset.category === category;
      card.classList.toggle('d-none', !show);
    });
  });
});

// console.table() checkpoint — the fastest way to inspect an array of
// objects while debugging (per the lab's DevTools checklist).
console.table(
  Array.from(projectCards).map((card) => ({
    title: card.querySelector('.card-title')?.textContent.trim(),
    category: card.dataset.category,
  }))
);

// --- Bonus: Active nav highlight -----------------------------------------
// Not shown in the lecture's code samples, but listed in the lab's
// "Before You Submit — Interactivity & UX" checklist: "Active nav link
// updates correctly without a page reload." Uses IntersectionObserver to
// toggle an 'active' class on the nav-link matching whichever section is
// currently in view — no scroll-event math needed.
const navLinks = document.querySelectorAll('#main-nav .nav-link[href^="#"]');
const sections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
          console.log('Active section:', id); // debug checkpoint
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' } // triggers around the vertical middle of the viewport
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// --- Startup checkpoint --------------------------------------------------
console.log('script.js loaded — theme toggle, character counter, project filter, and nav highlight are wired up.');

// ============================================================
// L8: JavaScript in the Browser — Continued
// Data-driven "My Projects" section: createElement/insertAdjacentHTML,
// setInterval, JSON.stringify/parse + localStorage.
// This is a separate section from the static Hobbies grid above —
// it does not touch projectCards/filterBtns, which stay Lecture 7's.
// ============================================================

const PROJECTS_KEY = 'portfolio-projects';

const defaultMyProjects = [
  { id: 1, title: 'Fundamentals-of-WEB-technologies', description: 'Main coursework repo for the Fundamentals of Web Technologies course', category: 'web' },
  { id: 2, title: 'homework-3', description: 'HTML/CSS layout assignment — Lecture 3', category: 'web' },
  { id: 3, title: 'homework-4', description: 'HTML/CSS assignment — Lecture 4', category: 'web' },
  { id: 4, title: 'homework-5', description: 'HTML/CSS assignment — Lecture 5', category: 'web' },
  { id: 5, title: 'homework-6', description: 'Contact form with client-side validation — Lecture 6', category: 'web' },
  { id: 6, title: 'hw7', description: 'Theme toggle, character counter, project filter — Lecture 7', category: 'web' },
];

// --- Load/save helpers -------------------------------------------------
function loadMyProjects() {
  try {
    const saved = localStorage.getItem(PROJECTS_KEY);
    return saved ? JSON.parse(saved) : defaultMyProjects;
  } catch (err) {
    // JSON.parse throws on corrupted data — never let that crash the page
    console.warn('Could not parse saved projects, falling back to defaults:', err);
    return defaultMyProjects;
  }
}

function saveMyProjects(list) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
}

let myProjects = loadMyProjects();
let activeProjectFilter = 'all';

// safeRender(): escape text before it goes into insertAdjacentHTML — never
// trust raw input. Defined here (rather than down in the L9 section) so
// both the L8 "My Projects" grid and the L9 comments list share the same
// single escaping function, instead of two functions doing the same thing.
function safeRender(text) {
  const div = document.createElement('div');
  div.textContent = text; // any '<', '>', '&' etc. get escaped here
  return div.innerHTML;   // e.g. '<img src=x onerror=alert(1)>' -> '&lt;img ...&gt;'
}

// --- Element references --------------------------------------------------
const projectGrid       = document.querySelector('#project-grid');
const projectEmpty      = document.querySelector('#project-empty');
const projectFilterBar  = document.querySelector('#project-filter-bar');
const addProjectForm    = document.querySelector('#add-project-form');
const projectTitleInput = document.querySelector('#project-title');
const projectDescInput  = document.querySelector('#project-desc');
const projectDescCount  = document.querySelector('#project-desc-counter');
const projectCatInput   = document.querySelector('#project-category');

// --- Render the filter bar from whatever categories currently exist -----
function renderProjectFilterBar() {
  const categories = ['all', ...new Set(myProjects.map((p) => p.category))];
  projectFilterBar.innerHTML = ''; // rebuilt from data every time

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-primary filter-btn' + (cat === activeProjectFilter ? ' active' : '');
    btn.dataset.category = cat;
    btn.textContent = cat === 'all' ? 'All' : cat;
    btn.addEventListener('click', () => {
      activeProjectFilter = cat;
      renderProjectFilterBar();
      renderMyProjects();
      console.log('Filtering projects by:', cat); // debug checkpoint
    });
    projectFilterBar.append(btn);
  });
}

// --- Render the project grid from the data array ------------------------
function renderMyProjects() {
  projectGrid.innerHTML = ''; // clear before re-render, page always matches data

  const visible = activeProjectFilter === 'all'
    ? myProjects
    : myProjects.filter((p) => p.category === activeProjectFilter);

  projectEmpty.hidden = visible.length > 0;

  visible.forEach((p) => {
    const col = document.createElement('div');
    col.className = 'col';
    col.insertAdjacentHTML('beforeend', `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <span class="badge bg-primary-subtle text-primary-emphasis align-self-start mb-2">${safeRender(p.category)}</span>
          <h5 class="card-title">${safeRender(p.title)}</h5>
          <p class="card-text flex-grow-1">${safeRender(p.description)}</p>
        </div>
      </div>
    `);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-sm btn-outline-danger m-3 mt-0';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      myProjects = myProjects.filter((item) => item.id !== p.id);
      saveMyProjects(myProjects);
      renderProjectFilterBar();
      renderMyProjects();
      console.log('Removed project', p.id); // debug checkpoint
    });

    col.querySelector('.card-body').append(removeBtn);
    projectGrid.append(col);
  });

  console.log('Rendered', visible.length, 'project(s)'); // debug checkpoint
}

// --- Live character counter for the project description field ----------
projectDescInput.addEventListener('input', () => {
  projectDescCount.textContent = `${projectDescInput.value.length}/140`;
});

// --- Add-project form: push a new object, save, re-render ---------------
addProjectForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newProject = {
    id: Date.now(),
    title: projectTitleInput.value.trim(),
    description: projectDescInput.value.trim(),
    category: projectCatInput.value.trim().toLowerCase() || 'misc',
  };

  myProjects.push(newProject);
  saveMyProjects(myProjects);
  renderProjectFilterBar();
  renderMyProjects();
  addProjectForm.reset();
  projectDescCount.textContent = '0/140';

  console.log('Added project:', newProject); // debug checkpoint
});

// --- Live "last updated" clock — a single interval ------------------------
const lastUpdatedEl = document.querySelector('#last-updated');
const clockId = setInterval(() => {
  lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}, 1000);
window.addEventListener('beforeunload', () => clearInterval(clockId));

// --- Initial render --------------------------------------------------------
renderProjectFilterBar();
renderMyProjects();

// ============================================================
// L9: HTTP Headers, Cookies & Web Security Basics
//   Part 1 — visitorName cookie (set/get)
//   Part 2 — logResponseHeaders(): inspect Content-Type & Cache-Control
//   Part 3 — safeRender(): escape user text before it touches innerHTML
//   Part 4 — greetReturningVisitor(): welcome banner driven by the cookie
// ============================================================

const COOKIE_NAME = 'visitorName';

// --- Part 1: set/read the visitor cookie ---------------------------------
function setVisitorCookie(name) {
  // encodeURIComponent so a name with spaces/commas can't break the
  // "name=value; attr; attr" cookie string format.
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(name)}; max-age=2592000; path=/`;
}

function getVisitorCookie() {
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// --- Part 4: greet a returning visitor, or ask a first-timer for a name --
function greetReturningVisitor() {
  const banner = document.querySelector('#greeting');
  if (!banner) return;

  const name = getVisitorCookie();

  if (name) {
    banner.textContent = `Welcome back, ${name}!`;
    banner.hidden = false;
  } else {
    const input = prompt("First time here — what's your name?");
    if (input && input.trim()) {
      setVisitorCookie(input.trim());
      banner.textContent = `Nice to meet you, ${input.trim()}!`;
      banner.hidden = false;
    }
  }

  console.log('Visitor cookie:', getVisitorCookie()); // debug checkpoint
}

// --- Part 2: fetch a resource purely to inspect its response headers -----
async function logResponseHeaders(url) {
  try {
    const res = await fetch(url);
    console.log('Content-Type:', res.headers.get('Content-Type'));
    console.log('Cache-Control:', res.headers.get('Cache-Control'));
  } catch (err) {
    // Most likely cause: opening index.html directly as a file:// URL
    // instead of through a local server, so fetch() has nothing to hit.
    console.warn('logResponseHeaders: could not fetch', url, err);
  }
}

// --- Part 3: safeRender() is already defined above (shared with the L8
// "My Projects" grid) — the one function every piece of user text passes
// through before it touches innerHTML.

// --- Comments: small demo of safeRender() in action -----------------------
// Stored in localStorage so the list survives a reload, same pattern as
// the L8 "My Projects" section above.
const COMMENTS_KEY = 'portfolio-comments';

function loadComments() {
  try {
    const saved = localStorage.getItem(COMMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.warn('Could not parse saved comments, starting fresh:', err);
    return [];
  }
}

function saveComments(list) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(list));
}

let comments = loadComments();

const commentForm  = document.querySelector('#comment-form');
const commentInput = document.querySelector('#comment-input');
const commentList  = document.querySelector('#comment-list');
const commentEmpty = document.querySelector('#comment-empty');

function renderComments() {
  if (!commentList) return;

  commentList.innerHTML = ''; // clear before re-render, page always matches data
  commentEmpty.hidden = comments.length > 0;

  comments.forEach((c) => {
    const p = document.createElement('p');
    p.className = 'comment-item';
    // The only spot user-typed text reaches the DOM as markup — and it
    // always goes through safeRender() first, so a pasted <script> or
    // onerror payload comes out as visible text, never executable HTML.
    p.insertAdjacentHTML('beforeend', safeRender(c.text));
    commentList.append(p);
  });

  console.log('Rendered', comments.length, 'comment(s)'); // debug checkpoint
}

if (commentForm) {
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = commentInput.value.trim();
    if (!text) return;

    comments.push({ id: Date.now(), text });
    saveComments(comments);
    renderComments();
    commentForm.reset();

    console.log('Added comment safely:', text); // debug checkpoint
  });
}

renderComments();

// --- L9 startup: greet the visitor and log headers from a real fetch -----
// script.js is loaded with `defer`, so it already runs after the DOM is
// parsed — but DOMContentLoaded hasn't *fired* yet at this point, so a
// listener added here still runs at the right time (matches the lecture's
// pattern exactly).
window.addEventListener('DOMContentLoaded', () => {
  greetReturningVisitor();
});

// create data/projects.json in the project folder first, then serve the
// site through a local server (e.g. VS Code Live Server / `python -m
// http.server`) — opening index.html as a file:// URL means fetch() has
// no HTTP response to read headers from.
logResponseHeaders('/data/projects.json');

// ============================================================
// L10: Client-Side Storage & Asynchronous Requests
//   Part 1/2 — fetchWithTimeout() + fetchProjects(): a real REST call
//              (GitHub's repos endpoint) via fetch()/async-await, aborted
//              after 5s if it never responds.
//   Part 3    — loadProjects(): try/catch around the fetch chain, caches
//              a successful result in localStorage, falls back to the
//              cached copy (via showError()) if a later fetch fails.
//   Part 4    — render on page load, plus an 'offline' listener.
// This is a separate "GitHub Projects (Live)" section — it does not touch
// myProjects/projectGrid, which stay the manual CRUD demo from Lecture 8/9.
// ============================================================

const GITHUB_USERNAME   = 'mirasdarkhanbay';
const GITHUB_CACHE_KEY  = 'github-projects-cache';
const TIMEOUT_MS        = 5000;

const githubStatusEl   = document.querySelector('#github-status');
const githubProjectList = document.querySelector('#github-project-list');

// --- Part 1: wrap fetch() with an AbortController-based timeout ----------
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer); // always clear it — success, HTTP error, or abort
  }
}

// --- Part 2: call the GitHub REST API and shape the response -------------
async function fetchProjects() {
  const res = await fetchWithTimeout(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);

  // fetch() only rejects on network failure — a 404/403/500 still resolves,
  // so a bad status has to be promoted into a thrown error by hand.
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const repos = await res.json();
  return repos.map((r) => ({
    title: r.name,
    description: r.description || 'No description provided.',
    url: r.html_url,
  }));
}

// --- Part 3: try live data first, fall back to the cache on failure ------
async function loadProjects() {
  try {
    const data = await fetchProjects();
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Fetch failed:', err.message); // debug checkpoint

    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (cached) {
      showError('Live fetch failed — showing saved data.');
      return JSON.parse(cached);
    }
    showError('Could not load projects.');
    return [];
  }
}

function showError(message) {
  githubStatusEl.textContent = message;
  console.log('Status:', message); // debug checkpoint
}

// --- Part 4: render whatever loadProjects() resolves with -----------------
function renderProjects(data) {
  if (!githubProjectList) return;
  githubProjectList.innerHTML = '';

  data.forEach((p) => {
    const col = document.createElement('div');
    col.className = 'col';
    // safeRender() — same escaping function from Lecture 9 — so a repo
    // name/description can never inject markup, even though it comes
    // from a real external API response.
    col.insertAdjacentHTML('beforeend', `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${safeRender(p.title)}</h5>
          <p class="card-text flex-grow-1">${safeRender(p.description)}</p>
          ${p.url ? `<a href="${safeRender(p.url)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary align-self-start">View on GitHub</a>` : ''}
        </div>
      </div>
    `);
    githubProjectList.append(col);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  showError('Loading...');
  const projects = await loadProjects(); // showError() may already have replaced this text
  if (githubStatusEl.textContent === 'Loading...') {
    githubStatusEl.textContent = '';
  }
  renderProjects(projects);
  console.log('Rendered', projects.length, 'GitHub project(s)'); // debug checkpoint
});

// Fires automatically if the network drops while the page is open —
// separate from the timeout path, which only fires on a stalled request.
window.addEventListener('offline', () => {
  showError('You are offline — showing cached data.');
});
