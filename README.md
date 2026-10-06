# 智伴成长 · Zhiban Growth

面向中小学劳动教育的虚实融合实训评价平台，包含教师、学生、家长三个入口。使用 React / Vinext、Cloudflare Workers、D1（SQLite）、R2，以及 Three.js。支持在本机运行，也提供 Node.js 本地数据库与文件存储适配器。

## 功能

- 教师：课程资源生成与编辑、任务发布、成果初审与终审、班级和学生管理、综评台账。
- 学生：劳动知识、任务提交、图片和视频上传、五类 Web3D 实训、成长档案 PDF。
- 家长：绑定学生、查看任务、教师评语、审核结果与成长档案。
- AI：教案/任务单/实训指导书/评价量表生成，照片与视频采样帧初审，批量初审，实训步骤提示、纠错与报告，成长报告。
- 通用：注册登录、角色权限、通知、个人资料、密码修改、媒体私有读取。

首页提供各身份的体验入口。体验空间与正式账号分开；演示记录带有标识。正式流程由教师创建班级、生成学生账号或邀请码，家长通过学生绑定码注册。

## 本机运行

推荐 Node.js 24 LTS 和 npm。以下命令在 macOS / Linux 或支持 Wrangler 的 Windows 开发环境执行：

```sh
npm ci
npm run typecheck
npm run build
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_whole_gravity.sql
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_tired_the_twelve.sql
npm start
```

以终端显示的本机地址为准。迁移命令用于首次初始化，已有数据库升级时只执行尚未应用的迁移，先备份数据。Wrangler 本地数据保存在 `.wrangler/state`。开发热更新可运行 `npm run dev`，默认端口 5173；使用同一持久化目录。

`.openai/hosting.json` 只保留通用 `DB` / `BUCKET` 绑定名称，不含任何个人托管项目 ID。上述流程无需 OpenAI 或 Cloudflare 账号登录。

## 配置自己的 AI

仓库不包含可用 API 密钥、个人 AI 配置或任何预配置成品包。AI 实现代码保留；未配置时使用模板及人工审核，AI 操作会提示配置状态。

将 `.env.example` 复制为项目根目录的 `.dev.vars`，填写自己的 `DEEPSEEK_API_KEY`，并按服务商支持的模型填写 `DEEPSEEK_MODEL` 和 `DEEPSEEK_BASE_URL`。这些文件已被 Git 忽略，配置只由服务端读取。API 调用需要联网并消耗配置者的余额。更改配置后重启服务。

## Node 本地运行与 Windows 打包

在完成 `npm run build` 后执行：

```sh
npm run desktop:prepare
```

生成 `desktop-build/ZhibanGrowth`，**默认不包含任何 AI 配置或用户数据**。在该目录中使用 Node.js 24 运行：

```sh
node --disable-warning=ExperimentalWarning --import ./launcher/register.mjs ./launcher/server.mjs
```

该模式自动创建 SQLite 数据库并应用迁移；上传文件保存到 `data/uploads`，账号和任务保存到 `data/zhiban.sqlite`。浏览器打开 `http://127.0.0.1:5173/`，服务只监听本机。各电脑之间不自动同步。

制作 Windows x64 便携包时，从 Node.js 官方下载 Windows x64 Node.js 24 LTS，校验官方 SHA256，将 `node.exe` 及相应许可证复制到成品目录的 `runtime` 中，再完整压缩该目录；接收方完整解压后双击 `Start.bat`。AI 配置由接收方通过 `ConfigureAI.bat` 自行填写。再次分享时排除 `config`、`data`、`backups` 和日志，并保留第三方依赖的许可证。当前启动与应用流程已在 macOS 的 Node 24 验证，Windows 真机运行尚未验证。

## AI 与教学范围

视频初审分析五个采样帧，不分析音频，不声称观看完整视频；AI 无法证明成果真实性。AI 初审分仅供参考，教师终审是最终评分依据。失败和重试保留已提交成果，迟到的 AI 结果不能覆盖教师终审。

课标关系图谱覆盖三类劳动、十个任务群和四个学段，依据[《义务教育劳动课程标准（2022 年版）》](https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582367012450.pdf)第 12 页图 1。资源中的教学步骤是可编辑改编，并非课标全文抽取，需教师核对。Web3D 实训是轻量模拟练习，不替代真实操作；规则评分每次顺序错误扣 10 分，AI 负责解释与反馈。

## 数据与贡献

开源仓库仅包含源码、迁移结构、静态资源和空白配置示例，不含实际账号、上传文件、数据库、日志、API 密钥或本地历史。请勿将这些文件提交到 Issue、Pull Request 或 Release。报告问题时先去除私人数据与密钥。

项目原创代码采用 [MIT License](LICENSE)。已引入的第三方代码保留各自许可证，见 `build/sites-vite-plugin.LICENSE` 和 `vendor` 目录；npm 依赖遵循各自包内许可证。
