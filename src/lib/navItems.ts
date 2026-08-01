export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Beranda', icon: '🏠' },
  { to: '/app/wishlist', label: 'Wishlist', icon: '💝' },
  { to: '/app/memories', label: 'Kenangan', icon: '📸' },
  { to: '/app/gallery', label: 'Galeri', icon: '🖼️' },
  { to: '/app/schedule', label: 'Jadwal Date', icon: '🗓️' },
  { to: '/app/letters', label: 'Surat Masa Depan', icon: '✉️' },
  { to: '/app/goals', label: 'Couple Goals', icon: '🎯' },
  { to: '/app/journey', label: 'Peta Perjalanan', icon: '🗺️' },
  { to: '/app/date-ideas', label: 'Ide Date', icon: '🎲' },
  { to: '/app/arcade', label: 'Arcade Room', icon: '🕹️' },
  { to: '/app/settings', label: 'Pengaturan', icon: '⚙️' },
]

// First 4 shown directly in the mobile bottom nav; the rest live under "More".
export const MOBILE_PRIMARY_COUNT = 4
