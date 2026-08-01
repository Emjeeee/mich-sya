import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { EMPTY_BOARD, checkWinner, type Cell } from '@/lib/tictactoe'
import type { GameSessionRow } from '@/types'

/**
 * Online tic-tac-toe, one active session per couple. Synced via polling
 * (refetchInterval) rather than Supabase Realtime — good enough for a
 * turn-based game between two people, and keeps the app on one sync model.
 */
export function useTicTacToeSession() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  const queryKey = ['game-session', coupleId, 'tictactoe']

  const query = useQuery({
    queryKey,
    enabled: !!coupleId,
    refetchInterval: 2500,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('game_type', 'tictactoe')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as GameSessionRow | null
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey })
  }

  const startGame = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('game_sessions').insert({
        couple_id: coupleId!,
        game_type: 'tictactoe',
        board: EMPTY_BOARD,
        turn: user!.id,
        player_x: user!.id,
        created_by: user!.id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const joinGame = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('game_sessions')
        .update({ player_o: user!.id })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const makeMove = useMutation({
    mutationFn: async (input: { session: GameSessionRow; index: number }) => {
      const { session, index } = input
      const board = [...session.board] as Cell[]
      const mySymbol: Cell = session.player_x === user!.id ? 'x' : 'o'
      board[index] = mySymbol
      const result = checkWinner(board)
      const nextTurn = session.player_x === user!.id ? session.player_o : session.player_x

      const { error } = await supabase
        .from('game_sessions')
        .update({
          board,
          turn: result ? null : nextTurn,
          winner: result,
          status: result ? 'finished' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, startGame, joinGame, makeMove }
}
