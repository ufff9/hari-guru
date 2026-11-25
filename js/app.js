/* =========================================================
   Selamat Hari Guru Nasional – logika halaman
   Semua isi (teks, foto, lagu, pesan, rapor) diatur di
   /data/config.json, jadi kode ini tidak perlu diubah.
   ========================================================= */

const $ = (s) => document.querySelector(s);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const buzz = (p) => { if (!reduceMotion && navigator.vibrate) navigator.vibrate(p); };

/* ---------- 1. Isi halaman dari config.json ---------- */
async function loadConfig() {
  const res = await fetch("/data/config.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("config tidak ditemukan");
  return res.json();
}

function fill(c) {
  if (c.judul) document.title = c.judul;
  if (c.tanggal) $("#tanggal").textContent = c.tanggal;
  if (c.untuk) $("#untuk").textContent = `Terima kasih, ${c.untuk}`;

  renderPhotos(c.foto || []);
  renderSong(c.lagu);
  renderNotes(c.pesan || []);
  renderReport(c);

  $("#penutup").textContent = c.penutup || "";
  $("#dari").textContent = c.dari || "murid-muridmu";
  $("#sekolah").textContent = c.sekolah || "";
}

/* judul mading dari potongan kertas */
function cutLetters(el) {
  const colors = [["#FFFDF6", "#2B2A27"], ["#D9433B", "#fff"], ["#F2C14E", "#2B2A27"], ["#3D6FA8", "#fff"], ["#2E4A3D", "#F3F1E7"], ["#F2B8C6", "#2B2A27"]];
  const text = el.dataset.text || el.textContent;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    if (ch === " ") { s.className = "br"; el.append(s); return; }
    const [bg, fg] = colors[(i * 7 + ch.charCodeAt(0)) % colors.length];
    s.className = "ch";
    s.textContent = ch;
    s.style.setProperty("--bg", bg);
    s.style.setProperty("--fg", fg);
    s.style.setProperty("--r", `${((i * 37) % 11) - 5}deg`);
    el.append(s);
  });
}

/* ---------- 2. Foto mading ---------- */
let photos = [];
function renderPhotos(list) {
  photos = list;
  const wrap = $("#prints");
  if (!list.length) { $(".mading").hidden = true; return; }
  // susunan di layar lebar: foto pertama dibuat besar bila jumlahnya pas mengisi baris
  const n = list.length;
  const spanCols = [3, 4].find((c) => n > 2 && (n + 3) % c === 0);
  if (n === 1) wrap.classList.add("prints--one");
  else if (spanCols) { wrap.classList.add("has-span"); wrap.style.setProperty("--cols", spanCols); }
  else wrap.style.setProperty("--cols", n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : n === 2 ? 2 : 3);
  list.forEach((f, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "print";
    b.setAttribute("aria-label", `Lihat foto ${i + 1}${f.caption ? ": " + f.caption : ""}`);
    const box = document.createElement("span");
    box.className = "print__img";
    const img = new Image();
    img.src = f.src;
    img.alt = f.caption || `Foto ${i + 1}`;
    img.loading = i < 2 ? "eager" : "lazy";
    if (f.posisi) img.style.objectPosition = f.posisi;
    box.append(img);
    b.append(box);
    if (f.caption) {
      const cap = document.createElement("span");
      cap.className = "print__cap";
      cap.textContent = f.caption;
      b.append(cap);
    }
    b.addEventListener("click", () => openViewer(i));
    wrap.append(b);
  });
}

const viewer = $("#viewer");
let current = 0;
function openViewer(i) {
  current = (i + photos.length) % photos.length;
  const f = photos[current];
  $("#viewerImg").src = f.src;
  $("#viewerImg").alt = f.caption || `Foto ${current + 1}`;
  $("#viewerCap").textContent = f.caption || "";
  $("#viewerCount").textContent = `${current + 1} / ${photos.length}`;
  $(".viewer__nav").hidden = photos.length < 2;
  if (!viewer.open) viewer.showModal();
}
$("#prevBtn").addEventListener("click", () => openViewer(current - 1));
$("#nextBtn").addEventListener("click", () => openViewer(current + 1));
$("#closeBtn").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") openViewer(current - 1);
  if (e.key === "ArrowRight") openViewer(current + 1);
});
let touchX = null;
viewer.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) openViewer(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- 3. Lagu ---------- */
const audio = $("#audio");
const songBox = $("#songBox");
let songType = null;

function embedUrl(lagu) {
  const u = lagu.src || "";
  if (lagu.tipe === "spotify") {
    const m = u.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator` : null;
  }
  if (lagu.tipe === "youtube") {
    const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
  }
  return null;
}

function renderSong(lagu) {
  if (!lagu || !lagu.src) { songBox.hidden = true; return; }
  songType = lagu.tipe || "audio";
  $("#songTitle").textContent = lagu.judul || "Lagu untuk Guru";
  $("#songArtist").textContent = lagu.artis || "";
  if (songType === "audio") { audio.src = lagu.src; return; }

  // Spotify / YouTube: pakai pemutar resminya
  $("#player").hidden = true;
  const box = $("#embed");
  box.hidden = false;
  const url = embedUrl(lagu);
  if (!url) { box.textContent = "Tautan lagu belum benar. Periksa link Spotify/YouTube di config.json."; return; }
  const ifr = document.createElement("iframe");
  ifr.src = url;
  ifr.loading = "lazy";
  ifr.title = `Pemutar lagu ${lagu.judul || ""}`;
  ifr.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  if (songType === "spotify") ifr.height = 152;
  box.className = "embed" + (songType === "youtube" ? " embed--yt" : "");
  box.append(ifr);
}

const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const seek = $("#seek");
function setPlaying(on) {
  songBox.classList.toggle("is-playing", on);
  $("#playBtn").setAttribute("aria-label", on ? "Jeda lagu" : "Putar lagu");
  $("#mini").classList.toggle("is-paused", !on);
  $("#miniLabel").textContent = on ? "Jeda lagu" : "Putar lagu";
}
audio.addEventListener("play", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("ended", () => setPlaying(false));
audio.addEventListener("loadedmetadata", () => { $("#tDur").textContent = fmt(audio.duration); });
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const p = (audio.currentTime / audio.duration) * 100;
  seek.value = p;
  seek.style.setProperty("--p", p + "%");
  $("#tNow").textContent = fmt(audio.currentTime);
});
seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  seek.style.setProperty("--p", seek.value + "%");
});
const toggleAudio = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
$("#playBtn").addEventListener("click", toggleAudio);
$("#mini").addEventListener("click", toggleAudio);

let started = false;
audio.addEventListener("play", () => { started = true; });
new IntersectionObserver(([e]) => {
  const board = $(".board").getBoundingClientRect();
  $("#mini").hidden = !(songType === "audio" && started && !e.isIntersecting && board.bottom < 0);
}, { threshold: 0 }).observe(songBox);

/* ---------- 4. Kertas tempel ---------- */
function renderNotes(list) {
  const wrap = $("#notes");
  if (!list.length) { $(".notes-wrap").hidden = true; return; }
  list.forEach((n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "note";
    const p = document.createElement("p");
    p.textContent = n.isi;
    b.append(p);
    if (n.dari) {
      const s = document.createElement("span");
      s.textContent = `– ${n.dari}`;
      b.append(s);
    }
    b.addEventListener("click", () => {
      const was = b.classList.contains("is-focus");
      wrap.querySelectorAll(".is-focus").forEach((x) => x.classList.remove("is-focus"));
      if (!was) b.classList.add("is-focus");
    });
    wrap.append(b);
  });
}

/* ---------- 5. Rapor ---------- */
function renderReport(c) {
  const rows = c.rapor || [];
  if (!rows.length) { $(".desk").hidden = true; return; }
  $("#rUntuk").textContent = c.untuk || "Bapak dan Ibu Guru";
  $("#rDari").textContent = c.dari || "Murid-muridmu";
  $("#rSign").textContent = c.dari || "Murid-muridmu";
  const year = (c.tanggal || "").match(/\d{4}/);
  if (year) { $("#rTahun").textContent = year[0]; $("#stampYear").textContent = `Hari Guru ${year[0]}`; }
  const body = $("#rBody");
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td></td><td><span class="score" data-to="${Number(r.nilai) || 100}">0</span></td><td></td>`;
    tr.children[1].textContent = r.aspek;
    tr.children[3].textContent = r.ket || "";
    body.append(tr);
  });
  // nilai berhitung naik saat rapor terlihat
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    body.querySelectorAll(".score").forEach((el, i) => countUp(el, +el.dataset.to, 900 + i * 150));
  }, { threshold: 0.35 });
  io.observe($("#report"));
}
function countUp(el, to, dur) {
  if (reduceMotion) { el.textContent = to; return; }
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

$("#stampBtn").addEventListener("click", (e) => {
  const st = $("#stamp");
  if (st.classList.contains("is-on")) return;
  st.classList.add("is-on");
  $("#report").classList.add("is-shake");
  e.currentTarget.textContent = "Sudah distempel";
  e.currentTarget.disabled = true;
  setTimeout(() => {
    buzz(30);
    const r = st.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, 70);
  }, 280);
});

/* ---------- 6. Bel sekolah: bunyi "teng-teng-teng" (dibuat dengan Web Audio) ---------- */
let actx = null;
function bellSound() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const now = actx.currentTime;
    const master = actx.createGain();
    master.gain.value = 0.22;
    master.connect(actx.destination);
    [0, 0.3, 0.6].forEach((t) => {
      // perbandingan nada khas lonceng logam
      [[1, 1.6], [2.76, 0.9], [5.4, 0.5], [8.93, 0.25]].forEach(([ratio, len]) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = "sine";
        o.frequency.value = 740 * ratio;
        g.gain.setValueAtTime(0.0001, now + t);
        g.gain.exponentialRampToValueAtTime(1 / ratio, now + t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + len);
        o.connect(g).connect(master);
        o.start(now + t);
        o.stop(now + t + len + 0.05);
      });
    });
  } catch (_) { /* browser tanpa Web Audio */ }
}

$("#bellBtn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  bellSound();
  buzz([20, 60, 20, 60, 20]);
  btn.classList.remove("is-ringing");
  void btn.offsetWidth;
  btn.classList.add("is-ringing");
  btn.querySelector("span").textContent = "Bunyikan lagi";
  if (songType === "audio" && audio.paused) setTimeout(() => audio.play().catch(() => {}), 700);
  const r = btn.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top, 140);
});

/* ---------- 7. Konfeti kertas ---------- */
function confetti(x, y, count = 100) {
  if (reduceMotion) return;
  const c = $("#confetti");
  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ["#D9433B", "#F2C14E", "#3D6FA8", "#F2B8C6", "#4E8A55", "#FFFDF6", "#A9D3EA"];
  const bits = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 6 + Math.random() * 9;
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 7, h: 4 + Math.random() * 5,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35, c: colors[(Math.random() * colors.length) | 0] };
  });
  const t0 = performance.now();
  (function frame(t) {
    const life = (t - t0) / 2600;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    bits.forEach((b) => {
      b.vy += 0.22; b.vx *= 0.99; b.vy *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - life * life);
      ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 1.7)) + 1);
      ctx.restore();
    });
    if (life < 1) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}

/* ---------- Mulai ---------- */
(async function init() {
  cutLetters($("#h-mading"));
  try {
    fill(await loadConfig());
  } catch (err) {
    console.error(err);
  }
  // mulai menulis di papan setelah font kapur siap
  const start = () => document.body.classList.add("is-written");
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(start);
  } else start();
})();
