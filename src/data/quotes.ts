export interface Quote {
  text: string
  author: string
}

export const QUOTES: Quote[] = [
  { text: 'Di antara semua orang, aku memilihmu. Dan setiap hari aku akan terus memilihmu.', author: 'Anonim' },
  { text: 'Cinta bukan tentang menemukan orang sempurna, tapi belajar melihat orang tidak sempurna dengan sempurna.', author: 'Sam Keen' },
  { text: 'Rumahku bukan sebuah tempat, tapi seseorang.', author: 'Anonim' },
  { text: 'Kamu, aku, dan secangkir kopi sudah cukup untuk membuat hari jadi baik.', author: 'Anonim' },
  { text: 'Setiap cerita cinta itu indah, tapi punya kita adalah favoritku.', author: 'Anonim' },
  { text: 'Bersamamu, semua terasa lebih mudah — bahkan hari yang paling berat sekalipun.', author: 'Anonim' },
  { text: 'Aku jatuh cinta padamu bukan karena kamu sempurna, tapi karena kamu selalu ada.', author: 'Anonim' },
  { text: 'Kebahagiaan sederhana: kamu, aku, dan waktu yang tak terburu-buru.', author: 'Anonim' },
  { text: 'Setiap detik bersamamu adalah alasan untuk terus bersyukur.', author: 'Anonim' },
  { text: 'Kau adalah alasan aku percaya lagi pada cinta.', author: 'Anonim' },
]

export function randomQuote(exclude?: string): Quote {
  const pool = exclude ? QUOTES.filter((q) => q.text !== exclude) : QUOTES
  return pool[Math.floor(Math.random() * pool.length)]
}
