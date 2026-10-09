// SA7E COMMUNITY downloads — بيانات مشتركة عبر releases.json + لوحة أدمن
const ADMIN_USER = 'SA7E';
const ADMIN_HASH = 'e498e772e38357f1394671fe9d86f97c18da8ddaf98d5a5e20f1197c701b9642'; // SHA256('SA7E|SA7E-w6ulmqUXIM')

/* =====================================================================
   وين تروح تعديلاتك؟
   ---------------------------------------------------------------------
   releases.json  ← الملف المشترك. كل الزوار يقرونه. (عدّله من البانل)
   localStorage   ← مسودة محلية على جهازك أنت فقط، لين تنشرها.
   العداد محلي بملف منفصل (sa7e_dl) عشان ما يصير مسودة بالغلط.
   ===================================================================== */
const DATA_URL  = 'releases.json';
const DRAFT_KEY = 'sa7e_releases';
const DL_KEY    = 'sa7e_dl';

const seed = [
  { id: 'hax', title: 'SA7E Hax v4.6', version: 'v4.6', tag: 'HAX', desc: 'Best & smoothest Hax, optimized for weak devices.', feat: ['Full Customizable ESP', 'Full Skins (Hair, Hat, Face, Suits, Pets)', 'Full Memory Features'], file: 'sa7e-hax.rar', size: '969.97 KB', updated: 'September 12th, 2026', downloads: 835, url: '#' },
  { id: 'bypass', title: 'SA7E Bypass v4.6', version: 'v4.6', tag: 'BYPASS', desc: 'Lightweight and silent. Cuts through restrictions without noise.', feat: ['Safe On Main Account', 'Bypasses Emulator Check', 'Safe with ESP / Aimbot / Skins'], file: 'sa7e-bypass.rar', size: '5.01 MB', updated: 'September 12th, 2026', downloads: 633, url: '#' },
  { id: 'blocker', title: 'SA7E GameLoop Blocker', version: 'v2.0', tag: 'GAMELOOP', desc: 'Stop forced GameLoop updates. Firewall + file lock, one click.', feat: ['Block updater only', 'Full Shield mode', 'One-click restore'], file: 'GameLoopBlocker.exe', size: '64.4 MB', updated: 'October 8th, 2026', downloads: 0, url: '#' },
  { id: 'recorder', title: 'NVIDIA SA7E Recorder', version: 'v1.0', tag: 'RECORDER', desc: 'Screen recording for weak GPUs. Auto record + 15-min replay buffer.', feat: ['Auto record on open', 'Save last 15 minutes', 'Same-as-screen quality'], file: 'NvidiaSA7E.exe', size: '152 KB', updated: 'October 8th, 2026', downloads: 0, url: '#' },
];

const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return (v === null || v === undefined) ? fb : v; } catch { return fb; } };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let published = seed;  // النسخة المنشورة (من releases.json)
let data = seed;       // المعروض
let hasDraft = false;  // فيه مسودة محلية؟

async function loadPublished() {
  try {
    const res = await fetch(DATA_URL + '?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    if (Array.isArray(j) && j.length) { published = j; return true; }
  } catch (e) { console.warn('ما قدرت أقرأ ' + DATA_URL + ' — استخدمت النسخة الاحتياطية:', e.message); }
  return false;
}

const same = () => { try { return JSON.stringify(data) === JSON.stringify(published); } catch { return false; } };

function persistDraft() {
  hasDraft = !same();
  if (hasDraft) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) { console.warn(e); } }
  else localStorage.removeItem(DRAFT_KEY);
  syncBar();
}

const dlCount = (id) => (readJSON(DL_KEY, {})[id] | 0);

/* =========================== العرض =========================== */
const grid = document.getElementById('grid');
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = 1; io.unobserve(e.target); } }));

function render() {
  grid.innerHTML = '';
  data.forEach((r, i) => {
    const feats = Array.isArray(r.feat) ? r.feat : [];
    const d = document.createElement('div');
    d.className = 'card';
    d.style.animationDelay = (i * 0.08) + 's';
    d.innerHTML = `<span class="tag">${esc(r.tag || 'NEW')}</span><h3>${esc(r.title || '')}</h3><div class="ver">${esc(r.version || '')}</div>
      <p>${esc(r.desc || '')}</p><ul>${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <div class="meta">${esc(r.file || '')}<br>${esc(r.size || '')} · Updated ${esc(r.updated || '-')}<br>⬇ ${((r.downloads | 0) + dlCount(r.id))} downloads</div>
      <button class="dl" data-i="${i}">⬇ Download</button>`;
    grid.appendChild(d);
    io.observe(d);
  });
  document.querySelectorAll('.dl').forEach(b => b.onclick = () => {
    const r = data[+b.dataset.i];
    const box = readJSON(DL_KEY, {});
    box[r.id] = (box[r.id] | 0) + 1;
    try { localStorage.setItem(DL_KEY, JSON.stringify(box)); } catch {}
    render();
    if (r.url && r.url !== '#') window.open(r.url, '_blank');
  });
  document.getElementById('stCount').textContent = data.length;
  document.getElementById('stLatest').textContent = (data[0] && data[0].version) || '-';
  document.getElementById('stUpdated').textContent = (((data[0] && data[0].updated) || '-').split(',')[0]);
}
render();

/* ==================== شريط "تعديلاتك غير منشورة" ==================== */
const bar = document.getElementById('draftBar');
function syncBar() { if (bar) bar.classList.toggle('hidden', !hasDraft); }

document.getElementById('dbCopy').onclick = () => doCopy();
document.getElementById('dbDown').onclick = () => doDownload();
document.getElementById('dbBack').onclick = () => doDiscard();

function publishedJSONText() { return JSON.stringify(data, null, 2); }

function doCopy() {
  const txt = publishedJSONText();
  const done = () => alert('✅ تم النسخ.\n\nالحين الصق المحتوى بملف releases.json عندك بالبانل واحفظ — وبتشوفه كل الناس فوراً.');
  (navigator.clipboard && navigator.clipboard.writeText(txt) ? navigator.clipboard.writeText(txt).then(done) : Promise.reject())
    .catch(() => window.prompt('انسخ المحتوى يدوياً:', txt));
}
function doDownload() {
  const blob = new Blob([publishedJSONText()], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'releases.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function doDiscard() {
  if (!confirm('تجاهل تعديلاتك المحلية ورجوع للنسخة المنشورة عند الناس؟')) return;
  localStorage.removeItem(DRAFT_KEY);
  location.reload();
}

/* =========================== الأدمن =========================== */
const modal = document.getElementById('modal');
document.getElementById('adminBtn').onclick = () => { modal.classList.remove('hidden'); };
document.getElementById('mClose').onclick = () => modal.classList.add('hidden');
async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
document.getElementById('mOk').onclick = async () => {
  const u = document.getElementById('fUser').value.trim();
  const h = await sha(u + '|' + document.getElementById('fPass').value);
  if (u === ADMIN_USER && h === ADMIN_HASH) {
    modal.classList.add('hidden');
    document.querySelector('.hero').classList.add('hidden');
    document.getElementById('siteMain').classList.add('hidden');
    document.getElementById('adminView').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshList();
  } else alert('بيانات غلط');
};
document.getElementById('backBtn').onclick = () => {
  document.getElementById('adminView').classList.add('hidden');
  document.querySelector('.hero').classList.remove('hidden');
  document.getElementById('siteMain').classList.remove('hidden');
  render();
};

/* خانات نموذج التعديل */
const FIELDS = [
  ['title', '📝 اسم الإصدار (Title)', 'SA7E Hax v4.7'],
  ['version', '🔢 النسخة', 'v4.7'],
  ['tag', '🏷 التصنيف', 'HAX'],
  ['url', '🔗 رابط التحميل', 'https://...'],
  ['file', '📄 اسم الملف', 'sa7e-hax.rar'],
  ['size', '💾 الحجم', '969.97 KB'],
  ['desc', '📃 الوصف', 'وصف قصير بالإنجليزي'],
];

function refreshList() {
  const l = document.getElementById('eList');
  l.innerHTML = '';
  if (!data.length) { l.innerHTML = '<p style="color:var(--mut);text-align:center;padding:24px">ما فيه خانات — ضيف وحدة فوق.</p>'; return; }
  data.forEach((r, i) => {
    const d = document.createElement('div');
    d.className = 'editcard';
    const h = document.createElement('b'); h.textContent = r.title || '(بدون اسم)';
    d.appendChild(h);

    const g = document.createElement('div'); g.className = 'grid2';
    const inputs = {};
    FIELDS.forEach(([k, lab, ph]) => {
      const w = document.createElement('div'); w.className = 'fld';
      const L = document.createElement('label'); L.textContent = lab;
      const inp = document.createElement('input'); inp.placeholder = ph || ''; inp.value = r[k] || '';
      inputs[k] = inp;
      w.appendChild(L); w.appendChild(inp); g.appendChild(w);
    });
    if (inputs.desc) inputs.desc.closest('.fld').classList.add('full');

    const wf = document.createElement('div'); wf.className = 'fld full';
    const lf = document.createElement('label'); lf.textContent = '✨ المميزات (سطر لكل ميزة)';
    const ta = document.createElement('textarea'); ta.rows = 4; ta.value = (r.feat || []).join('\n');
    wf.appendChild(lf); wf.appendChild(ta); g.appendChild(wf);
    d.appendChild(g);

    const row = document.createElement('div'); row.className = 'row';
    const sv = document.createElement('button'); sv.textContent = '💾 حفظ';
    sv.onclick = () => {
      Object.keys(inputs).forEach(k => r[k] = inputs[k].value.trim());
      r.tag = (r.tag || 'NEW').toUpperCase();
      r.feat = ta.value.split('\n').map(s => s.trim()).filter(Boolean);
      persistDraft(); render(); refreshList();
      alert('✅ اتحفظ محلياً.\n\nعشان يشوفه الناس: اضغط "📋 نسخ releases.json" فوق، وارفع الملف من البانل.');
    };
    const del = document.createElement('button'); del.textContent = '🗑 حذف'; del.className = 'danger';
    del.onclick = () => { data.splice(i, 1); persistDraft(); render(); refreshList(); };
    row.appendChild(sv); row.appendChild(del); d.appendChild(row);

    l.appendChild(d);
  });
}

document.getElementById('eAdd').onclick = () => {
  const g = id => document.getElementById(id).value.trim();
  if (!g('eTitle')) return alert('Title لازم');
  data.unshift({
    id: 'r' + Date.now(),
    title: g('eTitle'),
    version: g('eVersion') || '-',
    tag: (g('eTag') || 'NEW').toUpperCase(),
    desc: g('eDesc'),
    feat: g('eFeat').split('\n').map(s => s.trim()).filter(Boolean),
    file: g('eFile'),
    size: g('eSize'),
    updated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    downloads: 0,
    url: g('eUrl') || '#',
  });
  ['eTitle', 'eVersion', 'eTag', 'eDesc', 'eFeat', 'eFile', 'eSize', 'eUrl'].forEach(id => document.getElementById(id).value = '');
  persistDraft(); render(); refreshList();
};

/* ==================== التشغيل ==================== */
(async function boot() {
  await loadPublished();
  const draft = readJSON(DRAFT_KEY, null);
  hasDraft = Array.isArray(draft);
  data = hasDraft ? draft : published;
  if (hasDraft && same()) { localStorage.removeItem(DRAFT_KEY); hasDraft = false; data = published; }
  render(); syncBar();
  if (hasDraft) console.warn('⚠ انت شايف مسودة محلية — الناس لسا ما تشوفها. انسخ releases.json وارفعه.');
})();
