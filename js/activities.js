(function () {
  const url = window.IMAN_SUPABASE_URL, key = window.IMAN_SUPABASE_KEY;
  const status = document.getElementById('activity-status');
  const list = document.getElementById('activity-list');
  const empty = document.getElementById('activity-empty');
  if (!url || url.startsWith('PASTE_') || !key || key.startsWith('PASTE_')) {
    status.textContent = 'Galeri belum disambungkan ke pangkalan data. Sediakan Supabase dahulu.';
    empty.hidden = false; return;
  }
  const sb = window.supabase.createClient(url, key);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function fmtDate(v) {
    if (!v) return '';
    return new Intl.DateTimeFormat('ms-MY', {day:'numeric', month:'long', year:'numeric'}).format(new Date(v+'T00:00:00'));
  }
  async function load() {
    const { data, error } = await sb.from('events').select('id,title,event_date,location,category,description,cover_image').order('event_date',{ascending:false});
    if (error) { status.textContent='Galeri tidak dapat dimuat buat masa ini.'; console.error(error); return; }
    status.hidden = true;
    if (!data || !data.length) { empty.hidden=false; return; }
    const html = data.map(e => {
      const cover = e.cover_image ? sb.storage.from('activity-photos').getPublicUrl(e.cover_image).data.publicUrl : 'images/logo.png';
      return `<article class="activity-card"><a href="aktiviti-detail.html?id=${encodeURIComponent(e.id)}" class="activity-cover"><img src="${esc(cover)}" alt="${esc(e.title)}" loading="lazy"></a>
      <div class="activity-body"><span class="tag">${esc(e.category || 'Aktiviti')}</span><h3><a href="aktiviti-detail.html?id=${encodeURIComponent(e.id)}">${esc(e.title)}</a></h3>
      <div class="meta">${esc(fmtDate(e.event_date))}${e.location ? ' · '+esc(e.location) : ''}</div><p>${esc(e.description || '')}</p>
      <a class="text-link" href="aktiviti-detail.html?id=${encodeURIComponent(e.id)}">Lihat galeri →</a></div></article>`;
    }).join('');
    list.innerHTML = html;
  }
  load();
})();