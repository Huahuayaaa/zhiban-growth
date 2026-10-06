智伴成长｜开源版 Windows 本机运行

完整解压成品目录，双击 Start.bat，保持启动窗口打开。
浏览器地址：http://127.0.0.1:5173/
此版本不预置任何 API 密钥、账号或上传文件。
AI 功能需要自行双击 ConfigureAI.bat 配置密钥，联网并有可用余额。
首次启动自动创建 data/zhiban.sqlite 与 data/uploads。
停止网站后可用 Backup.bat 备份；恢复时停止网站并替换 data。
不自动跨电脑同步；关闭启动窗口或关机后网站停止。
再次分享时排除 config、data、backups 和日志。
需 runtime/node.exe（Node.js 24 Windows x64）；成品制作方法见源码 README。
Windows 真机运行尚未验证。
