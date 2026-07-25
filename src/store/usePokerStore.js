import { create } from 'zustand'

export const usePokerStore = create((set, get) => ({
  tableSize: 6,
  effectiveStackBB: 25,
  heroPosition: 'BTN',
  currentAction: 'unopened',
  villainVpip: 22,
  villainPfr: 18,

  setTableSize: (tableSize) => set({ tableSize }),
  setEffectiveStackBB: (effectiveStackBB) => set({ effectiveStackBB }),
  setHeroPosition: (heroPosition) => set({ heroPosition }),
  setCurrentAction: (currentAction) => set({ currentAction }),
  setVillainVpip: (villainVpip) => set({ villainVpip }),
  setVillainPfr: (villainPfr) => set({ villainPfr }),

  getExploitativeShift: () => {
    const { villainVpip } = get()
    if (villainVpip > 35) return 'tighten'
    if (villainVpip < 15) return 'widen'
    return 'standard'
  },
}))
