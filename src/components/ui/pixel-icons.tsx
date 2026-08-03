// A self-contained "8-bit" icon set: every icon is an 8x8 bitmap rendered as
// filled unit squares with crisp (non-antialiased) edges — no icon library
// dependency, just data. Add a new icon by adding a bitmap below.
import type { SVGProps } from 'react'

type Bitmap = string[] // 8 rows of 8 chars; any char other than '.' is filled

function PixelIcon({ bitmap, ...props }: { bitmap: Bitmap } & SVGProps<SVGSVGElement>) {
  const size = bitmap.length
  const cells: { x: number; y: number }[] = []
  bitmap.forEach((row, y) => {
    row.split('').forEach((c, x) => {
      if (c !== '.') cells.push({ x, y })
    })
  })
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="currentColor"
      shapeRendering="crispEdges"
      {...props}
    >
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} />
      ))}
    </svg>
  )
}

const BITMAPS = {
  home: ['...XX...', '..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XX.XX.XX', 'XX.XX.XX', 'XX....XX', 'XX....XX'],
  heart: ['.XX..XX.', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '........'],
  camera: ['........', '.XX.....', 'XXXXXXXX', 'X.XXXX.X', 'X.X..X.X', 'X.XXXX.X', 'XXXXXXXX', '........'],
  image: ['XXXXXXXX', 'X......X', 'X..XX..X', 'X......X', 'X....X.X', 'X..X.XXX', 'X.XXXXXX', 'XXXXXXXX'],
  calendar: ['.X.XX.X.', 'XXXXXXXX', 'XXXXXXXX', 'X......X', 'X.X..X.X', 'X......X', 'X.X..X.X', 'XXXXXXXX'],
  envelope: ['XXXXXXXX', 'XX....XX', 'X.X..X.X', 'X..XX..X', 'X......X', 'X......X', 'X......X', 'XXXXXXXX'],
  target: ['..XXXX..', '.X....X.', 'X.XXXX.X', 'X.X..X.X', 'X.X..X.X', 'X.XXXX.X', '.X....X.', '..XXXX..'],
  map: ['..XXXX..', '.X....X.', 'X..XX..X', 'X..XX..X', '.X....X.', '..XXXX..', '...XX...', '...XX...'],
  dice: ['XXXXXXXX', 'X......X', 'X.X..X.X', 'X......X', 'X..XX..X', 'X......X', 'X.X..X.X', 'XXXXXXXX'],
  gamepad: ['.XX..XX.', 'XXXXXXXX', 'X.X..X.X', 'X......X', 'X......X', 'X.X..X.X', 'XXXXXXXX', '........'],
  gear: ['.X.XX.X.', 'XXXXXXXX', 'X.XXXX.X', 'XX.XX.XX', 'XX.XX.XX', 'X.XXXX.X', 'XXXXXXXX', '.X.XX.X.'],
  dots: ['........', '........', 'XX.XX.XX', 'XX.XX.XX', '........', '........', '........', '........'],
  chevronLeft: ['....XX..', '...XX...', '..XX....', '.XX.....', '..XX....', '...XX...', '....XX..', '........'],
  chevronRight: ['..XX....', '...XX...', '....XX..', '.....XX.', '....XX..', '...XX...', '..XX....', '........'],
  sun: ['X.X..X.X', '.X.XX.X.', '..XXXX..', 'XXXXXXXX', 'XXXXXXXX', '..XXXX..', '.X.XX.X.', 'X.X..X.X'],
  moon: ['...XXX..', '..XXXXX.', '.XXXXXX.', 'XXXXXXX.', 'XXXXXXX.', '.XXXXXX.', '..XXXXX.', '...XXX..'],
  logout: ['XX......', 'XX...XX.', 'XX..XXXX', 'XXXXXXXX', 'XX..XXXX', 'XX...XX.', 'XX......', '........'],
  grid3: ['........', 'XX.XX.XX', 'XX.XX.XX', '........', 'XX.XX.XX', 'XX.XX.XX', '........', '........'],
  cards: ['.XXXXXX.', '.X....X.', '.X....X.', 'XXXXXXX.', 'X.....X.', 'X.....X.', 'XXXXXXX.', '........'],
  connect4: ['X.X.X.X.', 'X.X.X.X.', '........', 'X.X.X.X.', 'X.X.X.X.', '........', 'X.X.X.X.', 'X.X.X.X.'],
  hand: ['..XX.XX.', '..XX.XX.', '.XXXXXXX', '.XXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..'],
  tile2048: ['XXXXXXXX', 'X......X', 'X.XXXX.X', 'X.X..X.X', 'X.X..X.X', 'X.XXXX.X', 'X......X', 'XXXXXXXX'],
  snake: ['XX......', 'XX......', 'XXXXXX..', '.....X..', '.....X..', '..XXXX..', '..X.....', '..X.....'],
  pad4: ['.XXXX...', 'XXXXXX..', 'XXXXXX..', '.XXXX...', '...XXXX.', '..XXXXXX', '..XXXXXX', '...XXXX.'],
  mallet: ['..XXXXX.', '.XXXXXXX', '.XXXXXXX', '..XXXXX.', '....XX..', '....XX..', '....XX..', '...XXXX.'],
  bolt: ['....XX..', '...XX...', '..XX....', '.XXXXXX.', '....XX..', '...XX...', '..XX....', '.XX.....'],
  question: ['.XXXXX..', 'XX...XX.', '....XX..', '...XX...', '..XX....', '..XX....', '........', '..XX....'],
  letters: ['........', 'XX.XX.XX', 'XX.XX.XX', '........', 'XX.XX.XX', 'XX.XX.XX', '........', '........'],
  quizface: ['..XXXX..', '.X....X.', 'X.X..X.X', 'X......X', 'X.XXXX.X', 'X......X', '.X....X.', '..XXXX..'],
  puzzlepiece: ['.XXXX...', 'XXXXXX..', 'XXXXXXXX', '.XXXXXXX', '..XXXXXX', 'XXXXXXXX', '..XXXX..', '........'],
  gallows: ['XXXXXXX.', 'X.......', 'X.......', 'X..XX...', 'X..XX...', 'X.XXXX..', 'X.......', 'XXXXXXX.'],
  brain: ['.XXX.XX.', 'XXXXXXXX', 'X.XX.XXX', 'XXXXXXXX', 'X.XX.XXX', 'XXXXXXXX', '.XX.XXX.', '..XXXX..'],
  spinner: ['..XXXX..', '.X....X.', 'X..XX..X', 'X..XX..X', 'X..XX..X', 'X......X', '.X....X.', '..XXXX..'],
  fork: ['..X..X..', '..X..X..', '..X..X..', '..XXXX..', '...XX...', '...XX...', '...XX...', '...XX...'],
  tap: ['...XX...', '...XX...', '...XX...', '..XXXX..', '.XXXXXX.', '.XXXXXX.', '..XXXX..', '........'],
  palette: ['.XXXXX..', 'X.....X.', 'X.XX..X.', 'X......X', 'X..XX.XX', 'X......X', '.X....X.', '..XXXX..'],
  check: ['.......X', '......XX', '.....XX.', 'X...XX..', 'XX.XX...', '.XXX....', '..X.....', '........'],
  edit: ['.....XXX', '....XX..', '...XX...', '.XX.XX..', 'XX.XX...', 'XXXX....', 'X.XX....', 'XXXX....'],
  list: ['X.XXXXXX', '........', 'X.XXXXXX', '........', 'X.XXXXXX', '........', 'X.XXXXXX', '........'],
} satisfies Record<string, Bitmap>

export type PixelIconName = keyof typeof BITMAPS

function make(name: PixelIconName) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return <PixelIcon bitmap={BITMAPS[name]} {...props} />
  }
}

/** Generic entry point — pass any icon name (e.g. from the game registry). */
export function Pixel({ name, ...props }: { name: PixelIconName } & SVGProps<SVGSVGElement>) {
  return <PixelIcon bitmap={BITMAPS[name]} {...props} />
}

export const HomeIcon = make('home')
export const HeartIcon = make('heart')
export const CameraIcon = make('camera')
export const ImageIcon = make('image')
export const CalendarIcon = make('calendar')
export const EnvelopeIcon = make('envelope')
export const TargetIcon = make('target')
export const MapIcon = make('map')
export const DiceIcon = make('dice')
export const GamepadIcon = make('gamepad')
export const GearIcon = make('gear')
export const DotsIcon = make('dots')
export const ChevronLeftIcon = make('chevronLeft')
export const ChevronRightIcon = make('chevronRight')
export const SunPixelIcon = make('sun')
export const MoonPixelIcon = make('moon')
export const LogoutPixelIcon = make('logout')
export const CheckIcon = make('check')
export const EditIcon = make('edit')
export const ListIcon = make('list')
