# Coding Tool Helper (chelper)

一个通用的编码工具配置助手，支持为多种 AI 编码工具（Claude Code、OpenCode、Crush、Factory Droid）配置自定义的 API 端点和密钥。

## ✨ 特性

- 🔧 **通用配置**：支持配置任意兼容的 API URL 和密钥
- 🛠️ **多工具支持**：支持 Claude Code、OpenCode、Crush、Factory Droid
- 🌍 **多语言界面**：支持中文和英文界面
- 📦 **一键配置**：自动将配置应用到选定的工具
- 💾 **本地存储**：所有配置仅保存在本地，保护隐私

## 📦 安装

```bash
npm install
```

## 🚀 快速开始

### 方法 1：直接运行（推荐）

```bash
npx .
```

### 方法 2：使用 npm 脚本

```bash
npm run start
```

## 🚀 Claude Code 增强功能

除了配置管理，本工具还提供了增强 Claude Code 使用体验的功能。

### 📋 Session 管理

解决了 Claude Code 原生不支持会话记忆的问题。使用此功能，您可以：
- 💾 **保存会话状态**：退出终端后，会话历史和上下文会被保存。
- 🔄 **恢复会话**：下次启动时，可以恢复到之前的会话状态。
- 📂 **多会话管理**：支持创建多个独立的会话，分别用于不同的项目或任务。

#### 使用方法

**1. 交互式启动（推荐）**

启动时选择已有会话或创建新会话：

```bash
# 如果已全局安装
chelper start

# 或者在项目目录下
npm run start -- start
# 或
node dist/cli.js start
```

按照提示选择会话即可进入 Claude Code 终端。

**2. 指定会话启动**

直接进入指定名称的会话：

```bash
# 启动名为 "my-project" 的会话
chelper start my-project
```

#### 🛠️ Session 管理命令

您也可以使用命令行直接管理会话：

```bash
# 列出所有会话
chelper session list

# 重命名会话
chelper session rename <旧名称> <新名称>
```

#### 工作原理

该工具通过管理 `~/.claude` 目录来实现会话隔离。每个会话的数据存储在 `~/.claude-sessions` 目录下。启动会话时，工具会自动将对应会话的数据恢复到 `~/.claude`，并在退出时保存更改。

## 📖 使用指南

### 首次配置流程

首次运行时，会自动进入配置向导：

```
步骤 1: 选择界面语言
  → [EN] English
  → [CN] 中文

步骤 2: 配置 API URL
  → 输入您的 API 端点地址（例如：https://api.example.com）
  → 支持 HTTP 和 HTTPS 协议
  → 会自动验证 URL 格式

步骤 3: 配置 API Key
  → 输入您的 API 密钥
  → 输入时会显示为 ●●●● 保护隐私

步骤 4: 选择编码工具
  → Claude Code
  → OpenCode
  → Crush
  → Factory Droid

步骤 5: 自动应用配置
  → 配置会自动写入工具的配置文件
  → 完成后可直接使用工具
```

### 主菜单功能

```
主菜单
├── 界面语言          # 切换界面语言（中文/英文）
├── API URL           # 配置或更新 API URL
├── API Key           # 配置或更新 API Key
├── 编码工具          # 选择并配置工具
└── 退出              # 退出程序
```

### 配置示例

#### 示例 1：配置 Claude Code

```bash
# 1. 启动配置工具
npx .

# 2. 选择"API URL"
输入：https://api.anthropic.com

# 3. 选择"API Key"
输入：sk-ant-api03-...

# 4. 选择"编码工具" → "Claude Code"
# 配置会自动应用到 ~/.claude/settings.json

# 5. 使用 Claude Code
claude
```

#### 示例 2：配置自定义 API 端点

```bash
# 1. 启动配置工具
npx .

# 2. 选择"API URL"
输入：https://your-custom-api.com/v1

# 3. 选择"API Key"
输入：your-custom-api-key

# 4. 选择"编码工具" → "Claude Code"
# 配置会自动应用
```

#### 示例 3：配置 OpenCode

```bash
# 1. 启动配置工具
npx .

# 2. 配置 URL 和 Key

# 3. 选择"编码工具" → "OpenCode"
# 配置会自动应用到 ~/.config/opencode/opencode.json

# 4. 使用 OpenCode
opencode
```

## 🛠️ 支持的工具

| 工具 | 命令 | 配置文件位置 |
|------|------|------------|
| **Claude Code** | `claude` | `~/.claude/settings.json` |
| **OpenCode** | `opencode` | `~/.config/opencode/opencode.json` |
| **Crush** | `crush` | `~/.config/crush/crush.json` |
| **Factory Droid** | `droid` | `~/.factory/config.json` |

## 📂 配置文件

本工具的配置保存在：

- **配置目录**：`~/.chelper/`
- **配置文件**：`~/.chelper/config.yaml`

配置文件格式（YAML）：

```yaml
lang: en_US          # 界面语言
url: https://api.example.com  # API URL
api_key: sk-xxx...   # API 密钥
```

## 🔄 更新配置

如果需要更新 URL 或 API Key：

1. 运行 `npx .`
2. 选择对应选项（API URL 或 API Key）
3. 输入新的值
4. 重新选择"编码工具"应用新配置

## ❓ 常见问题

### Q: 配置会保存在哪里？
A: 所有配置都保存在本地：
- 工具配置：各工具的配置文件（见上方表格）
- 本工具配置：`~/.chelper/config.yaml`

### Q: 如何查看当前配置？
A: 运行 `npx .` 后，主菜单会显示当前配置状态

### Q: 配置错误怎么办？
A: 可以重新运行 `npx .`，选择对应的配置项进行修改

### Q: 支持哪些 API 格式？
A: 支持任何兼容的 HTTP/HTTPS API 端点。确保您的 API 端点与工具兼容。

### Q: 如何卸载配置？
A: 可以手动编辑各工具的配置文件，删除相关配置项

## 🔒 隐私说明

- ✅ 所有配置仅保存在本地
- ✅ 不会上传任何数据到远程服务器
- ✅ API Key 会以掩码形式显示（如：sk-50****）

## 📝 命令参考

```bash
# 安装依赖
npm install

# 启动配置工具
npx .
# 或
npm run start

# 构建项目
npm run build

# 开发模式
npm run dev

# 代码检查
npm run lint
npm run lint:fix
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Claude Code](https://claude.ai/download)
- [OpenCode](https://opencode.ai)
- [Crush](https://github.com/charmland/crush)
- [Factory Droid](https://factory.ai)

---

**注意**：本工具是一个通用的配置助手，不提供任何 API 服务。请确保您有合法的 API 访问权限。
