import { homedir } from "node:os"
import { ACTIVITIES, TIMES, type Wallpaper } from "./wallpaper"

// Imports wallpapers from other packages. Each module is an absolute path (~/ allowed) or a package name resolvable from
// this plugin, and its default export is a Wallpaper or an array of them. Anything else is skipped, with the reason
// in `skipped`, so one broken package doesn't take the others down.
export async function loadWallpapers(modules: unknown, builtin: readonly Wallpaper[]) {
  const wallpapers: Wallpaper[] = []
  const skipped: string[] = []
  if (modules === undefined) return { wallpapers, skipped }
  if (!Array.isArray(modules)) return { wallpapers, skipped: ["wallpapers 选项必须是一个模块路径或包名列表"] }
  const taken = new Set(builtin.map((w) => w.id))
  for (const spec of modules) {
    if (typeof spec !== "string" || spec.startsWith(".")) {
      skipped.push(`${JSON.stringify(spec)}：请使用绝对路径或包名`)
      continue
    }
    const loaded = await import(spec.startsWith("~/") ? homedir() + spec.slice(1) : spec).then(
      (module: { default?: unknown }) => module.default,
      // Bun's resolve errors aren't Error instances, but they have a message.
      (error: { message?: unknown } | undefined) => new Error(String(error?.message ?? error)),
    )
    if (loaded instanceof Error) {
      skipped.push(`${spec}：${loaded.message}`)
      continue
    }
    if (loaded === undefined) {
      skipped.push(`${spec}：没有默认导出（一个 Wallpaper 或其数组）`)
      continue
    }
    for (const value of Array.isArray(loaded) ? loaded : [loaded]) {
      const reason = problem(value, taken)
      if (reason) {
        skipped.push(`${spec}：${reason}`)
        continue
      }
      const wallpaper = value as Wallpaper
      taken.add(wallpaper.id)
      wallpapers.push(wallpaper)
    }
  }
  return { wallpapers, skipped }
}

// Why a value can't be used as a wallpaper, if it can't.
function problem(value: unknown, taken: Set<string>) {
  if (typeof value !== "object" || value === null) return "不是一个壁纸对象"
  const w = value as Record<string, unknown>
  if (typeof w.id !== "string" || !/^[a-z0-9-]+$/.test(w.id)) return `id ${JSON.stringify(w.id)} 只能使用小写字母、数字和短横线`
  if (taken.has(w.id)) return `id "${w.id}" 已被占用`
  if (typeof w.name !== "string" || typeof w.description !== "string") return `${w.id}：name 和 description 必须是字符串`
  if (typeof w.create !== "function") return `${w.id}：create 必须是一个函数`
  const activity = w.activity as Record<string, unknown> | undefined
  if (!ACTIVITIES.every((a) => typeof activity?.[a] === "string")) return `${w.id}：activity 需要为 ${ACTIVITIES.join(", ")} 中的每一项提供描述`
  const scrim = w.scrim as Record<string, unknown> | undefined
  const isScrim = (s: unknown) => Array.isArray(s) && s.length === 3 && s.every((c) => Array.isArray(c) && c.length === 3 && c.every((v) => typeof v === "number"))
  if (!TIMES.every((t) => isScrim(scrim?.[t]))) return `${w.id}：scrim 需要为 ${TIMES.join(", ")} 中的每一项提供三个 RGB 颜色`
}
