import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { ScheduleRow, ScheduleStatus } from '@/types'

export interface ScheduleInput {
  title: string
  description?: string
  location?: string
  scheduled_date: string
  scheduled_time?: string
  status?: ScheduleStatus
}

export function useSchedule() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['schedules', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('scheduled_date', { ascending: true })
      if (error) throw error
      return data as ScheduleRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['schedules', coupleId] })
  }

  const addSchedule = useMutation({
    mutationFn: async (input: ScheduleInput) => {
      const { error } = await supabase.from('schedules').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        scheduled_date: input.scheduled_date,
        scheduled_time: input.scheduled_time || null,
        status: input.status ?? 'planned',
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: ScheduleStatus }) => {
      const { error } = await supabase
        .from('schedules')
        .update({ status: input.status })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addSchedule, updateStatus, removeSchedule }
}
