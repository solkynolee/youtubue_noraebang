
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'karaokeSearch',
    title: 'Karaoke로 유튜브 검색: "%s"',
    contexts: ['selection']
  });
});

function buildQuery(base, karaokeOnly, lang) {
  let q = base.trim();
  if (!q) return '';
  if (karaokeOnly) q += ' karaoke instrumental 노래방';
  if (lang === 'ko') q += ' 노래방';
  else if (lang === 'ja') q += ' カラオケ';
  return q;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'karaokeSearch' && info.selectionText) {
    const data = await chrome.storage.local.get('karaoke_options');
    const opts = data['karaoke_options'] || { karaokeOnly: true, lang: 'ko' };
    const full = buildQuery(info.selectionText, opts.karaokeOnly, opts.lang);
    if (!full) return;
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(full);
    chrome.tabs.create({ url });
  }
});

// Commands: open popup (Chrome doesn't allow programmatically opening the popup UI)
// We'll open a lightweight help page instead (or do nothing). Here we do nothing.
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_popup') {
    // No-op: Popup opens via browser UI when clicking the icon.
  }
});
