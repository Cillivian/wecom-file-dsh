/**
 * Placement decisions, kept pure so both entry points agree and the matrix is
 * testable without a DOM.
 */
import type { PickerPlacement } from '../shared/protocol.ts'

/** The composer tool-row button shows for every placement except menu-only. */
export function showsToolRow(placement: PickerPlacement): boolean {
  return placement !== 'plusMenu'
}

/** The `+` command-menu row is contributed whenever the menu is part of the placement. */
export function usesPlusMenu(placement: PickerPlacement): boolean {
  return placement === 'plusMenu' || placement === 'both'
}
