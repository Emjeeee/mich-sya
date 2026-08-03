import type { GameDef } from './types'
import { TicTacToeLocal } from '@/components/arcade/TicTacToeLocal'
import { TicTacToeOnline } from '@/components/arcade/TicTacToeOnline'
import { MemoryMatchGame } from '@/components/arcade/MemoryMatchGame'
import { ConnectFourLocal } from '@/components/arcade/ConnectFourLocal'
import { ConnectFourOnline } from '@/components/arcade/ConnectFourOnline'
import { RockPaperScissorsLocal } from '@/components/arcade/RockPaperScissorsLocal'
import { RockPaperScissorsOnline } from '@/components/arcade/RockPaperScissorsOnline'
import { Game2048 } from '@/components/arcade/Game2048'
import { SnakeGame } from '@/components/arcade/SnakeGame'
import { SimonSaysGame } from '@/components/arcade/SimonSaysGame'
import { WhackAMoleGame } from '@/components/arcade/WhackAMoleGame'
import { ReactionDuelGame } from '@/components/arcade/ReactionDuelGame'
import { NumberGuessGame } from '@/components/arcade/NumberGuessGame'
import { WordScrambleGame } from '@/components/arcade/WordScrambleGame'
import { EmojiQuizGame } from '@/components/arcade/EmojiQuizGame'
import { SlidingPuzzleGame } from '@/components/arcade/SlidingPuzzleGame'
import { HangmanLocal } from '@/components/arcade/HangmanLocal'
import { HangmanOnline } from '@/components/arcade/HangmanOnline'
import { DiceBattleLocal } from '@/components/arcade/DiceBattleLocal'
import { DiceBattleOnline } from '@/components/arcade/DiceBattleOnline'
import { TriviaDuelLocal } from '@/components/arcade/TriviaDuelLocal'
import { TriviaDuelOnline } from '@/components/arcade/TriviaDuelOnline'
import { TruthOrDareGame } from '@/components/arcade/TruthOrDareGame'
import { WouldYouRatherGame } from '@/components/arcade/WouldYouRatherGame'
import { TapBattleGame } from '@/components/arcade/TapBattleGame'
import { ColorMatchGame } from '@/components/arcade/ColorMatchGame'

export const GAMES: GameDef[] = [
  {
    key: 'tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Klasik tapi seru — main satu HP gantian, atau online dari device masing-masing.',
    icon: 'grid3',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: TicTacToeLocal,
    OnlineComponent: TicTacToeOnline,
  },
  {
    key: 'connectfour',
    title: 'Connect Four',
    description: 'Susun 4 keping sejajar duluan buat menang.',
    icon: 'connect4',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: ConnectFourLocal,
    OnlineComponent: ConnectFourOnline,
  },
  {
    key: 'rps',
    title: 'Batu Gunting Kertas',
    description: 'Best of 5 — siapa yang lebih jago baca gerakan pasangan?',
    icon: 'hand',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: RockPaperScissorsLocal,
    OnlineComponent: RockPaperScissorsOnline,
  },
  {
    key: 'hangman',
    title: 'Tebak Kata',
    description: 'Satu pasang bikin kata rahasia, satunya nebak sebelum kesempatan habis.',
    icon: 'gallows',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: HangmanLocal,
    OnlineComponent: HangmanOnline,
  },
  {
    key: 'dice',
    title: 'Adu Dadu',
    description: 'Gantian lempar dadu, pertama sampai skor 30 menang.',
    icon: 'dice',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: DiceBattleLocal,
    OnlineComponent: DiceBattleOnline,
  },
  {
    key: 'trivia',
    title: 'Duel Trivia',
    description: 'Jawab pertanyaan gantian, pertama sampai 5 benar menang.',
    icon: 'brain',
    hasOnline: true,
    scoreMode: 'wins',
    LocalComponent: TriviaDuelLocal,
    OnlineComponent: TriviaDuelOnline,
  },
  {
    key: 'memory',
    title: 'Kartu Jodoh',
    description: 'Cocokkan pasangan kartu secepat mungkin — main bareng satu layar.',
    icon: 'cards',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'asc',
    scoreUnit: ' langkah',
    LocalComponent: MemoryMatchGame,
  },
  {
    key: '2048',
    title: '2048',
    description: 'Gabungkan angka sampai ke 2048 (atau lebih).',
    icon: 'tile2048',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    LocalComponent: Game2048,
  },
  {
    key: 'snake',
    title: 'Ular Klasik',
    description: 'Makan sebanyak mungkin tanpa nabrak diri sendiri.',
    icon: 'snake',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' panjang',
    LocalComponent: SnakeGame,
  },
  {
    key: 'simon',
    title: 'Simon Says',
    description: 'Ingat & ulangi urutan warna yang makin panjang tiap ronde.',
    icon: 'pad4',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' ronde',
    LocalComponent: SimonSaysGame,
  },
  {
    key: 'whackamole',
    title: 'Pukul Tikus',
    description: 'Ketuk mol yang muncul secepat mungkin dalam 30 detik.',
    icon: 'mallet',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' poin',
    LocalComponent: WhackAMoleGame,
  },
  {
    key: 'reactionduel',
    title: 'Adu Refleks',
    description: 'Dua tombol, satu warna hijau — siapa duluan tap, menang rondenya.',
    icon: 'bolt',
    hasOnline: false,
    scoreMode: 'none',
    LocalComponent: ReactionDuelGame,
  },
  {
    key: 'numberguess',
    title: 'Tebak Angka',
    description: 'Tebak angka 1-100 sesedikit mungkin coba.',
    icon: 'question',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'asc',
    scoreUnit: ' tebakan',
    LocalComponent: NumberGuessGame,
  },
  {
    key: 'wordscramble',
    title: 'Acak Kata',
    description: 'Susun ulang huruf yang teracak sebanyak mungkin dalam 60 detik.',
    icon: 'letters',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' kata',
    LocalComponent: WordScrambleGame,
  },
  {
    key: 'emojiquiz',
    title: 'Tebak Emoji',
    description: 'Tebak kata dari kombinasi emoji-nya, sebanyak mungkin dalam 60 detik.',
    icon: 'quizface',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' benar',
    LocalComponent: EmojiQuizGame,
  },
  {
    key: 'slidingpuzzle',
    title: 'Puzzle Geser',
    description: 'Urutkan angka 1-15 dengan langkah sesedikit mungkin.',
    icon: 'puzzlepiece',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'asc',
    scoreUnit: ' langkah',
    LocalComponent: SlidingPuzzleGame,
  },
  {
    key: 'truthordare',
    title: 'Truth or Dare',
    description: 'Pilih Truth atau Dare, gantian sama pasanganmu.',
    icon: 'spinner',
    hasOnline: false,
    scoreMode: 'none',
    LocalComponent: TruthOrDareGame,
  },
  {
    key: 'wouldyourather',
    title: 'Would You Rather',
    description: 'Pilih diam-diam, buka bareng — sama atau beda pilihan?',
    icon: 'fork',
    hasOnline: false,
    scoreMode: 'none',
    LocalComponent: WouldYouRatherGame,
  },
  {
    key: 'tapbattle',
    title: 'Adu Ketuk',
    description: 'Siapa paling banyak ketuk layar dalam 10 detik?',
    icon: 'tap',
    hasOnline: false,
    scoreMode: 'none',
    LocalComponent: TapBattleGame,
  },
  {
    key: 'colormatch',
    title: 'Tebak Warna',
    description: 'Ketuk warna yang sesuai nama secepat mungkin sebelum waktu habis.',
    icon: 'palette',
    hasOnline: false,
    scoreMode: 'score',
    scoreSort: 'desc',
    scoreUnit: ' poin',
    LocalComponent: ColorMatchGame,
  },
]
