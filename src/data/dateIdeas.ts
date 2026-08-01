export interface DateIdea {
  title: string
  category: 'santai' | 'seru' | 'hemat' | 'romantis'
  emoji: string
}

export const DATE_IDEAS: DateIdea[] = [
  { title: 'Masak dinner berdua di rumah sambil dengerin playlist favorit', category: 'santai', emoji: '🍳' },
  { title: 'Piknik sore di taman dengan bekal buatan sendiri', category: 'santai', emoji: '🧺' },
  { title: 'Marathon film trilogi favorit sambil bikin popcorn', category: 'santai', emoji: '🍿' },
  { title: 'Coba satu resep baru yang belum pernah kalian masak', category: 'seru', emoji: '👩‍🍳' },
  { title: 'Road trip singkat ke kota terdekat yang belum pernah dikunjungi', category: 'seru', emoji: '🚗' },
  { title: 'Kelas melukis atau pottery berdua', category: 'seru', emoji: '🎨' },
  { title: 'Karaoke di rumah atau di karaoke box', category: 'seru', emoji: '🎤' },
  { title: 'Nonton sunset di rooftop atau pantai terdekat', category: 'romantis', emoji: '🌅' },
  { title: 'Tulis surat cinta untuk satu sama lain, baca bareng', category: 'romantis', emoji: '💌' },
  { title: 'Slow dance di ruang tamu pakai lagu pertama kalian jadian', category: 'romantis', emoji: '💃' },
  { title: 'Jalan kaki malam sambil ngobrol tanpa gadget', category: 'hemat', emoji: '🌙' },
  { title: 'Window shopping tanpa niat beli, cuma jalan berdua', category: 'hemat', emoji: '🛍️' },
  { title: 'Main board game atau kartu sampai tengah malam', category: 'hemat', emoji: '🎲' },
  { title: 'Bikin scrapbook kenangan kalian berdua', category: 'romantis', emoji: '📔' },
  { title: 'Cobain kafe baru yang belum pernah kalian datangi', category: 'santai', emoji: '☕' },
  { title: 'Olahraga bareng — jogging, gym, atau yoga pagi', category: 'seru', emoji: '🏃' },
  { title: 'Stargazing sambil bawa selimut dan cemilan', category: 'romantis', emoji: '✨' },
  { title: 'Ikut kelas dance atau workshop bareng', category: 'seru', emoji: '💫' },
  { title: 'Bikin video atau podcast lucu berdua, buat kenangan', category: 'seru', emoji: '🎬' },
  { title: 'Baca buku yang sama lalu diskusikan tiap bab', category: 'santai', emoji: '📚' },
]

export function randomDateIdea(exclude?: string): DateIdea {
  const pool = exclude ? DATE_IDEAS.filter((d) => d.title !== exclude) : DATE_IDEAS
  return pool[Math.floor(Math.random() * pool.length)]
}
