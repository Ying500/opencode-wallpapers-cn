# 制作壁纸

壁纸是一个 TypeScript 模块，它把一个缓慢的场景绘制到浮点缓冲区中。插件会把该缓冲区转换成 OpenCode 文字背后的终端单元格。你可以把壁纸加进本仓库，也可以把它发布为你自己的包，并通过插件选项加载（见[你自己的包](#你自己的包)）。

## 快速开始

```sh
git clone https://github.com/Ying500/opencode-wallpapers-cn.git && cd opencode-wallpapers-cn
bun install
cp wallpapers/template.ts wallpapers/meadow.ts   # 然后把它的 id 改为 "meadow"
WALLPAPER_MODULES=$PWD/wallpapers/meadow.ts bun dev/snap.ts meadow teeming night 30
```

`wallpapers/template.ts` 是一段简短、带注释的壁纸，包含丘陵、一棵树、一个气球和几只鸟。它涵盖了下面这些基础内容。`wallpapers/farm.ts` 是一张完整的室外壁纸，包含季节、天气、agent 反应、点击和彩蛋。`WALLPAPER_MODULES`（逗号分隔的绝对路径）会把未在 `wallpapers/index.ts` 中注册的壁纸加入开发工具。

## 壁纸如何工作

一个 `Wallpaper`（来自 `src/wallpaper.ts`）为菜单描述这张壁纸并创建它的场景：

```ts
export const meadow: Wallpaper = {
  id: "meadow", // /wallpaper 所接受的参数：小写字母、数字和短横线
  name: "Meadow",
  description: "Rolling hills with a tree under drifting clouds",
  activity: { calm: "…", lively: "…", teeming: "…" }, // 每一档显示什么，用于菜单
  scrim: { day: [top, middle, bottom], sunset: […], night: […] }, // 见“底色”
  create: (settings) => new Meadow(settings), // 活跃度和时段，以及可选的季节和天气
}
```

每当壁纸、活跃度、时段、季节或天气变化时，都会创建一个新场景，因此场景永远不必自己切换外观；当旧场景交叉淡入新场景时，两者都会运行。每秒最多 15 次，引擎会用它需要的网格调用 `resize(W, H)`，然后用经过的秒数调用 `step(dt)`（空闲时以 5 fps 运行，每帧会调用多次，每次不超过 0.1 秒），接着调用 `render()`，最后读取 `pixels`。继承 `Canvas`（来自 `src/canvas.ts`）后，你只需编写 `step` 和 `render`。亮度由引擎应用，因此场景可以忽略它。

网格很小：一个 160x45 的终端在字符模式下是 320x180 子像素（每格 2x4），像素模式下是 480x270。`bun dev/snap.ts` 以 720x400 渲染。任何比约 2 子像素还细的东西都会闪烁或消失，所以要把物体的大小设成高度 `H` 的分数。大多数场景的 x 取 0 到 `A`（宽高比，`W / H`），y 取 0 到 1，再乘以 `H` 得到像素。

### step 和 render

`step(dt)` 移动物体。收敛 `dt`，让卡顿的一帧不会使物体跳跃，然后缩放它：

```ts
const TIME_SCALE = 0.35 // 场景以约三分之一实时速度运行
const CREATURE_SPEED = 0.25 // 动物和人以场景速度的四分之一活动

step(dt: number) {
  dt = clamp(dt, 0, 0.1) * TIME_SCALE
  this.time += dt
  this.creatureTime += dt * CREATURE_SPEED
}
```

`render()` 把线性光绘制到 `this.hdr`（每个像素 3 个浮点数，行优先），并以 `this.finish()` 结束，它会加入泛光（约 0.8 以上的值会发光）、暗角和色调映射，写入 `pixels`。`finish(exposure)` 接受一个曝光值，默认 1.25。

### 用 layout() 绘制静态背景

`layout()` 在每次 resize 之后、缓冲区匹配新尺寸时运行一次。把从不移动的东西画在那里（天空、山脉、建筑、一棵树），把 `hdr` 拷入一个字段，然后每帧都从那份拷贝开始：

```ts
protected override layout() {
  paintSky(this.hdr, this.W, this.H, this.look.sky, this.look.orb)
  // …丘陵、一棵树…
  this.background = this.hdr.slice()
}

render() {
  this.hdr.set(this.background)
  // …移动的东西…
  this.finish()
}
```

这是最大的一项节省：一次带噪声的全屏渐变比所有生物加起来还贵。

### 绘制

`Canvas` 的方法，全部以像素为单位，并与已有内容混合：

| 方法 | 绘制内容 |
| --- | --- |
| `add(x, y, r, g, b)` | 向单个像素叠加光，用于星星、火花和闪光 |
| `blend(i, r, g, b, a)` | 在你自己的循环中，按 `a` 把一种颜色混合进 `hdr` 索引 `i` 处的像素 |
| `disc(cx, cy, radius, r, g, b, a)` | 一个抗锯齿圆 |
| `ellipse(cx, cy, rx, ry, r, g, b, a)` | 一个抗锯齿的轴对齐椭圆 |
| `polygon(points, color, alpha?)` | 一个单色抗锯齿多边形，用于建筑、船只等直边物体 |
| `shape(parts, lighting, light?)` | 把圆润的部件组合成一个受光形体，用于生物、人和植物 |

对于水、沙或雾这类逐像素效果，直接遍历 `hdr`。

### 形状

`shape()` 接受一组 `Part`：

- `cap(ax, ay, bx, by, r0, r1, color, ribs?)` 是从 (ax, ay) 半径 r0 到 (bx, by) 半径 r1 的胶囊体：四肢、树干、脖子、尾巴、翅膀。
- `ell(cx, cy, rx, ry, angle, color, ribs?)` 是一个旋转 `angle` 的椭圆：身体、头、叶子。
- `ribs` 沿胶囊体（仙人柱）或横跨椭圆（南瓜）添加棱纹。

每个像素取它最深处所在部件的颜色，因此关节处无缝，一个部件也不会叠在另一个之上。要在身体上画条纹、眼睛或斑点，再调用一次 `shape()`：后调用的会覆盖先调用的。

### 光照

`shape()` 的第二个参数说明形状如何被照亮：

- `{ style: "front", dir: [x, y, z] }` 从一个方向打光（x 向右，y 向下，z 朝向观察者），并把每个部件着色成一个圆润形体。白天使用它。
- `{ style: "rim", color, x, y }` 从像素坐标中的某个点逆光照射，通常是太阳或月亮，因此只有朝向它的边缘受光，其余部分保持剪影。日落和夜晚使用它。

可选的第三个参数缩放效果：1 为完整光照，0 为平涂颜色（适合细线和微小细节），介于两者之间的值会柔化效果。

### 天空辅助函数

`src/sky.ts` 里有每张室外壁纸共享的部分：

- `paintSky(hdr, W, H, stops, orb)` 用一个穿过 `[高度分数, 颜色]` 停靠点的垂直渐变填充画布，在太阳或月亮周围加一圈光晕，并画出光球本身。一个 `Orb` 有 x（宽度分数）、y 和 r（高度分数）、`core` 和 `glow` 颜色、`near` 和 `wide` 光晕强度，以及用于有环形山月亮的 `moon: true`。
- `makeStars(count, top)` 和 `paintStars(hdr, W, H, stars, time, top, brightness)` 绘制朝 `top` 淡出的缓缓闪烁的星星。星星从 `STAR_TINTS` 取色，绝不会是白色。
- `makeClouds(count, puffy, y0, y1)`、`driftClouds(clouds, A, dt)` 和 `paintClouds(hdr, W, H, clouds, top, bottom, alpha, puffy)` 给出蓬松的积云或细长的云丝，从 `top` 到 `bottom` 着色。

`src/math.ts` 里有 `TAU`、`lerp`、`clamp`、`smoothstep`、`rand`、稳定的哈希（`hash`、`hash2`、`hashString`）、平滑噪声（`noise1`、`noise2`、`fbm1`、`fbm2`）、`hsv` 和 `RGB` 类型。

## 时段

每张壁纸把所有随时段变化的东西放在一个 `LOOKS: Record<Time, Look>` 里：天空停靠点、光球、光照颜色和风格、星星数量、云的颜色、地面颜色，以及一个 `tint`。物体和动物各拿一种白天颜色，再通过一个 `paint()` 方法按其时段加深它，因此新增一个物体无需逐时段的颜色：

```ts
private paint(c: RGB): RGB {
  const t = this.look.tint // 白天为 [1, 1, 1]，日落和夜晚为一种暗暖色调或蓝色调
  return [c[0] * t[0], c[1] * t[1], c[2] * t[2]]
}
```

白天通常用 `front` 打光，日落和夜晚用 `rim` 打光，因此物体在天空背景下读起来像剪影。给水、沙或雪这类大表面按每种外观各自的颜色，而不是一个 tint。引擎会把白天和日落场景去饱和约五分之一，夜晚则几乎不处理，因此夜晚能保住它的颜色。

夜晚绝不能使用白色或灰色高光，因为 OpenCode 的文字是白色的。改用饱和、带色调的颜色：钴蓝和青绿的月光、金色的月亮、琥珀色的灯和窗户、带色调的星星、发光的浮游生物或萤火虫。

## 季节与天气

`settings.season` 是春季、夏季、秋季或冬季，缺失时为经典外观。改变季节真正会改变的东西（花朵、树叶、雪、人群），对室内或不受时间影响的场景则什么都不改。

`settings.weather` 是晴、阴、雨、雪或雾，缺失时为壁纸自带的天气。室外场景用该天气、时段和地平线创建一个 `WeatherLayer`（来自 `src/weather.ts`），在 `layout()` 中紧跟天空绘制之后调用它的 `cover()`，在 `step` 中调用 `step(dt)`，在 `render()` 末尾、`finish()` 之前调用 `draw()`。当设置了 `covered` 时跳过星星，并使用 `scud` 给云着色。把 `light` 作为最后一个参数传入，可在没有云层的情况下得到季节性阵雨或小雪，就像农场在冬天那样。`wallpapers/farm.ts` 展示了全部这些。

## 底色

文字会得到一层柔和的底色，它在文字周围把场景淡向一种深色。`scrim` 给出该颜色（0 到 255），按每个时段在屏幕的顶部、中部和底部各一种。在这些深度上使用场景自身颜色更深、更饱和的版本，比黑色更好读：白天顶部是深天蓝、草地上是深绿，夜晚是深海军蓝。用 `bun dev/preview.ts` 检查每个时段下文字是否保持可读。

## 活跃度

- **静谧**是有景物、偶尔出点稀罕事的场景：水、风、云，大约每分钟路过一只生物。
- **活跃**增加几只动物。
- **繁盛**是完整的阵容。

在构造函数中检查 `this.activity`（有什么存在），在 `step` 和 `render` 中检查它（什么移动、什么被绘制）。东西也可以随时段变化：夜晚用猫头鹰代替鹰，用萤火虫代替鸟。

## Agent 反应、点击和彩蛋

全部可选，且都在 `Scene` 上：

- `react(event)` 接收 agent 的消息：`busy`、`done`、`error` 或 `idle`。`Canvas` 实现了它：重写 `visit()` 在任务完成时请出你罕见的访客，在 `step` 中调用 `stepGloom(dt)`，并按 `this.gloom`（0 到 1）加深你的光或画暴风云，`this.gloom` 在出错后上升、在下一个事件时回落。`src/sky.ts` 中的 `makeStorm()` 和 `paintStorm()` 给出像其他云一样飘移的乌云。引擎还会在 agent 工作时把场景稍微加快，并在出错后把它调暗，因此一个什么都不做的场景也会有反应。
- `poke(x, y)` 是一次对空白背景的点击，以屏幕高度为单位（x 从 0 到 `A`，y 从 0 到 1）。让反应保持轻微：`src/flock.ts` 中的 `startle()`、`flyAway()` 和 `bird()` 会从点击处惊起几只鸟。
- 对于非常罕见的惊喜，按场景秒数倒数 `eggWait() * TIME_SCALE`（来自 `src/egg.ts`），倒数结束后调用 `eggWait(true)` 开始下一次等待。这个等待由每个场景共享，因此更改设置不会重新开始它。

## 规则

- 保持平静：场景 `TIME_SCALE` 用 0.35，生物用它的 0.25 倍 `CREATURE_SPEED`。文字背后不该有忙碌的东西。
- 夜晚不用白色或灰色。
- 文字必须保持可读：每个时段都用深色底色调。
- 在任意宽高比下填满整个背景。把物体相对 `A` 放置，这样宽终端和窄终端都适用。
- 让每一帧都便宜（见下文）。

## 性能

一张典型壁纸在整个管线中、以 15 fps 运行，每帧耗时为 8 到 12 毫秒（`bun dev/check.ts`）。耗时随机器负载变化很大，所以要与一张已有的壁纸背靠背测量对比。

- 在 `layout()` 中一次性绘制静态的东西。
- 让热循环（每帧、每个像素运行的东西）保持为接收缓冲区和尺寸作为参数的模块级函数，比如 `src/canvas.ts` 中的 `fillShape` 和 `bloom`，而不是读取 `this.hdr` 和 `this.W` 的方法。Bun 的 JavaScript 引擎会针对它见过的对象形状优化字段读取，而每个壁纸类的形状都不同，所以切换壁纸后，一个共享方法会不断掉出它的优化代码（“BadCache”退出）并运行得更慢。
- 把逐像素循环限制在你正在绘制的区域，而不是整个屏幕。`Canvas` 的辅助函数已这样做。
- 在构造函数或 `layout()` 中把噪声和纹理预计算成类型化数组，而不是每帧逐像素调用 `fbm`。
- `shape()` 的代价约等于形状包围盒面积乘以其部件数。把一个蔓延的东西（一棵树、棕榈叶）画成几次更小的调用，并跳过屏幕外的东西。

## 开发工具

```sh
bun run typecheck
bun dev/check.ts [id...] [season] [weather]       # 每个活跃度和时段：错误、毫秒/帧、闪烁
bun dev/snap.ts <id> [activity] [time] [season] [weather] [seconds...] # 在 dev/out/ 中生成场景 PNG，并给出每次渲染的毫秒数
bun dev/preview.ts <id> [activity] [time] [season] [weather] [seconds] # 文字背后的终端单元格，输出为 PNG
bun dev/pixel-check.ts [id] [activity] [time]     # 针对模拟 kitty 终端的真实像素模式
bun dev/poke.ts <id> [activity] [time] <fx> <fy> [seconds...] # 在某个点点击（屏幕分数）
bun dev/fade.ts <id>:day <id>:night 50            # 交叉淡入到一半的一帧，以及它的开销
bun dev/gif.ts <id> [activity] [time]             # 在 dev/out 中生成 3 倍速循环 GIF
bun run screenshots                               # 若 README 画廊过期则失败
bun run screenshots:update                        # 重新渲染它（繁盛档，45 秒）
bun dev/gif.ts all                                # 重新渲染 README 的 GIF
```

- `check.ts` 在模拟的 160x45 屏幕上运行真实引擎。“每帧变化的单元格”就是闪烁：越低越平静。`--quiet` 只打印失败项，并且会在闪烁高于 `--max-flicker`（150）时失败，以及（如果给定）在帧慢于 `--max-ms` 时失败；CI 运行 `--quiet --max-ms=60`。开发渲染会为 `Math.random` 播种，因此可复现。`step` 或 `render` 中抛出的错误会在这里出现；在 OpenCode 内部它们只会记录到 `WALLPAPER_DEBUG`。
- `snap.ts` 在终端转换之前直接渲染场景，用于评判美术效果。
- `preview.ts` 显示终端将会显示的内容，含底色。
- `dev/pty.ts [seconds] [keys...]` 在伪终端中运行真实的 OpenCode 并键入每个按键参数，每次之后暂停 1.5 秒；`\r` 是 Enter，`\e` 是 Escape。`dev/pty-kitty.ts [id] [seconds]` 以 kitty 终端、像素模式做同样的事。用一个一次性配置文件（全新的 `XDG_DATA_HOME`、`XDG_CONFIG_HOME`、`XDG_STATE_HOME` 和 `XDG_CACHE_HOME`）以及 `OPENCODE_CLI_CONFIG_CONTENT='{"plugins":["/path/to/this/repo"]}'` 来运行它们。
- `WALLPAPER_DUMP=<file>` 让插件在约 8 秒后写入一帧终端单元格，`bun dev/cells.ts <file> <png>` 渲染它。
- `WALLPAPER_EVENTS="busy@2,done@12,error@30"` 在那些秒数播放 agent 事件，可在 OpenCode 或 `dev/snap.ts` 中使用。`WALLPAPER_EGG=1` 会在开始几秒后请出每一个彩蛋。`WALLPAPER_CLOCK=17:59` 把自动模式的时钟设在那里，用于观察一次时段过渡，`WALLPAPER_DUMP_FADE=<file>` 会转储交叉淡入过半之后的第一帧。
- `WALLPAPER=<id>`、`WALLPAPER_ACTIVITY`、`WALLPAPER_TIME`、`WALLPAPER_SEASON` 和 `WALLPAPER_WEATHER` 会在不更改已保存选择的情况下，在 OpenCode 内部固定一张壁纸，`WALLPAPER_DEBUG=<file>` 会记录引擎错误和统计信息。

## 向本仓库添加一张壁纸

1. 把它作为具名导出放进 `wallpapers/<id>.ts`，并加入 `wallpapers/index.ts`。
2. 运行 `bun run typecheck` 和 `bun dev/check.ts <id>`，并在每个时段查看 `dev/snap.ts` 和 `dev/preview.ts` 的输出。
3. 把它加入 README 的壁纸、活跃度、时段、agent 反应和点击各节，以及画廊和 GIF 表格。把它最好看的时段加入 `dev/gif.ts` 的 `BEST`，然后运行 `bun run screenshots:update` 和 `bun dev/gif.ts all`。

## 你自己的包

一个壁纸包从 `opencode-wallpapers/api` 导入 API，它包含 `Canvas`、`cap`、`ell`，以及天空、天气、鸟群、彩蛋和数学辅助函数，还有 `Wallpaper` 类型，且不依赖 OpenCode 或 OpenTUI。它还没上 npm，所以请构建本仓库的一份克隆，并按路径依赖它：

```sh
(cd ~/code/opencode-wallpapers && bun install && bun run build)
bun add -d ~/code/opencode-wallpapers
```

```ts
import { Canvas, type Settings, type Wallpaper } from "opencode-wallpapers/api"

class Meadow extends Canvas {
  // …
}

const meadow: Wallpaper = { id: "meadow", /* … */ create: (settings) => new Meadow(settings) }

export default meadow // 或一个壁纸数组
```

模块的默认导出是一张壁纸或它们的数组。把 `wallpapers/template.ts` 复制一份、并把它的 import 改为 `"opencode-wallpapers/api"`，就是一个可用的起点。用本仓库的开发工具测试它：
`WALLPAPER_MODULES=/path/to/meadow bun dev/check.ts meadow`。

要使用它，请在 `~/.config/opencode/cli.json` 中给插件一个 `wallpapers` 选项，列出模块或包目录的绝对路径（`~/` 可用）：

```json
{
  "plugins": [{ "package": "opencode-wallpapers", "options": { "wallpapers": ["~/code/meadow"] } }]
}
```

`package` 是你这份插件克隆的绝对路径。如果包安装在本插件自己的 `node_modules` 中，`wallpapers` 里也可以用包名。

加载的壁纸会出现在 `/wallpaper` 菜单中，排在内置壁纸之后。加载失败的模块，或看起来不像 `Wallpaper`、或使用了已被占用的 id 的壁纸，会被跳过并弹出一个指名它的错误 toast；而 `create` 抛错的壁纸会显示一个错误而不是启动。OpenCode 不会监视这些模块，因此编辑其中一个后请重启它。
