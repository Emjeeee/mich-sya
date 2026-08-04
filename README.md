# MichSya 💗

Ruang kenangan pribadi Michael & Ruth: wishlist, kenangan, jadwal date, surat masa depan (time capsule),
couple goals, peta perjalanan, dan ide date random. Dibangun dengan React + Vite + Tailwind +
Supabase, dan responsif untuk desktop maupun mobile.

## Setup

### 1. Buat project Supabase
Buat project gratis di [supabase.com](https://supabase.com).

### 2. Jalankan migration
Buka **SQL Editor** di dashboard Supabase, lalu jalankan berurutan:
1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — semua tabel inti, RLS,
   view `future_letters_view`, dan storage bucket `couple-photos`.
2. [`supabase/migrations/0002_cover_photo.sql`](supabase/migrations/0002_cover_photo.sql) — kolom
   foto sampul di `couple`, bucket publik `public-covers`, dan view `couple_public_view` (dipakai
   landing page yang belum login).
3. [`supabase/migrations/0003_arcade.sql`](supabase/migrations/0003_arcade.sql) — tabel
   `game_sessions` untuk mode online Arcade Room.
4. [`supabase/migrations/0004_gallery.sql`](supabase/migrations/0004_gallery.sql) — tabel
   `gallery_photos` untuk upload foto banyak sekaligus di menu Galeri.
5. [`supabase/migrations/0005_arcade_v2.sql`](supabase/migrations/0005_arcade_v2.sql) — generalisasi
   `game_sessions` (kolom `board` → `state`, dukung 6 game online) + tabel `game_scores` untuk
   papan skor/leaderboard Arcade Room.
6. [`supabase/migrations/0006_chat.sql`](supabase/migrations/0006_chat.sql) — tabel `messages`
   (text/image/audio/video/GIF), RLS, bucket privat `chat-media`, dan mengaktifkan Supabase
   Realtime untuk tabel `messages`. Kalau statement `alter publication supabase_realtime add
   table messages;` ditolak (tergantung plan/setup project), aktifkan manual lewat dashboard:
   **Database → Replication → toggle tabel `messages`**.
7. [`supabase/migrations/0007_date_sessions.sql`](supabase/migrations/0007_date_sessions.sql) —
   tabel `date_sessions` + `date_session_locations` (fondasi "date monitoring", disiapkan untuk
   didorong oleh aplikasi mobile terpisah di masa depan), dan kolom `linked_wishlist_item_id` di
   `couple_goals` (dipakai tombol "Jadikan Goal" di halaman Wishlist).
8. [`supabase/migrations/0008_partner_name.sql`](supabase/migrations/0008_partner_name.sql) —
   fungsi `partner_display_name()` (security definer, dibatasi ke pasangan sendiri lewat
   `my_couple_id()`) supaya nama pasangan bisa ditampilkan di header chat & notifikasi, tanpa
   membuka akses `auth.users` secara umum ke client.
9. [`supabase/migrations/0009_chat_extras.sql`](supabase/migrations/0009_chat_extras.sql) —
   kolom `hidden_for` di `messages` (dukung "Hapus untuk Saya", terpisah dari `deleted_at` yang
   sudah ada untuk "Hapus untuk Semua"), dan tabel `chat_background` (background chat, satu per
   couple, dipakai bersama).
10. [`supabase/migrations/0010_arcade_v3.sql`](supabase/migrations/0010_arcade_v3.sql) — menambah
    4 game ke daftar `game_type` yang boleh online: Would You Rather, Truth or Dare, Tebak Angka,
    Adu Ketuk.

### 3. Install & konfigurasi
```bash
npm install
cp .env.example .env.local
```
Isi `.env.local` dengan **Project URL** dan **anon public key** dari Settings → API di dashboard
Supabase, dan `VITE_GIPHY_API_KEY` untuk pencarian GIF di fitur chat — daftar gratis di
[developers.giphy.com](https://developers.giphy.com/). Tanpa key ini, kirim
teks/gambar/audio/video/emoji tetap jalan normal, hanya picker GIF yang tidak bisa dipakai.

### 4. Buat 2 akun (sekali saja)
```bash
npm run dev
```
Buka `http://localhost:5173/signup`, buat akun untuk Michael, sign out, lalu buat akun untuk Ruth.

### 5. Hubungkan couple space (sekali saja)
Di SQL Editor, jalankan (ganti email dan tanggal jadian yang sebenarnya):
```sql
insert into couple (partner1_id, partner2_id, anniversary_date)
select
  (select id from auth.users where email = 'michael@email-asli.com'),
  (select id from auth.users where email = 'ruth@email-asli.com'),
  '2020-01-01';
```

### 6. Kunci pendaftaran (opsional tapi disarankan)
Karena aplikasi ini hanya untuk kalian berdua, matikan pendaftaran publik di dashboard Supabase:
**Authentication → Settings → Allow new users to sign up** → off. Ini mencegah orang lain
membuat akun baru sama sekali.

Setelah itu, login seperti biasa di `/login` dari device mana pun — data otomatis sync karena
disimpan di Supabase (Postgres), bukan hanya di browser.

## Struktur fitur

| Fitur | Halaman |
| --- | --- |
| Beranda (counter, anniversary, quote, mood, ide date, date session) | `/app` |
| Chat (text, gambar, audio, video, emoji, GIF — real-time) | `/app/chat` |
| Wishlist | `/app/wishlist` |
| Kenangan (foto & cerita) | `/app/memories` |
| Galeri (upload banyak foto, kartu looping di beranda) | `/app/gallery` |
| Jadwal Date | `/app/schedule` |
| Surat Masa Depan (time capsule) | `/app/letters` |
| Couple Goals | `/app/goals` |
| Peta Perjalanan | `/app/journey` |
| Ide Date Random | `/app/date-ideas` |
| Arcade Room (21 mini game, 10 lokal+online, 11 lokal saja, papan skor) | `/app/arcade` |
| Pengaturan (nama, tanggal jadian, foto sampul, tema) | `/app/settings` |

## Catatan teknis

- **Tema**: 5 pilihan (Terang, Gelap, Michael Mode, Tasya Mode, Midnight Gold), tersimpan di
  `localStorage`, dipilih lewat `ThemeSwitcher` (menu akun sidebar, Pengaturan, atau sheet
  "Lainnya" di mobile) — validasi tema yang sama juga ada di script inline `index.html` (dijalankan
  sebelum React mount, biar tidak ada flash tema salah), jadi tema baru harus ditambahkan di
  **kedua** tempat itu. Diterapkan lewat atribut `data-theme` di `<html>` + CSS variable per tema —
  lihat `src/index.css`. Michael Mode pakai palet hitam/violet/magenta; Tasya Mode pakai palet
  snow/dusty rose/champagne; Midnight Gold pakai palet hitam/emas dengan font heading `Cinzel`
  (satu-satunya tema yang pakai font di luar Poppins/Space Grotesk/Quicksand yang sudah ada) dan
  background starfield + comet + awan monokrom (`MidnightGoldBackground.tsx`, CSS keyframe murni
  seperti Tasya Mode, bukan canvas + `requestAnimationFrame` terus-menerus seperti Michael Mode).
- **Ikon**: seluruh ikon navigasi, kartu dashboard, dan game pakai set ikon pixel/8-bit buatan
  sendiri (`src/components/ui/pixel-icons.tsx`, bitmap 8×8 di-render sebagai `<rect>` SVG) — bukan
  emoji atau library eksternal. Ikon konseptual (nav, dashboard, arcade) punya warna tetap sesuai
  makna ikonnya (hati = merah muda, matahari = kuning, 2048 = oranye, dst.) lewat sebuah palette
  map per ikon; ikon fungsional yang warnanya perlu ikut state (chevron, send, check, dll.) tetap
  pakai `currentColor` supaya hover/active state & kontras di atas tombol berwarna tidak rusak.
- **Font**: Poppins (heading), Inter (body), dan stack sistem Apple (`SF Pro Display` dengan
  fallback) untuk angka/counter.
- **Foto sampul landing page**: diunggah langsung dari dalam aplikasi (Pengaturan → Foto Sampul),
  disimpan di bucket publik `public-covers`, jadi Ruth atau Michael bisa menggantinya kapan saja
  tanpa perlu ubah kode.
- **Arcade Room**: 21 mini game lewat satu registry (`src/lib/games/registry.ts`) + route dinamis
  `/app/arcade/:gameKey`. 10 game (Tic-Tac-Toe, Connect Four, Batu Gunting Kertas, Tebak Kata, Adu
  Dadu, Duel Trivia, Tebak Angka, Truth or Dare, Would You Rather, Adu Ketuk) punya dua mode —
  "Satu HP" (pass-and-play lokal, tanpa backend) dan "Online" (device terpisah, disinkronkan lewat
  tabel `game_sessions` dengan polling ~2.5 detik, bukan Supabase Realtime, konsisten dengan model
  sync aplikasi ini). 11 game lainnya murni lokal (solo atau co-op satu layar), termasuk **Block
  Blast** (`src/lib/games/blockblast.ts`) — grid 8×8, 3 potongan acak tanpa rotasi sekali tarik,
  hapus baris/kolom penuh buat skor, mirip 1010!/Woodoku. Skor/kemenangan
  dari mode online tercatat di `game_scores` dan ditampilkan sebagai papan skor per game
  (`Leaderboard.tsx`) — tiap game lokal yang punya skor juga wajib kirim `userId` (dari
  `useAuth()`) saat merekam skor, bukan cuma `score`, atau leaderboard akan salah atribusi ke
  pasangan (bug nyata yang pernah kejadian, sudah diperbaiki di semua game).
  **Info tersembunyi di game online** (siapa pilih apa, kata/angka rahasia) bukan proteksi level
  data — RLS tetap kasih akses select penuh ke kedua pasangan atas alasan performa/kesederhanaan,
  jadi field lawan sebenarnya sudah ada di response JSON. "Menyembunyikan" artinya cuma tidak
  merender field itu di JSX sampai kondisi reveal terpenuhi (lihat `RockPaperScissorsOnline.tsx`
  untuk reveal-setelah-keduanya-pilih, atau `HangmanOnline.tsx`/`NumberGuessOnline.tsx` untuk
  peran setter/guesser yang asimetris) — cukup untuk pasangan yang saling percaya, bukan didesain
  tahan terhadap orang yang buka devtools.
- **Galeri**: upload banyak foto sekaligus (multi-select) di `/app/gallery`, disimpan di bucket
  privat `couple-photos`. Kartu Galeri di beranda otomatis loop lewat semua foto tiap 3,5 detik.
  **Kenangan** (`/app/memories`) dan **Chat** juga sudah bisa pilih banyak foto sekaligus — di
  Kenangan tiap foto jadi satu entri kenangan terpisah (judul/cerita yang sama), di Chat tiap foto
  jadi satu pesan terpisah.
- **Peta Perjalanan**: cari tempat lewat nama (Nominatim/OpenStreetMap, gratis tanpa API key) atau
  klik langsung di peta. Titik-titik diurutkan berdasarkan tanggal kunjungan lalu dihubungkan garis
  rute jalan sungguhan lewat OSRM (juga gratis, tanpa API key) — server demo publik OSRM, jadi
  cocok untuk pemakaian ringan seperti ini, bukan trafik besar. Kalau OSRM tidak menemukan rute
  darat (misal antar pulau/negara), otomatis fallback ke garis putus-putus lurus.
- **Surat Masa Depan** dibaca lewat `future_letters_view`, yang menyembunyikan kolom `content` di
  server sampai `unlock_date` tercapai — jadi isinya benar-benar tidak terkirim ke browser sebelum
  waktunya, bukan cuma disembunyikan di UI.
- Sinkronisasi antar device memakai refetch-on-focus (react-query), bukan realtime instan — cukup
  buka ulang/pindah tab untuk melihat perubahan dari pasangan. **Chat adalah satu-satunya
  pengecualian**: pesan baru, status "sedang mengetik", dan read-receipt memakai Supabase Realtime
  (postgres changes + broadcast) sehingga muncul instan tanpa refresh.
- **Chat**: media (gambar/audio/video) disimpan di bucket privat `chat-media`, GIF dicari lewat
  GIPHY API dan disimpan sebagai URL langsung (tidak di-upload ulang). Rekam audio memakai
  `MediaRecorder`/`getUserMedia` bawaan browser (butuh HTTPS atau localhost). Pesan belum dibaca
  ditandai lewat badge di ikon menu Chat (sidebar & bottom nav) dan banner singkat di halaman lain
  ("N pesan baru dari ...") — keduanya live lewat langganan Realtime yang sama, bukan polling.
  Hapus pesan punya dua opsi: "Hapus untuk Saya" (hanya hilang dari device sendiri, lewat kolom
  `hidden_for`) dan "Hapus untuk Semua" (tombstone `deleted_at`, hanya tersedia untuk pesan
  sendiri). Ikon pencarian di header mencari isi pesan teks dan bisa lompat ke pesan lama di luar
  50 pesan yang sedang dimuat. Background chat (preset warna atau upload foto sendiri) tersimpan
  di tabel `chat_background`, satu per couple — jadi kelihatan sama di device Michael & Ruth.
- **Date Session** (fondasi "date monitoring"): kartu di beranda untuk mulai/selesai date (baca
  lokasi lewat Geolocation API browser, best-effort — tetap jalan walau izin lokasi ditolak).
  Selesai date otomatis membuat entri di jadwal date, menawarkan pin lokasi ke peta perjalanan
  (nama tempat dari reverse-geocoding Nominatim), dan mengarahkan ke Kenangan/Wishlist untuk
  foto/cerita/wishlist dari date tersebut. Tabel `date_session_locations` untuk breadcrumb GPS
  berkala belum dipakai UI web ini — disiapkan sebagai tempat aplikasi mobile terpisah (rencana
  ke depan, sideload APK, di luar repo ini) mendorong data lokasi periodik ke Supabase yang sama.

## Scripts

```bash
npm run dev      # development server
npm run build    # type-check + production build
npm run preview  # preview hasil build
```

## Deploy (Vercel)

Repo ini sudah siap deploy sebagai static Vite app:

1. Push repo ini ke GitHub (sekali saja).
2. Di [vercel.com](https://vercel.com), **Add New → Project → Import** repo GitHub-nya. Vercel
   otomatis mendeteksi framework Vite — tidak perlu ubah build command/output.
3. Di step **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   
   (Nilainya sama seperti isi `.env.local` kamu — lihat langkah setup Supabase di atas.)
4. Klik **Deploy**.

[`vercel.json`](vercel.json) di root sudah berisi rewrite rule supaya semua route React Router
(misalnya `/app/wishlist`) tetap kebuka dengan benar walau diakses langsung/refresh, bukan 404.

Setiap `git push` ke branch utama setelah ini akan otomatis re-deploy.
