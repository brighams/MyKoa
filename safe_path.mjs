// safePath.mjs
import fs from 'fs/promises'
import path from 'path'

/**
 * Normalize & canonicalize a path string for safe comparison.
 * - Resolves symlinks (realpath if mustExist)
 * - Normalizes separators
 * - On Windows, lowercases (case-insensitive fs)
 */
const toCanonical = async (p, {mustExist = true} = {}) => {
  if (!mustExist) {
    // Resolve as much as possible of the path
    const parts = path.resolve(p).split(path.sep)
    for (let i = parts.length; i > 0; i--) {
      const probe = parts.slice(0, i).join(path.sep) || path.sep
      try {
        const realAncestor = await fs.realpath(probe)
        const remainder = parts.slice(i).join(path.sep)
        return canonicalizeString(
          remainder ? path.join(realAncestor, remainder) : realAncestor
        )
      } catch {
        // keep walking up
      }
    }
    return canonicalizeString(path.resolve(p))
  }

  const real = await fs.realpath(p)
  return canonicalizeString(real)
}

const canonicalizeString = (p) => {
  let out = path.normalize(p)
  if (process.platform === 'win32') {
    out = out.replace(/\//g, '\\').toLowerCase()
  }
  return out
}

/**
 * Checks whether `targetPath` is inside ANY of the `safeParents`.
 * @param {string} targetPath - file or directory to check
 * @param {string[]} safeParents - directories considered trusted
 * @param {object} [opts]
 * @param {boolean} [opts.mustExist=true] - require target to exist on disk
 */
export const is_safe_path = async (targetPath, safeParents, opts = {mustExist: true}) => {
  if (!Array.isArray(safeParents) || safeParents.length === 0) return false

  const [canonTarget, canonParents] = await Promise.all([
    toCanonical(targetPath, opts),
    Promise.all(safeParents.map((p) => toCanonical(p, {mustExist: true})))
  ])

  for (const base of canonParents) {
    const rel = path.relative(base, canonTarget)
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
      return true
    }
  }
  return false
}
