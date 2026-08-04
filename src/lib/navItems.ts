import type { ComponentType, SVGProps } from 'react'
import {
  HomeIcon,
  ChatBubbleIcon,
  HeartIcon,
  CameraIcon,
  ImageIcon,
  CalendarIcon,
  EnvelopeIcon,
  TargetIcon,
  MapIcon,
  DiceIcon,
  GamepadIcon,
  GearIcon,
} from '@/components/ui/pixel-icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Beranda', icon: HomeIcon },
  { to: '/app/chat', label: 'Chat', icon: ChatBubbleIcon },
  { to: '/app/wishlist', label: 'Wishlist', icon: HeartIcon },
  { to: '/app/memories', label: 'Kenangan', icon: CameraIcon },
  { to: '/app/gallery', label: 'Galeri', icon: ImageIcon },
  { to: '/app/schedule', label: 'Jadwal Date', icon: CalendarIcon },
  { to: '/app/letters', label: 'Surat Masa Depan', icon: EnvelopeIcon },
  { to: '/app/goals', label: 'Couple Goals', icon: TargetIcon },
  { to: '/app/journey', label: 'Peta Perjalanan', icon: MapIcon },
  { to: '/app/date-ideas', label: 'Ide Date', icon: DiceIcon },
  { to: '/app/arcade', label: 'Arcade Room', icon: GamepadIcon },
  { to: '/app/settings', label: 'Pengaturan', icon: GearIcon },
]

// First 4 shown directly in the mobile bottom nav; the rest live under "More".
export const MOBILE_PRIMARY_COUNT = 4
