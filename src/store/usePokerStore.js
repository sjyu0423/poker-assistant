import { create } from 'zustand'

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

/** Seat immediately before `pos` in table order (e.g. BB → SB). */
function getAdjacentPosition(pos) {
  const index = POSITIONS.indexOf(pos)
  if (index === -1) return 'BTN'
  return POSITIONS[(index - 1 + POSITIONS.length) % POSITIONS.length]
}

export const usePokerStore = create((set) => ({
  heroPosition: 'BTN',
  villainPosition: 'BB',
  effectiveStackBB: 25,

  setEffectiveStackBB: (effectiveStackBB) => set({ effectiveStackBB }),

  setHeroPosition: (pos) =>
    set((state) => {
      if (pos === state.villainPosition) {
        return {
          heroPosition: pos,
          villainPosition: getAdjacentPosition(pos),
        }
      }
      return { heroPosition: pos }
    }),

  setVillainPosition: (pos) =>
    set((state) => {
      if (pos === state.heroPosition) {
        return {
          villainPosition: pos,
          heroPosition: getAdjacentPosition(pos),
        }
      }
      return { villainPosition: pos }
    }),
}))
