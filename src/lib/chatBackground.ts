// Fixed-color presets, independent of the active theme — a chat wallpaper is
// meant to be its own visual choice (like WhatsApp wallpapers), not something
// that reshuffles every time either partner switches theme.
export interface ChatBackgroundPreset {
  key: string
  label: string
  css: string
}

export const CHAT_BACKGROUND_PRESETS: ChatBackgroundPreset[] = [
  { key: 'blush', label: 'Blush', css: 'linear-gradient(160deg, #ffe4ec 0%, #ffd3e0 100%)' },
  { key: 'sunset', label: 'Sunset', css: 'linear-gradient(160deg, #fde68a 0%, #fca5a5 55%, #f472b6 100%)' },
  { key: 'midnight', label: 'Midnight', css: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)' },
  { key: 'mint', label: 'Mint', css: 'linear-gradient(160deg, #d1fae5 0%, #a7f3d0 100%)' },
  { key: 'lavender', label: 'Lavender', css: 'linear-gradient(160deg, #ede9fe 0%, #ddd6fe 100%)' },
  { key: 'ocean', label: 'Ocean', css: 'linear-gradient(160deg, #bae6fd 0%, #93c5fd 100%)' },
]

export function presetCss(key: string | null) {
  return CHAT_BACKGROUND_PRESETS.find((p) => p.key === key)?.css
}
