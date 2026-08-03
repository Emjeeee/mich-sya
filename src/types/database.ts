// Hand-written mirror of supabase/migrations/0001_init.sql.
// If you add/change columns in the migration, update this file to match.
//
// NOTE: these are `type` aliases, not `interface`s, on purpose — TypeScript
// only synthesizes an implicit string index signature for object type
// literals, not for interfaces. supabase-js's generic constraints (GenericTable
// requires Row/Insert/Update: Record<string, unknown>) silently collapse to
// `never` for every table if these are interfaces, with no error at the
// declaration site — the failure only surfaces later as `never` types at
// every `.insert()`/`.update()` call site. Keep these as `type`.

export type ScheduleStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled'

export type CoupleRow = {
  id: string
  partner1_id: string
  partner2_id: string | null
  anniversary_date: string | null
  cover_photo_path: string | null
  created_at: string
}

export type CouplePublicRow = {
  id: string
  cover_photo_path: string | null
}

export type WishlistItemRow = {
  id: string
  couple_id: string
  title: string
  description: string | null
  image_url: string | null
  is_done: boolean
  created_by: string | null
  created_at: string
}

export type MemoryRow = {
  id: string
  couple_id: string
  title: string
  description: string | null
  photo_url: string | null
  location: string | null
  memory_date: string
  created_by: string | null
  created_at: string
}

export type ScheduleRow = {
  id: string
  couple_id: string
  title: string
  description: string | null
  location: string | null
  scheduled_date: string
  scheduled_time: string | null
  status: ScheduleStatus
  created_by: string | null
  created_at: string
}

export type FutureLetterRow = {
  id: string
  couple_id: string
  title: string
  unlock_date: string
  is_opened: boolean
  opened_at: string | null
  created_by: string | null
  created_at: string
  content: string | null // null (masked) until unlock_date, via future_letters_view
}

export type CoupleGoalRow = {
  id: string
  couple_id: string
  title: string
  description: string | null
  target_date: string | null
  is_done: boolean
  created_by: string | null
  created_at: string
}

export type JourneyPlaceRow = {
  id: string
  couple_id: string
  place_name: string
  description: string | null
  photo_url: string | null
  lat: number
  lng: number
  visited_date: string | null
  created_by: string | null
  created_at: string
}

export type DailyVibeRow = {
  id: string
  couple_id: string
  user_id: string
  mood: string
  note: string | null
  entry_date: string
  created_at: string
}

export type GalleryPhotoRow = {
  id: string
  couple_id: string
  photo_path: string
  created_by: string | null
  created_at: string
}

export type GameType = 'tictactoe' | 'connectfour' | 'rps' | 'hangman' | 'dice' | 'trivia'
export type GameStatus = 'active' | 'finished'
export type GameWinner = 'x' | 'o' | 'draw' | 'p1' | 'p2'

export type GameSessionRow = {
  id: string
  couple_id: string
  game_type: GameType
  state: unknown // shape is per-game — tic-tac-toe: Cell[9], connect four: Cell[42], dice: {scores}, etc.
  turn: string | null
  player_x: string | null
  player_o: string | null
  winner: GameWinner | null
  status: GameStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type GameScoreRow = {
  id: string
  couple_id: string
  game_key: string
  user_id: string | null
  winner_user_id: string | null
  score: number | null
  metadata: unknown
  created_at: string
}

// supabase-js's generic table constraint (GenericTable) requires a
// Relationships array even though this app never uses PostgREST embeds.
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      couple: Table<CoupleRow>
      wishlist_items: Table<WishlistItemRow>
      memories: Table<MemoryRow>
      schedules: Table<ScheduleRow>
      future_letters: Table<FutureLetterRow>
      couple_goals: Table<CoupleGoalRow>
      journey_map: Table<JourneyPlaceRow>
      daily_vibes: Table<DailyVibeRow>
      game_sessions: Table<GameSessionRow>
      gallery_photos: Table<GalleryPhotoRow>
      game_scores: Table<GameScoreRow>
    }
    Views: {
      future_letters_view: { Row: FutureLetterRow; Relationships: [] }
      couple_public_view: { Row: CouplePublicRow; Relationships: [] }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
