// Simplified Chinese for the plugin's interface.
//
// This file is the only place the Chinese text lives: the plugin's own sources stay untouched apart from a few display
// sites that call zh(), so pulling upstream commits rarely conflicts with the translation. Any phrase missing from the
// table falls through as the original English, so an upstream wording change can only leave a line untranslated, never
// break it. Set WALLPAPER_LANG=en to turn the translation off.
//
// Stored values, wallpaper ids and /wallpaper arguments are never translated: only what is shown.
const phrases: Record<string, string> = {
  // The picker's title, rows, values and descriptions.
  "Wallpaper settings": "壁纸设置",
  Wallpaper: "壁纸",
  Activity: "活跃度",
  "Time of day": "时段",
  Brightness: "亮度",
  Shuffle: "轮换",
  "Per project": "按项目",
  Power: "性能",
  Off: "关闭",
  On: "开启",
  "No wallpaper": "无壁纸",
  setting: "设置项",
  change: "更改",
  "Follows your clock: day from 7am, sunset from 6pm, night from 8pm": "跟随本地时钟：7 点起白天，18 点起日落，20 点起夜晚",
  "A dim scene that stays out of the way": "昏暗的场景，尽量不打扰阅读",
  "The standard look": "标准外观",
  "A brighter scene, with firmer shade behind text": "更明亮的场景，文字背后的遮罩更实",
  ", washed out for your light theme": "，已为浅色主题调淡",
  "Keep the wallpaper you chose": "保留你选择的壁纸",
  "Switch to a different wallpaper every hour": "每小时换一张壁纸",
  "Switch to a different wallpaper each time OpenCode starts": "每次启动 OpenCode 时换一张壁纸",
  "Every hour": "每小时",
  "Every session": "每次启动",
  "The same wallpaper in every project": "所有项目使用同一张壁纸",
  "Slows to 5 fps after 30 seconds without typing, mouse or agent activity, and pauses while the terminal is in the background":
    "无键盘、鼠标或智能体活动 30 秒后降至 5 fps，终端在后台时暂停",
  "Always 15 fps": "始终保持 15 fps",
  saver: "省电",
  smooth: "流畅",
  calm: "平静",
  lively: "生动",
  teeming: "繁盛",
  day: "白天",
  sunset: "日落",
  night: "夜晚",
  subtle: "柔和",
  normal: "标准",
  vivid: "鲜艳",

  // Key bindings and the command palette.
  "Previous setting": "上一项设置",
  "Next setting": "下一项设置",
  "Next value": "下一个值",
  "Previous value": "上一个值",
  Wallpapers: "壁纸",
  "Choose wallpaper": "选择壁纸",
  "Animated scene behind the UI. Args: wallpaper id, off, calm, lively, teeming, day, sunset, night, auto, subtle, normal, vivid, saver, smooth":
    "界面背后的动态场景。参数：壁纸 id、off、calm、lively、teeming、day、sunset、night、auto、subtle、normal、vivid、saver、smooth",
  "Turn off wallpaper": "关闭壁纸",
  "Cycle wallpaper activity": "切换壁纸活跃度",
  "Calm, lively, teeming": "calm、lively、teeming",
  "Cycle wallpaper time of day": "切换壁纸时段",
  "Auto, day, sunset, night": "auto、day、sunset、night",

  // Toasts.
  "Wallpaper off": "壁纸已关闭",

  // Wallpapers: names, descriptions and what each activity level adds.
  Ocean: "海洋",
  "Deep water, god rays, marine snow, and a whale that drifts past now and then": "深水、穿入水中的光柱、海雪，以及偶尔游过的鲸鱼",
  "Water, light and the whale": "水、光与鲸鱼",
  "Adds a fish and an octopus": "加入一条鱼和一只章鱼",
  "Adds a shark, diver, turtle and kelp": "加入鲨鱼、潜水员、海龟与海带",

  Desert: "沙漠",
  "Mesas and dunes with a saguaro, a cow skull, and a tumbleweed now and then": "台地与沙丘，一株巨人柱仙人掌、一个牛头骨，偶尔滚过一团风滚草",
  "Mesas, a saguaro and a skull": "台地、巨人柱仙人掌与牛头骨",
  "Adds a soaring eagle (an owl at night) and a rattlesnake": "加入盘旋的鹰（夜间为猫头鹰）与响尾蛇",
  "Adds vultures (bats at night), a howling coyote and more cacti": "加入秃鹫（夜间为蝙蝠）、仰天长吠的郊狼与更多仙人掌",

  Jungle: "丛林",
  "A misty rainforest with a waterfall, light through the canopy, and a toucan flying by now and then":
    "雾中的雨林，有瀑布、穿过树冠的光线，偶尔飞过一只巨嘴鸟",
  "Trees, vines, a waterfall and swaying leaves": "树木、藤蔓、瀑布与摇曳的叶片",
  "Adds a swinging spider monkey and blue morpho butterflies": "加入荡秋千的蜘蛛猴与大闪蝶",
  "Adds a jaguar, scarlet macaws, a tree frog and more butterflies": "加入美洲豹、绯红金刚鹦鹉、树蛙与更多蝴蝶",

  Space: "太空",
  "A ringed planet turning slowly below a nebula and drifting stars, with a comet now and then":
    "星云与漂移群星之下，一颗缓缓自转的带环行星，偶尔划过一颗彗星",
  "The planet, its rings, a moon and the stars": "行星、行星环、卫星与群星",
  "Adds an orbiting space station and a satellite": "加入环绕的空间站与一颗卫星",
  "Adds asteroids, a floating astronaut and a flying saucer": "加入小行星、漂浮的宇航员与飞碟",

  Farm: "农场",
  "Rolling fields with a red barn, a turning windmill and swaying corn, and a tractor now and then":
    "起伏的田野，红色谷仓、转动的风车与摇曳的玉米，偶尔来一辆拖拉机",
  "Barn, windmill, fields and corn": "谷仓、风车、田野与玉米",
  "Adds grazing cows and pecking chickens": "加入吃草的牛与啄食的鸡",
  "Adds a farmer, pigs in the mud and crows over the corn": "加入农夫、泥里的猪与玉米上空的乌鸦",

  Tundra: "冻原",
  "Snowy peaks, a frozen lake, igloos and a snowman under falling snow, with a snowy owl now and then":
    "雪峰、冰湖、冰屋与落雪中的雪人，偶尔飞来一只雪鸮",
  "Peaks, igloos, a snowman and falling snow": "雪峰、冰屋、雪人与落雪",
  "Adds waddling penguins and an arctic fox": "加入摇摇摆摆的企鹅与北极狐",
  "Adds a polar bear, an ice fisher and another snowman": "加入北极熊、冰钓者与另一个雪人",

  Beach: "海滩",
  "Waves washing up a sandy beach between swaying palms, with a sailboat on the horizon now and then":
    "浪花拍上沙滩，棕榈摇曳，偶尔有帆船出现在海平线上",
  "Sea, waves, sand and palm trees": "大海、浪花、沙滩与棕榈",
  "Adds leaping dolphins and seagulls": "加入跃起的海豚与海鸥",
  "Adds a crab, a surfer, an umbrella and a sandcastle": "加入螃蟹、冲浪者、遮阳伞与沙堡",

  City: "城市",
  "A skyline over a river, traffic on an elevated highway, and a blimp drifting over now and then":
    "河上的城市天际线、高架桥上的车流，偶尔飘过一艘飞艇",
  "Skyline, river and light traffic on the highway": "天际线、河流与高架上稀疏的车流",
  "Adds a train crossing the bridge and more traffic": "加入驶过桥面的列车与更多车流",
  "Adds neon signs, boats on the river, people on the street, and rain at night": "加入霓虹招牌、河上的船、街上的人，夜间还会下雨",

  "Zen garden": "禅意庭院",
  "A koi pond under a red bridge, raked gravel, stone lanterns and falling cherry petals, with a heron now and then":
    "红桥下的锦鲤池、耙纹砂石、石灯笼与飘落的樱花瓣，偶尔来一只苍鹭",
  "Garden, pond ripples, petals and a bamboo fountain": "庭院、池面涟漪、花瓣与竹制水景",
  "Adds koi circling under the lily pads": "加入在睡莲叶下绕圈的锦鲤",
  "Adds more koi, a frog on a lily pad and dragonflies": "加入更多锦鲤、睡莲叶上的青蛙与蜻蜓",

  Prehistoric: "史前",
  "A smoking volcano over ferns and cycads, with a T. rex stomping by now and then": "蕨类与苏铁上方冒着烟的火山，偶尔有霸王龙踏过",
  "Volcano, smoke, ferns and cycads": "火山、浓烟、蕨类与苏铁",
  "Adds a browsing sauropod and circling pterosaurs": "加入觅食的蜥脚类恐龙与盘旋的翼龙",
  "Adds a triceratops herd, dragonflies and a lake with something in it": "加入三角龙群、蜻蜓，还有一片水里似乎有东西的湖",

  "Haunted House": "鬼屋",
  "A crooked Victorian haunted house on a rise above a foggy graveyard under a huge moon, with a witch flying by now and then":
    "巨月之下、雾气弥漫的墓园高处，一栋歪斜的维多利亚式鬼屋，偶尔有女巫飞过",
  "The candle and jack-o'-lanterns flicker, fog creeps, a bat or two flits and the swing sways":
    "蜡烛与南瓜灯摇曳，雾气蔓延，一两只蝙蝠飞过，秋千轻晃",
  "Adds bats pouring from the turret, ghosts drifting by and a ghoul peeking out from behind a gravestone":
    "加入从塔楼涌出的蝙蝠、飘过的幽灵，以及从墓碑后探头的食尸鬼",
  "Adds a zombie shuffling through the graveyard, a hand clawing out of a grave, a witch crossing the moon and a light moving room to room":
    "加入在墓园里拖着步子走的僵尸、从坟里伸出的手、掠过月亮的女巫，以及逐个房间移动的灯光",

  Rider: "骑手",
  "A red capsule bike on pale cracked concrete, its rider walking up to it, with another of the gang speeding by now and then":
    "苍白开裂的混凝土上停着一辆红色胶囊摩托，骑手朝它走去，偶尔有同伙飞驰而过",
  "The bike, the rider standing by it, and drifting dust": "摩托、站在一旁的骑手与飘散的尘土",
  "He walks slowly up to the bike and back, and paper and pebbles skitter in the gusts":
    "他慢慢走向摩托又走回来，纸片与碎石被阵风吹得乱窜",
  "He rides off in a red tail-light streak and slides back in sideways": "他拖着一道红色尾灯冲出去，又侧滑着回来",

  Megacity: "巨型都市",
  "A canyon of towers over a neon avenue, where motorbikes ride off into the haze trailing red light":
    "霓虹大道两侧是高塔组成的峡谷，摩托拖着一道红光驶入雾中",
  "The glowing city, windows coming and going, and a distant bike now and then": "发光的都市、明灭的窗户，偶尔远处掠过一辆摩托",
  "Adds bikes riding up the avenue with their light trails, and searchlights sweeping the sky":
    "加入沿大道驶上来的摩托与它们的光轨，以及扫过夜空的探照灯",
  "Adds a biker gang streaming through, a sideways slide now and then, and an airship overhead": "加入成群疾驰的车队、偶尔的侧滑，以及头顶的飞艇",

  Dome: "穹顶",
  "A vast black energy dome over a ruined city, its foot blazing with light under a ring of clouds, with a gunship crossing now and then":
    "废墟城市上空巨大的黑色能量穹顶，底部在环形云层下炽烈发光，偶尔有炮艇掠过",
  "The dome, its slowly breathing light and the creeping cloud ring": "穹顶、缓缓明灭的光与蔓延的云环",
  "Light pulses out along the streets, rubble floats up and the sky's ripples spread": "光沿街道一阵阵扩散，碎石浮起，天空的涟漪荡开",
  "The dome swells and recedes, shockwaves roll through the clouds, rubble swirls up and lightning flickers":
    "穹顶胀缩，冲击波穿过云层，碎石旋起，闪电明灭",

  "Flower Box": "花盒",
  "The old 3D screensaver: a glossy box of colored patches spinning and bouncing, morphing into balls, a star and a pillow":
    "经典 3D 屏保：一只光滑的彩色方块旋转弹跳，变形为圆球、星形与枕头",
  "One object drifting and turning slowly, morphing between a cube, a cluster of balls and a pillow":
    "一个物体缓缓漂移旋转，在方块、球簇与枕头之间变形",
  "A little quicker, through the full morph cycle with the spiky star": "稍微快一些，走完整套变形，包括带尖刺的星形",
  "Three objects of different sizes bouncing independently, with faint phosphor trails": "三个大小不同的物体各自弹跳，拖着淡淡的荧光残影",

  "3D Maze": "3D 迷宫",
  "The old 3D maze screensaver: gliding through red brick corridors under a tiled ceiling, turning at every junction":
    "经典 3D 迷宫屏保：在瓷砖天花板下的红砖走廊里滑行，每个路口都转弯",
  "Long looks down each corridor between slow walks and turns": "慢走与转弯之间，在每条走廊里久久张望",
  "Gliding down the corridors, pausing to look along each new one": "在走廊中滑行，每遇到新走廊就停下来张望",
  "A little quicker, with spinning polyhedra floating in the corridors": "稍微快一些，走廊里还漂着旋转的多面体",

  "3D Pipes": "3D 管道",
  "The old 3D screensaver: glossy pipes growing through the dark one length at a time, turning at ball joints":
    "经典 3D 屏保：光滑的管道在黑暗中一段段生长，在球形接头处转弯",
  "One pipe growing slowly through the grid, over a long fill": "一根管道在网格中缓缓生长，铺满要很久",
  "Two or three pipes growing at once": "两三根管道同时生长",
  "Five pipes, quicker, some sweeping round in smooth bends": "五根管道，速度更快，有些沿圆弧平滑转弯",

  Mystify: "迷幻",
  "The old screensaver: bright polygons whose corners glide and bounce off the edges, trailing stacks of echoes":
    "经典屏保：明亮多边形的顶点滑行并撞边反弹，拖出层叠的残影",
  "One polygon drifting slowly": "一个多边形缓缓漂移",
  "The classic pair, in two colors": "经典的两个多边形，两种颜色",
  "Three polygons, a little quicker, with longer trails": "三个多边形，稍微快些，残影更长",

  "Flying OpenCode": "飞行 OpenCode",
  "The old flying-logos screensaver with OpenCode marks: colored marks stream out of the dark toward you, flapping as they fly":
    "经典飞行标志屏保的 OpenCode 版：彩色标记从黑暗中朝你涌来，边飞边扇动",
  "A few marks drifting slowly out of the middle": "几枚标记从中心缓缓飘出",
  "The classic stream of colored marks flying past": "经典的一串彩色标记飞掠而过",
  "A denser, quicker stream, the nearest marks trailing faint warp streaks": "更密更快的标记流，最近的标记拖出淡淡的光带",

  Universe: "宇宙",
  "A galaxy of light streaks swirling around the OpenCode icon, with app icons and little colored OpenCode marks drifting on its orbits":
    "光带环绕 OpenCode 图标旋转成星系，应用图标与小号彩色 OpenCode 标记在其轨道上漂移",
  "A thin swirl of streaks and a few icons": "稀疏的光带旋涡与几个图标",
  "A fuller swirl with more icons drifting through it": "更饱满的旋涡，更多图标在其中漂移",
  "The whole galaxy, dense with streaks and icons": "完整的星系，光带与图标密密麻麻",

  Matrix: "矩阵",
  "The digital rain: streams of mirrored katakana and digits falling down a black screen, pale mint heads trailing green":
    "数字雨：镜像片假名与数字从黑屏上落下，浅薄荷色的字头拖出绿色尾巴",
  "A few slow streams falling through the dark": "几道缓慢的字符流落过黑暗",
  "The classic rain, near streams over dimmer, slower ones behind": "经典的雨，近处字符流叠在更暗更慢的远处字符流上",
  "Dense, quicker rain, with now and then a bright code surge": "密集而急促的雨，偶尔有一阵明亮的代码涌动",

  Template: "模板",
  "Rolling hills with a tree under drifting clouds, and a hot-air balloon now and then": "起伏的山丘，云下有一棵树，偶尔升起热气球",
  "Hills, a tree and clouds": "山丘、一棵树与云",
  "Adds a hot-air balloon": "加入一只热气球",
  "Adds birds (fireflies at night)": "加入飞鸟（夜间为萤火虫）",
}

// Sentences with a value spliced in. Each replacement runs its groups through zh() too, so "Auto (night)" reads
// "自动（夜晚）".
const rules: [RegExp, (...groups: string[]) => string][] = [
  [/^Auto \((.+)\)$/, (value) => `自动（${zh(value)}）`],
  [/^Always (.+)$/, (value) => `固定为${zh(value)}`],
  [/^Wallpaper activity: (.+)$/, (value) => `壁纸活跃度：${zh(value)}`],
  [/^Wallpaper time: (.+)$/, (value) => `壁纸时段：${zh(value)}`],
  [/^Wallpaper power: (.+)$/, (value) => `壁纸性能：${zh(value)}`],
  [/^Wallpaper brightness: (.+)$/, (value) => `壁纸亮度：${zh(value)}`],
  [/^Wallpaper time follows your clock \((.+) now\)$/, (value) => `壁纸时段跟随本地时钟（现在是${zh(value)}）`],
  [/^(.+) wallpaper on$/, (name) => `${zh(name)} 壁纸已开启`],
  [/^(.+) wallpaper failed to start: (.+)$/, (name, error) => `${zh(name)} 壁纸启动失败：${error}`],
  [/^No wallpaper "(.+)"\. Available: (.+)$/, (arg, ids) => `没有「${arg}」这个壁纸。可用：${ids}`],
  [/^Each project remembers its own wallpaper, starting from the global one\. This project: (.+)$/, (path) => `每个项目记住自己的壁纸，初始沿用全局设置。当前项目：${path}`],
  // Brightness builds its line by appending this to the description of the level.
  [/^(.+), washed out for your light theme$/, (base) => `${zh(base)}，已为浅色主题调淡`],
  // What a skipped wallpaper package says, for the toast at startup.
  [/^Skipped wallpapers:\n([\s\S]+)$/, (lines) => `已跳过的壁纸：\n${zh(lines)}`],
  [/^(.+): use an absolute path or a package name$/, (spec) => `${spec}：请使用绝对路径或包名`],
  [/^(.+): no default export \(a Wallpaper or an array of them\)$/, (spec) => `${spec}：没有默认导出（应为 Wallpaper 或 Wallpaper 数组）`],
  [/^(.+): not a wallpaper object$/, (spec) => `${spec}：不是壁纸对象`],
  [/^(.+): name and description must be strings$/, (spec) => `${spec}：name 与 description 必须是字符串`],
  [/^(.+): create must be a function$/, (spec) => `${spec}：create 必须是函数`],
  [/^(.+): activity needs a description for each of (.+)$/, (spec, list) => `${spec}：activity 需要为 ${list} 分别提供描述`],
  [/^(.+): fixedTime must be one of (.+)$/, (spec, list) => `${spec}：fixedTime 必须是 ${list} 之一`],
  [/^(.+): scrim needs three RGB colors for each of (.+)$/, (spec, list) => `${spec}：scrim 需要为 ${list} 分别提供三个 RGB 颜色`],
  [/^(.+): the wallpapers option must be a list of module paths or package names$/, (spec) => `${spec}：wallpapers 选项必须是模块路径或包名的列表`],
]

const table = new Map<string, string>()
for (const [english, chinese] of Object.entries(phrases)) {
  table.set(english, chinese)
  // Values are shown capitalized (Off, Day, Saver...), so each phrase also answers to its capitalized form.
  const capitalized = english[0].toUpperCase() + english.slice(1)
  if (!table.has(capitalized)) table.set(capitalized, chinese)
}

// WALLPAPER_LANG=en turns the translation off, for anyone who prefers the English interface.
const english = process.env.WALLPAPER_LANG?.toLowerCase().startsWith("en") ?? false

// Chinese for anything the interface shows, and the input unchanged when there is no translation for it.
export function zh(text: string): string {
  if (english || !text) return text
  const exact = table.get(text)
  if (exact !== undefined) return exact
  for (const [pattern, translate] of rules) {
    const match = pattern.exec(text)
    if (match) return translate(...match.slice(1))
  }
  // A multi-line message (a package's skipped lines, a wallpaper error) is translated line by line.
  if (text.includes("\n")) {
    const lines = text.split("\n").map((line) => zh(line))
    return lines.some((line, i) => line !== text.split("\n")[i]) ? lines.join("\n") : text
  }
  return text
}
