import { Plugin } from "@opencode/plugin/tui"
import { RGBA, TextAttributes } from "@opentui/core"
import { For, createEffect, createSignal, onCleanup } from "solid-js"
import { ACTIVITIES, BRIGHTNESSES, POWERS, SEASONS, TIMES, WEATHERS, createEngine, parseEvents, type Activity, type AgentEvent, type Brightness, type Power, type Season, type Time, type Weather } from "./src/engine"
import { REFRESH, coordinatesOf, forecast, type Forecast } from "./src/forecast"
import { loadWallpapers } from "./src/load"
import { WALLPAPERS } from "./wallpapers"

export default Plugin.define({
  id: "wallpapers",
  async setup(context) {
    const [stored, update] = context.storage.store<Stored>("wallpapers", {
      initial: { wallpaper: "", activity: "calm", time: "auto", power: "saver" },
    })
    const external = await loadWallpapers(context.options.wallpapers, WALLPAPERS)
    if (external.skipped.length) context.ui.toast.show({ message: `已跳过的壁纸：\n${external.skipped.join("\n")}`, variant: "error" })
    const wallpapers = [...WALLPAPERS, ...external.wallpapers]
    const engine = createEngine(context, { dump: process.env.WALLPAPER_DUMP, dumpFade: process.env.WALLPAPER_DUMP_FADE })
    // Environment overrides for development; they win over the stored choice.
    const pinned = process.env.WALLPAPER
    const pinnedActivity = process.env.WALLPAPER_ACTIVITY
    const pinnedTime = process.env.WALLPAPER_TIME
    const pinnedSeason = SEASONS.find((s) => s === process.env.WALLPAPER_SEASON)
    const pinnedWeather = WEATHER_SETTINGS.find((w) => w === process.env.WALLPAPER_WEATHER)
    // Settings saved before these options existed have none.
    const activity = () => stored.activity ?? "calm"
    const timeSetting = () => stored.time ?? "auto"
    const power = () => stored.power ?? "saver"
    const brightness = () => stored.brightness ?? "normal"
    const shuffleSetting = () => stored.shuffle ?? "off"
    const directory = () => context.location?.directory ?? context.data.location.default().directory
    // Where the wallpaper choice lives: the project's directory when per-project is on, otherwise "" for everywhere.
    const scope = (state: Stored) => (state.perProject ? directory() : "")
    const current = (state: Stored) => (state.perProject ? state.projects?.[directory()] : undefined) ?? state.wallpaper
    const choose = (draft: Stored, id: string) => {
      if (draft.perProject) draft.projects = { ...draft.projects, [directory()]: id }
      else draft.wallpaper = id
      draft.changed = { ...draft.changed, [scope(draft)]: Date.now() }
    }
    // A project without its own change time yet counts from the global one.
    const due = (state: Stored) => Date.now() - (state.changed?.[scope(state)] ?? state.changed?.[""] ?? 0) >= HOUR
    const other = (id: string) => {
      const others = wallpapers.filter((w) => w.id !== id)
      return others[Math.floor(Math.random() * others.length)].id
    }
    // Switches to a different wallpaper once an hour has passed. The check repeats under the storage lock, so several
    // running OpenCodes shuffle once between them.
    const shuffle = () =>
      update((draft) => {
        const id = current(draft)
        if (id && due(draft)) choose(draft, other(id))
      })
    // Every-session shuffle runs once per OpenCode start; memory storage outlives plugin hot reloads. It picks before
    // the first frame and shows the pick while it saves, so the previous wallpaper never appears.
    const [session, mark] = context.storage.memory("session", { initial: { shuffled: false } })
    const [picked, setPicked] = createSignal<string>()
    if (!session.shuffled && shuffleSetting() === "session" && current(stored)) {
      const id = other(current(stored))
      setPicked(id)
      void update((draft) => choose(draft, id)).finally(() => setPicked(undefined))
    }
    mark((draft) => {
      draft.shuffled = true
    })
    const shown = () => picked() ?? current(stored)
    // Auto follows the local clock, checked once a minute. WALLPAPER_CLOCK=HH:MM starts the clock there, for trying
    // auto's transitions.
    const [hour, minute] = (process.env.WALLPAPER_CLOCK ?? "").split(":").map(Number)
    const skew = process.env.WALLPAPER_CLOCK ? new Date().setHours(hour, minute, 0, 0) - Date.now() : 0
    const [now, setNow] = createSignal(new Date(Date.now() + skew))
    const clock = setInterval(() => setNow(new Date(Date.now() + skew)), 60_000)
    const timeChoice = () => TIMES.find((t) => t === pinnedTime) ?? timeSetting()

    const seasonSetting = () => stored.season ?? "auto"
    const weatherSetting = () => stored.weather ?? "off"
    // A place for local weather: "/wallpaper location <place>", else WALLPAPER_LOCATION.
    const location = () => stored.location || process.env.WALLPAPER_LOCATION || ""
    const [local, setLocal] = createSignal<Forecast>()
    // Seasons flip in the southern hemisphere, once the location's latitude is known.
    const south = () => (coordinatesOf(location())?.latitude ?? local()?.latitude ?? 0) < 0
    const season = () => {
      const setting = pinnedSeason ?? seasonSetting()
      return setting === "auto" ? seasonAt(now(), south()) : setting
    }
    const weather = (): Weather | undefined => {
      const setting = pinnedWeather ?? weatherSetting()
      if (setting === "off") return undefined
      if (setting === "local") return local()?.weather ?? "clear"
      return setting
    }

    // The scene follows the agent: busy while any session runs, then done, error or idle once the last one stops. A
    // subagent's failure is left to its parent; repeated end events for a session count once.
    const running = new Map<string, boolean>()
    let outcome: AgentEvent = "idle"
    const started = (sessionID: string) => {
      if (![...running.values()].some(Boolean)) engine.react("busy")
      running.set(sessionID, true)
    }
    const ended = (sessionID: string, result: AgentEvent) => {
      if (running.get(sessionID) === false) return
      running.set(sessionID, false)
      if (outcome !== "error" && !(result === "error" && context.data.session.get(sessionID)?.parentID)) outcome = result
      if ([...running.values()].some(Boolean)) return
      engine.react(outcome)
      outcome = "idle"
    }
    const unlisten = [
      context.data.on("session.execution.started", (event) => started(event.data.sessionID)),
      context.data.on("session.execution.succeeded", (event) => ended(event.data.sessionID, "done")),
      context.data.on("session.execution.failed", (event) => ended(event.data.sessionID, "error")),
      context.data.on("session.execution.interrupted", (event) => ended(event.data.sessionID, "idle")),
    ]
    const simulated = parseEvents(process.env.WALLPAPER_EVENTS).map((e) => setTimeout(() => engine.react(e.event), e.at * 1000))

    const notify = (message: string, variant: "info" | "error" = "info") => context.ui.toast.show({ message, variant })
    // Applies one /wallpaper argument and says what changed.
    const apply = async (arg: string): Promise<{ message: string; error?: true }> => {
      if (arg === "off") {
        await update((draft) => choose(draft, ""))
        return { message: "已关闭壁纸" }
      }
      const level = ACTIVITIES.find((a) => a === arg)
      if (level) {
        await update((draft) => {
          draft.activity = level
        })
        return { message: `壁纸活跃度：${level}` }
      }
      if (arg === "location" || arg.startsWith("location ")) {
        const place = arg.slice("location".length).trim()
        await update((draft) => {
          draft.location = place
        })
        return { message: place ? `壁纸位置：${place}` : "已清除壁纸位置" }
      }
      const s = SEASONS.find((value) => value === arg || `season ${value}` === arg)
      if (s || arg === "season auto") {
        await update((draft) => {
          draft.season = s ?? "auto"
        })
        return { message: s ? `壁纸季节：${s}` : `壁纸季节跟随日历（当前为 ${seasonAt(new Date(), south())}）` }
      }
      const w = WEATHER_SETTINGS.find((value) => (value === arg && value !== "off") || `weather ${value}` === arg)
      if (w) {
        await update((draft) => {
          draft.weather = w
        })
        if (w === "local" && !location()) return { message: "本地天气需要一个地点：/wallpaper location <城市或纬度,经度>。在此之前显示为晴", error: true }
        return { message: w === "off" ? "壁纸天气：各壁纸自带的天气" : `壁纸天气：${w}` }
      }
      const t = TIMES.find((value) => value === arg)
      if (t || arg === "auto") {
        await update((draft) => {
          draft.time = t ?? "auto"
        })
        return { message: t ? `壁纸时段：${t}` : `壁纸时段跟随你的时钟（当前为 ${timeAt(new Date())}）` }
      }
      const mode = POWERS.find((p) => p === arg)
      if (mode) {
        await update((draft) => {
          draft.power = mode
        })
        return { message: `壁纸功耗模式：${mode}` }
      }
      const b = BRIGHTNESSES.find((value) => value === arg)
      if (b) {
        await update((draft) => {
          draft.brightness = b
        })
        return { message: `壁纸亮度：${b}` }
      }
      const wallpaper = wallpapers.find((w) => w.id === arg)
      if (!wallpaper) return { message: `没有名为 "${arg}" 的壁纸。可用：${wallpapers.map((w) => w.id).join(", ")}`, error: true }
      await update((draft) => choose(draft, arg))
      return { message: `已开启 ${wallpaper.name} 壁纸` }
    }
    const run = async (input?: string) => {
      const arg = input?.trim().toLowerCase()
      if (!arg) return pick()
      const result = await apply(arg)
      notify(result.message, result.error ? "error" : "info")
    }
    // The picker works like OpenCode's settings: a row per setting with its value on the right. Enter or the arrow
    // keys change the highlighted row in place, and the dialog stays open until Escape.
    const rows: Row[] = [
      {
        title: "壁纸",
        values: () => ["off", ...wallpapers.map((w) => w.id)],
        value: () => shown() || "off",
        label: (v) => wallpapers.find((w) => w.id === v)?.name ?? "关闭",
        describe: (v) => wallpapers.find((w) => w.id === v)?.description ?? "无壁纸",
        set: apply,
      },
      {
        title: "活跃度",
        values: () => ACTIVITIES,
        value: activity,
        label: (v) => ACTIVITY_LABELS[v as Activity] ?? v,
        describe: (v) => (wallpapers.find((w) => w.id === shown()) ?? wallpapers[0]).activity[v as Activity],
        set: apply,
      },
      {
        title: "时段",
        values: () => ["auto", ...TIMES],
        value: timeSetting,
        label: (v) => (v === "auto" ? `自动（${TIME_LABELS[timeAt(now())]}）` : TIME_LABELS[v as Time]),
        describe: (v) => (v === "auto" ? "跟随你的时钟：早上 7 点起为白天，晚上 6 点起为日落，晚上 8 点起为夜晚" : `始终为${TIME_LABELS[v as Time]}`),
        set: apply,
      },
      {
        title: "季节",
        values: () => ["season auto", ...SEASONS.map((s) => `season ${s}`)],
        value: () => `season ${seasonSetting()}`,
        label: (v) => (v === "season auto" ? `自动（${SEASON_LABELS[seasonAt(now(), south())]}）` : SEASON_LABELS[v.slice(7) as Season]),
        describe: (v) =>
          v === "season auto"
            ? `跟随${south() ? "南" : "北"}半球的日历：春季从 ${south() ? "9" : "3"} 月开始，夏季从 ${south() ? "12" : "6"} 月开始，秋季从 ${south() ? "3" : "9"} 月开始，冬季从 ${south() ? "6" : "12"} 月开始`
            : `始终为${SEASON_LABELS[v.slice(7) as Season]}。农场、沙漠、丛林、海滩和禅意花园会随季节变化`,
        set: apply,
      },
      {
        title: "天气",
        values: () => ["off", "local", "clear", "rain", "snow", "fog"].map((w) => `weather ${w}`),
        value: () => `weather ${weatherSetting()}`,
        label: (v) => (v === "weather local" ? `本地（${location() ? weatherLabel(local()?.weather) : "未设置地点"}）` : WEATHER_LABELS[v.slice(8) as Weather]),
        describe: (v) => {
          if (v === "weather off") return "各壁纸自带的天气：苔原的降雪、冬季的飘雪、丛林雨季的阵雨、夜晚城市的降雨"
          if (v !== "weather local") return `室外壁纸始终为${WEATHER_LABELS[v.slice(8) as Weather]}`
          if (!location()) return "请先设置地点：/wallpaper location <城市或纬度,经度>，或 WALLPAPER_LOCATION"
          return `从 Open-Meteo 获取 ${location()} 的真实天气，每 30 分钟检查一次`
        },
        set: apply,
      },
      {
        title: "亮度",
        values: () => BRIGHTNESSES,
        value: brightness,
        label: (v) => BRIGHTNESS_LABELS[v as Brightness] ?? v,
        describe: (v) =>
          ({ subtle: "暗淡的画面，尽量不打扰视线", normal: "标准外观", vivid: "更明亮的画面，文字后有更实的底色" })[
            v as Brightness
          ] + (context.themeMode === "light" ? "，已为你的浅色主题淡化处理" : ""),
        set: apply,
      },
      {
        title: "随机切换",
        values: () => SHUFFLES,
        value: shuffleSetting,
        label: (v) => ({ off: "关闭", hourly: "每小时", session: "每次会话" })[v as Shuffle],
        describe: (v) =>
          ({
            off: "保留你选择的壁纸",
            hourly: "每小时切换到另一张壁纸",
            session: "每次 OpenCode 启动时切换到另一张壁纸",
          })[v as Shuffle],
        set: (v) =>
          update((draft) => {
            draft.shuffle = v as Shuffle
            draft.changed = { ...draft.changed, [scope(draft)]: Date.now() }
          }),
      },
      {
        title: "按项目",
        values: () => ["off", "on"],
        value: () => (stored.perProject ? "on" : "off"),
        label: (v) => (v === "on" ? "开启" : "关闭"),
        describe: (v) =>
          v === "on"
            ? `每个项目记住各自的壁纸，默认沿用全局设置。当前项目：${context.ui.format.path(directory())}`
            : "所有项目使用同一张壁纸",
        set: (v) =>
          update((draft) => {
            draft.perProject = v === "on"
          }),
      },
      {
        title: "功耗",
        values: () => POWERS,
        value: power,
        label: (v) => ({ saver: "省电", smooth: "流畅" })[v as Power],
        describe: (v) =>
          v === "saver"
            ? "在 30 秒无键盘、鼠标或 agent 活动后降至 5 fps，终端处于后台时暂停"
            : "始终 15 fps",
        set: apply,
      },
    ]
    const Picker = () => {
      const theme = context.theme.surface("dialog")
      const [selected, setSelected] = createSignal(0)
      let saving = false
      const change = async (index: number, direction: number) => {
        if (saving) return
        const row = rows[index]
        const values = row.values()
        const next = values[(values.indexOf(row.value()) + direction + values.length) % values.length]
        saving = true
        await row.set(next).finally(() => {
          saving = false
        })
      }
      const move = (direction: number) => {
        setSelected((i) => (i + direction + rows.length) % rows.length)
      }
      context.keymap.layer(() => ({
        mode: "modal",
        commands: [
          { bind: "up", title: "上一项设置", group: "壁纸", run: () => move(-1) },
          { bind: "ctrl+p", title: "上一项设置", group: "壁纸", run: () => move(-1) },
          { bind: "down", title: "下一项设置", group: "壁纸", run: () => move(1) },
          { bind: "ctrl+n", title: "下一项设置", group: "壁纸", run: () => move(1) },
          { bind: "right", title: "下一个取值", group: "壁纸", run: () => void change(selected(), 1) },
          { bind: "return", title: "下一个取值", group: "壁纸", run: () => void change(selected(), 1) },
          { bind: "left", title: "上一个取值", group: "壁纸", run: () => void change(selected(), -1) },
        ],
      }))
      return (
        <box gap={1} paddingBottom={1}>
          <box paddingLeft={4} paddingRight={4} flexDirection="row" justifyContent="space-between">
            <text fg={theme.text.base} attributes={TextAttributes.BOLD}>
              壁纸设置
            </text>
            <text fg={theme.text.muted} onMouseUp={() => context.ui.dialog.clear()}>
              esc
            </text>
          </box>
          <box>
            <For each={rows}>
              {(row, index) => {
                const active = () => selected() === index()
                const fg = () => (active() ? theme.text.action.primary.focused : theme.text.base)
                return (
                  <box
                    flexDirection="row"
                    paddingLeft={4}
                    paddingRight={4}
                    backgroundColor={active() ? theme.background.action.primary.focused : RGBA.fromInts(0, 0, 0, 0)}
                    onMouseUp={() => {
                      setSelected(index())
                      void change(index(), 1)
                    }}
                  >
                    <text flexGrow={1} fg={fg()} attributes={active() ? TextAttributes.BOLD : undefined}>
                      {row.title}
                    </text>
                    <text fg={active() ? fg() : theme.text.muted}>{active() ? `‹ ${row.label(row.value())} ›` : row.label(row.value())}</text>
                  </box>
                )
              }}
            </For>
          </box>
          <box paddingLeft={4} paddingRight={4}>
            <text fg={theme.text.muted} wrapMode="word">
              {rows[selected()].describe(rows[selected()].value())}
            </text>
          </box>
          <box paddingLeft={4} flexDirection="row" gap={2}>
            <text>
              <span style={{ fg: theme.text.base }}>
                <b>↑/↓</b>{" "}
              </span>
              <span style={{ fg: theme.text.muted }}>设置项</span>
            </text>
            <text>
              <span style={{ fg: theme.text.base }}>
                <b>enter ←/→</b>{" "}
              </span>
              <span style={{ fg: theme.text.muted }}>更改</span>
            </text>
          </box>
        </box>
      )
    }
    const pick = () => context.ui.dialog.show(() => <Picker />)
    const cycle = <T extends string>(options: readonly T[], value: T) => run(options[(options.indexOf(value) + 1) % options.length])

    const unslot = context.ui.slot({
      append: "app",
      render() {
        let chosen = ""
        createEffect(() => {
          const wallpaper = wallpapers.find((w) => w.id === (pinned ?? shown()))
          const level = ACTIVITIES.find((a) => a === pinnedActivity) ?? activity()
          const choice = timeChoice()
          const seasonChoice = pinnedSeason ?? seasonSetting()
          const weatherChoice = pinnedWeather ?? weatherSetting()
          // With the same choices as last time, only the clock or the local forecast can have changed the look: that
          // fades slowly.
          const key = `${wallpaper?.id} ${level} ${choice} ${seasonChoice} ${weatherChoice}`
          const slow = key === chosen
          chosen = key
          if (!wallpaper) return engine.stop()
          // Wallpapers from other packages may throw; that must not take down the plugin and its commands.
          try {
            engine.start(
              wallpaper,
              { activity: level, time: choice === "auto" ? timeAt(now()) : choice, brightness: brightness(), season: season(), weather: weather() },
              slow ? CLOCK_FADE : undefined,
            )
          } catch (error) {
            notify(`${wallpaper.name} 壁纸启动失败：${error instanceof Error ? error.message : String(error)}`, "error")
          }
        })
        createEffect(() => engine.power(power()))
        createEffect(() => {
          now()
          if (shuffleSetting() === "hourly" && current(stored) && due(stored)) void shuffle()
        })
        // Local weather is fetched only while it is the chosen setting.
        createEffect(() => {
          const place = location()
          if ((pinnedWeather ?? weatherSetting()) !== "local" || !place) return
          const refresh = () => void forecast(place).then(setLocal)
          refresh()
          const timer = setInterval(refresh, REFRESH)
          onCleanup(() => clearInterval(timer))
        })
        context.keymap.layer(() => ({
          mode: "global",
          commands: [
            {
              id: "wallpapers.choose",
              title: "选择壁纸",
              description:
                "UI 背后的动态画面。参数：壁纸 id、off、calm、lively、teeming、day、sunset、night、auto、某个季节、某种天气、location <地点>、subtle、normal、vivid、saver、smooth",
              group: "壁纸",
              palette: true,
              slash: { name: "wallpaper", arguments: true },
              run,
            },
            {
              id: "wallpapers.off",
              title: "关闭壁纸",
              group: "壁纸",
              palette: true,
              run: () => run("off"),
            },
            {
              id: "wallpapers.activity",
              title: "切换壁纸活跃度",
              description: "calm（静谧）、lively（活跃）、teeming（繁盛）",
              group: "壁纸",
              palette: true,
              run: () => cycle(ACTIVITIES, activity()),
            },
            {
              id: "wallpapers.time",
              title: "切换壁纸时段",
              description: "auto（自动）、day（白天）、sunset（日落）、night（夜晚）",
              group: "壁纸",
              palette: true,
              run: () => cycle(["auto", ...TIMES] as const, timeSetting()),
            },
          ],
        }))
        return null
      },
    })

    return () => {
      clearInterval(clock)
      for (const stop of unlisten) stop()
      for (const timer of simulated) clearTimeout(timer)
      engine.stop()
      unslot()
    }
  },
})

// Display names for the stored enum values, so the picker reads in Chinese while /wallpaper keeps taking the English ids.
const ACTIVITY_LABELS: Record<Activity, string> = { calm: "静谧", lively: "活跃", teeming: "繁盛" }
const TIME_LABELS: Record<Time, string> = { day: "白天", sunset: "日落", night: "夜晚" }
const SEASON_LABELS: Record<Season, string> = { spring: "春季", summer: "夏季", autumn: "秋季", winter: "冬季" }
const WEATHER_LABELS: Record<Weather, string> = { clear: "晴", overcast: "阴", rain: "雨", snow: "雪", fog: "雾" }
const BRIGHTNESS_LABELS: Record<Brightness, string> = { subtle: "低调", normal: "标准", vivid: "鲜明" }

// The local-weather label shows the fetched condition, or "checking" before the first result arrives.
function weatherLabel(value: Weather | undefined) {
  return value ? WEATHER_LABELS[value] : "查询中"
}

// Seconds auto takes to fade into the next time of day when the clock crosses into it.
const CLOCK_FADE = 45

const WEATHER_SETTINGS = ["off", "local", ...WEATHERS] as const
type WeatherSetting = (typeof WEATHER_SETTINGS)[number]

// Meteorological seasons: spring from March in the north, from September in the south.
function seasonAt(date: Date, south: boolean): Season {
  return SEASONS[(Math.floor(((date.getMonth() + 10) % 12) / 3) + (south ? 2 : 0)) % 4]
}

// Day from 7am, sunset around dawn and dusk, night from 8pm.
function timeAt(date: Date): Time {
  const hour = date.getHours() + date.getMinutes() / 60
  if (hour >= 20 || hour < 6) return "night"
  if (hour < 7 || hour >= 18) return "sunset"
  return "day"
}

const SHUFFLES = ["off", "hourly", "session"] as const
type Shuffle = (typeof SHUFFLES)[number]
const HOUR = 3_600_000

interface Stored {
  wallpaper: string
  activity?: Activity
  time?: Time | "auto"
  brightness?: Brightness
  power?: Power
  season?: Season | "auto"
  weather?: WeatherSetting
  // A place for local weather: a name or "latitude,longitude".
  location?: string
  shuffle?: Shuffle
  // Wallpapers by project directory, shown instead of the global one while perProject is on.
  perProject?: boolean
  projects?: Record<string, string>
  // When the wallpaper last changed, by scope, for hourly shuffle.
  changed?: Record<string, number>
}

// A setting in the picker: its values in order, how to show each, a line explaining the current one, and how to save one.
interface Row {
  title: string
  values: () => readonly string[]
  value: () => string
  label: (value: string) => string
  describe: (value: string) => string
  set: (value: string) => Promise<unknown>
}
