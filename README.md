# Selamat Hari Guru Nasional

Halaman ucapan Hari Guru Nasional (25 November) dengan suasana kelas di sekolah:
papan tulis kapur, bel sekolah, mading kelas, kertas tempel pesan, dan rapor untuk guru.
Dibuat dengan HTML, CSS, dan JavaScript murni.

## Struktur folder

```
index.html          halaman utama
css/style.css       tampilan
js/app.js           logika (bel, lagu, foto, rapor, konfeti)
data/config.json    SEMUA ISI HALAMAN diatur di sini
assets/foto/        foto-foto mading
assets/lagu/        file lagu
fonts/              font (Schoolbell, Courier Prime, Atkinson Hyperlegible)
```

## Mengganti isi

Cukup edit `data/config.json`. Kode lain tidak perlu diubah.

| Kolom | Keterangan |
|---|---|
| `tanggal` | Tulisan tanggal di pojok papan tulis |
| `untuk` | Contoh: "Bapak dan Ibu Guru", "Ibu Sari", "Bapak dan Ibu Dosen" |
| `dari` | Nama kelas atau pengirim |
| `sekolah` | Nama sekolah (boleh dikosongkan) |
| `foto` | Daftar foto + keterangan. Jumlah bebas, susunan menyesuaikan otomatis |
| `lagu` | Lihat bagian di bawah |
| `pesan` | Pesan dari murid, tampil sebagai kertas tempel warna-warni |
| `rapor` | Aspek penilaian, nilai, dan keterangan di rapor untuk guru |
| `penutup` | Kalimat penutup di papan tulis bawah |

Bagian yang dikosongkan (misalnya `"pesan": []`) otomatis disembunyikan.

Foto dan lagu bawaan hanyalah contoh: fotonya ilustrasi, lagunya melodi buatan sendiri yang bebas dipakai.
Ganti dengan foto kelas asli dan lagu pilihanmu.

## Pilihan lagu

```json
"lagu": { "tipe": "audio",   "src": "/assets/lagu/namafile.mp3", "judul": "...", "artis": "..." }
"lagu": { "tipe": "youtube", "src": "https://youtu.be/xxxx", "judul": "...", "artis": "..." }
"lagu": { "tipe": "spotify", "src": "https://open.spotify.com/track/xxxx", "judul": "...", "artis": "..." }
```

Untuk lagu populer (misalnya Hymne Guru), pakai `youtube` atau `spotify` dari kanal resminya.
Dengan `audio`, lagu langsung berputar setelah tombol **Bunyikan bel** ditekan.

## Mencoba di laptop

Buka folder ini di VS Code, klik kanan `index.html`, pilih **Open with Live Server**,
lalu buka `http://127.0.0.1:5500/`.

## Online (Cloudflare)

Upload isi folder ini ke repository GitHub, lalu hubungkan ke Cloudflare
(Workers & Pages → Create → hubungkan repository), sama seperti proyek sebelumnya.
