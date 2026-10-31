# 汉化说明（简体中文）

本仓库是 [vaprdev/opencode-wallpapers](https://github.com/vaprdev/opencode-wallpapers) 的汉化 fork：只翻译界面文字，不改动任何壁纸的实现与逻辑。设计目标是**上游更新后可以直接合并**。

## 汉化改了什么

只碰两处：

| 文件 | 改动 |
| --- | --- |
| `src/i18n/zh.ts` | **新增文件**，全部中文都在这一个词典里。上游没有这个文件，永远不会冲突。 |
| `tui.tsx` | 在“显示与输出”的边界处包了一层 `zh()`，共 30 余处，每处都是把英文字面量包进函数调用。 |

`wallpapers/*.ts`（约 900 KB，上游改动最频繁的部分）**完全没有改动**：壁纸的名称、描述、活跃度说明在加载时由 `translated()` 统一翻译。

## 运行期行为

- 词典里没有的文案**原样显示英文**。所以上游新增了设置项、命令或壁纸，界面只会出现一行英文，绝不会报错。
- 带变量的句子（如 `Auto (night)`、`Ocean wallpaper on`）由 `src/i18n/zh.ts` 里的 `rules` 正则处理，未被匹配就不翻译。
- 存储值、壁纸 `id`、`/wallpaper` 参数**保持英文不变**（`calm`、`night`、`saver`、`day` 等），所以已有的 `storage` 数据和命令行参数完全兼容。
- 多行消息（启动时被跳过的壁纸包、壁纸启动失败）会逐行翻译。
- 想临时用回英文：设置环境变量 `WALLPAPER_LANG=en`。

## 安装汉化版

```sh
opencode plugin add <你的GitHub用户名>/opencode-wallpapers#release
```

`release` 分支由 fork 的 CI 从 `main` 自动构建（沿用上游的 `.github/workflows/ci.yml`），无需手动编译或提交 `dist/`。

在本地跑这份代码：把仓库绝对路径填进 `~/.config/opencode/cli.json` 的 `plugins`，见上游 `CONTRIBUTING.md`。

## 同步上游

一次性设置：

```sh
git remote add upstream https://github.com/vaprdev/opencode-wallpapers.git
```

每次同步：

```sh
git fetch upstream
git merge upstream/main      # 或 git rebase upstream/main
bun install                  # 依赖变动时
bun run typecheck
bun run check                # 可选：跑壁纸渲染检查
git push origin main         # fork 的 CI 会自动重建 release 分支
```

冲突范围：因为中文全在 `src/i18n/zh.ts`，冲突只可能出现在 `tui.tsx` 里那些 `zh("...")` 包裹行。上游如果**改写了同一句英文**，合并后该句会退回英文显示，此时到 `src/i18n/zh.ts` 把旧英文键改成新英文即可：

```ts
// 上游把 "Time of day" 改成了 "Time"
"Time": "时段",
```

上游如果**新增**了文案，界面会显示英文，补一条同样的键值对即可。用 `dev/i18n` 之类的临时脚本可以批量核对哪些句子还没被翻译。

## 词典组织方式

`src/i18n/zh.ts` 分三部分：

1. `phrases`：整句精确匹配的英文 → 中文。
2. `rules`：带变量的句子，正则 + 模板。
3. 键会自动登记首字母大写的形式（`day` 与 `Day` 都能命中），因为界面显示前会做 `capitalize()`。

## 已知取舍

- 壁纸 `id`（`zen`、`haunted-house`）不翻译，`/wallpaper zen` 这样的参数保持不变；只有显示名是中文。
- 命令面板的 `/wallpaper` 参数说明保留英文参数名（`calm`、`teeming` 等），因为它们是实际可输入的参数值。
- 中文是双宽字符：已在 100 / 46 / 40 列宽度下实测 `wrapMode="word"` 的换行与右对齐，均正常。
