import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge the custom token classes from tailwind.config.ts, otherwise it
// misreads them (e.g. `text-2xs` as a text colour) and drops one class of a real pair.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['heading', '2xs'] }],
      rounded: [{ rounded: ['card', 'control'] }],
      shadow: [{ shadow: ['popover'] }],
      'drop-shadow': [{ 'drop-shadow': ['card'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
