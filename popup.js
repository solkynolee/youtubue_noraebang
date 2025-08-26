
const $ = (sel) => document.querySelector(sel);
const favKey = 'karaoke_favorites';
const optKey = 'karaoke_options';

function buildQuery(base, karaokeOnly, lang) {
  let q = base.trim();
  if (!q) return '';
  if (karaokeOnly) q += ' karaoke instrumental 노래방';
  if (lang === 'ko') q += ' 노래방';
  else if (lang === 'ja') q += ' カラオケ';
  // en -> no extra
  return q;
}

async function doSearch() {
  const base = $('#query').value;
  const karaokeOnly = $('#karaokeOnly').checked;
  const lang = $('#lang').value;
  const full = buildQuery(base, karaokeOnly, lang);
  if (!full) return;

  // Save options (for next time)
  chrome.storage.local.set({ [optKey]: { karaokeOnly, lang } });

  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(full);
  const tab = await chrome.tabs.create({ url });

  // The content script on results will auto-click the top result.
}

function renderFavorites(items) {
  const ul = $('#favList');
  ul.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = it.label;
    const playBtn = document.createElement('button');
    playBtn.textContent = '재생';
    playBtn.addEventListener('click', () => {
      $('#query').value = it.base;
      doSearch();
    });
    const delBtn = document.createElement('button');
    delBtn.textContent = 'X';
    delBtn.addEventListener('click', async () => {
      const fresh = (await chrome.storage.local.get(favKey))[favKey] || [];
      const next = fresh.filter(x => !(x.base === it.base && x.lang === it.lang && x.karaokeOnly === it.karaokeOnly));
      await chrome.storage.local.set({ [favKey]: next });
      renderFavorites(next);
    });

    li.appendChild(span);
    li.appendChild(playBtn);
    li.appendChild(delBtn);
    ul.appendChild(li);
  }
}

async function loadFavorites() {
  const data = await chrome.storage.local.get([favKey, optKey]);
  const favs = data[favKey] || [];
  renderFavorites(favs);
  const opts = data[optKey] || { karaokeOnly: true, lang: 'ko' };
  $('#karaokeOnly').checked = opts.karaokeOnly;
  $('#lang').value = opts.lang;
}

async function addFavorite() {
  const base = $('#query').value.trim();
  if (!base) return;
  const karaokeOnly = $('#karaokeOnly').checked;
  const lang = $('#lang').value;
  const label = base;

  const data = await chrome.storage.local.get(favKey);
  const favs = data[favKey] || [];
  // Avoid duplicates
  if (!favs.some(x => x.base === base && x.lang === lang && x.karaokeOnly === karaokeOnly)) {
    favs.unshift({ base, karaokeOnly, lang, label });
    await chrome.storage.local.set({ [favKey]: favs.slice(0, 200) });
    renderFavorites(favs.slice(0, 200));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
  $('#btnSearch').addEventListener('click', doSearch);
  $('#query').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  $('#btnAddFav').addEventListener('click', addFavorite);
  $('#btnRemoveFav').addEventListener('click', async () => {
    // Remove by exact text match from favorites list (selected text not tracked in simple UI)
    // Instead, remove the item that matches current query/options
    const base = $('#query').value.trim();
    const karaokeOnly = $('#karaokeOnly').checked;
    const lang = $('#lang').value;
    const data = await chrome.storage.local.get(favKey);
    const favs = data[favKey] || [];
    const next = favs.filter(x => !(x.base === base && x.lang === lang && x.karaokeOnly === karaokeOnly));
    await chrome.storage.local.set({ [favKey]: next });
    renderFavorites(next);
  });
});
