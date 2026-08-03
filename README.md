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

### 3. Install & konfigurasi
```bash
npm install
cp .env.example .env.local
```
Isi `.env.local` dengan **Project URL** dan **anon public key** dari Settings → API di dashboard
Supabase.

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
| Beranda (counter, anniversary, quote, mood, ide date) | `/app` |
| Wishlist | `/app/wishlist` |
| Kenangan (foto & cerita) | `/app/memories` |
| Galeri (upload banyak foto, kartu looping di beranda) | `/app/gallery` |
| Jadwal Date | `/app/schedule` |
| Surat Masa Depan (time capsule) | `/app/letters` |
| Couple Goals | `/app/goals` |
| Peta Perjalanan | `/app/journey` |
| Ide Date Random | `/app/date-ideas` |
| Arcade Room (20 mini game, lokal & online, papan skor) | `/app/arcade` |
| Pengaturan (nama, tanggal jadian, foto sampul, tema) | `/app/settings` |

## Catatan teknis

- **Tema**: 4 pilihan (Terang, Gelap, Michael Mode, Tasya Mode), tersimpan di `localStorage`,
  dipilih lewat `ThemeSwitcher` (menu akun sidebar, Pengaturan, atau sheet "Lainnya" di mobile).
  Diterapkan lewat atribut `data-theme` di `<html>` + CSS variable per tema — lihat `src/index.css`.
  Michael Mode pakai palet hitam/violet/magenta; Tasya Mode pakai palet snow/dusty rose/champagne.
- **Ikon**: seluruh ikon navigasi, kartu dashboard, dan game pakai set ikon pixel/8-bit buatan
  sendiri (`src/components/ui/pixel-icons.tsx`, bitmap 8×8 di-render sebagai `<rect>` SVG) — bukan
  emoji atau library eksternal.
- **Font**: Poppins (heading), Inter (body), dan stack sistem Apple (`SF Pro Display` dengan
  fallback) untuk angka/counter.
- **Foto sampul landing page**: diunggah langsung dari dalam aplikasi (Pengaturan → Foto Sampul),
  disimpan di bucket publik `public-covers`, jadi Ruth atau Michael bisa menggantinya kapan saja
  tanpa perlu ubah kode.
- **Arcade Room**: 20 mini game lewat satu registry (`src/lib/games/registry.ts`) + route dinamis
  `/app/arcade/:gameKey`. 6 game (Tic-Tac-Toe, Connect Four, Batu Gunting Kertas, Tebak Kata, Adu
  Dadu, Duel Trivia) punya dua mode — "Satu HP" (pass-and-play lokal, tanpa backend) dan "Online"
  (device terpisah, disinkronkan lewat tabel `game_sessions` dengan polling ~2.5 detik, bukan
  Supabase Realtime, konsisten dengan model sync aplikasi ini). 14 game lainnya murni lokal
  (solo atau co-op satu layar). Skor/kemenangan dari mode online tercatat di `game_scores` dan
  ditampilkan sebagai papan skor per game (`Leaderboard.tsx`).
- **Galeri**: upload banyak foto sekaligus (multi-select) di `/app/gallery`, disimpan di bucket
  privat `couple-photos`. Kartu Galeri di beranda otomatis loop lewat semua foto tiap 3,5 detik.
- **Peta Perjalanan**: cari tempat lewat nama (Nominatim/OpenStreetMap, gratis tanpa API key) atau
  klik langsung di peta. Titik-titik diurutkan berdasarkan tanggal kunjungan lalu dihubungkan garis
  rute jalan sungguhan lewat OSRM (juga gratis, tanpa API key) — server demo publik OSRM, jadi
  cocok untuk pemakaian ringan seperti ini, bukan trafik besar. Kalau OSRM tidak menemukan rute
  darat (misal antar pulau/negara), otomatis fallback ke garis putus-putus lurus.
- **Surat Masa Depan** dibaca lewat `future_letters_view`, yang menyembunyikan kolom `content` di
  server sampai `unlock_date` tercapai — jadi isinya benar-benar tidak terkirim ke browser sebelum
  waktunya, bukan cuma disembunyikan di UI.
- Sinkronisasi antar device memakai refetch-on-focus (react-query), bukan realtime instan — cukup
  buka ulang/pindah tab untuk melihat perubahan dari pasangan.

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
