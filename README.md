# CCF Rating Display

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

一个强大的浏览器插件和油猴脚本，在学术网站上实时显示期刊和会议的 **CCF 推荐等级**、**SCI 分区**、**中科院分区** 以及 **影响因子 (IF)**，助力学术工作者快速评估学术期刊的质量。

## ✨ 功能特性

### 📊 多维度评级系统
- **CCF 推荐等级**：A类、B类、C类（清晰的视觉标识）
- **SCI 分区**：Q1、Q2、Q3、Q4
- **中科院分区**：1区、2区、3区、4区
- **影响因子 (IF)**：实时显示期刊影响因子

### 🌐 广泛的网站支持
- [Google Scholar](https://scholar.google.com) （谷歌学术）
- [DBLP](https://dblp.org) （计算机科学数据库）
- [IEEE Xplore](https://ieeexplore.ieee.org) （IEEE 电气电子工程师协会）
- [ACM Digital Library](https://dl.acm.org) （美国计算机协会）

### 🧠 智能识别技术
- **自动展开缩写**：如 `Expert Syst. Appl.` → `Expert Systems with Applications`
- **模糊匹配**：忽略标点符号和常见介词（如 "the", "of"）的差异
- **别名处理**：识别同一期刊的多个名称变体

### ⚡ 性能优化
- **内置核心数据**：安装即用，无需额外配置
- **远程数据源支持**：可加载包含数万条记录的 SCI/中科院期刊数据
- **本地缓存**：智能缓存策略，减少网络请求

### 🔧 灵活的配置选项
- 通过浏览器菜单轻松切换显示/隐藏
- 自定义标签大小
- 调试日志模式
- 远程数据源管理

## 📦 两种安装方式

### 方式 1️⃣：浏览器插件（推荐）
适用于 Chrome、Edge 等 Chromium 系浏览器

#### 安装步骤：
1. **下载插件代码**
   ```bash
   git clone https://github.com/yourusername/ccf-rating-display.git
   cd ccf-rating-display
   ```

2. **在浏览器中加载插件**
   - Chrome/Edge：打开 `chrome://extensions/` 或 `edge://extensions/`
   - 开启右上角 **"开发者模式"**
   - 点击 **"加载未打包的扩展程序"**
   - 选择项目中的 `ccf-rating-extension` 文件夹

3. **验证安装**
   - 浏览器右上角应出现 CCF Rating 图标
   - 访问 [DBLP](https://dblp.org) 测试功能

### 方式 2️⃣：油猴脚本（Tampermonkey）
适用于所有浏览器

#### 安装步骤：
1. **安装 Tampermonkey 扩展**
   - [Chrome/Edge](https://tampermonkey.net/)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Safari](https://apps.apple.com/app/tampermonkey/id1482490089)

2. **安装脚本**
   - 访问 [Greasyfork](https://greasyfork.org) 或 [Tampermonkey 脚本页面](#) 搜索 "CCF Rating"
   - 或直接复制 `ccf-data/ccf_rating_display.user.js` 内容到 Tampermonkey 新脚本中

3. **验证安装**
   - 刷新学术网站页面，期刊/会议名称旁应显示对应等级标签

## 🚀 快速开始

### 基础使用
1. 访问支持的学术网站（DBLP、Google Scholar 等）
2. 期刊和会议名称旁会自动显示等级标签
3. 点击浏览器菜单进行配置

### 启用 SCI/中科院分区（进阶）

由于 SCI 和中科院分区数据版权敏感且数据量大，脚本采用**远程加载**机制：

#### 第 1 步：生成数据文件

1. **安装依赖**
   ```bash
   pip install pandas openpyxl
   ```

2. **准备 Excel 数据**
   - 准备中科院分区表 Excel 文件
   - 放入项目根目录或修改脚本路径

3. **运行生成脚本**
   ```bash
   python tools/generate_dataset.py
   ```
   成功后在根目录生成 `ccf_sci_data.json`

#### 第 2 步：托管数据文件

推荐使用 **Gitee** (码云) 免费托管，国内访问速度快：

1. 登录 [Gitee](https://gitee.com) 并创建**开源**仓库（如 `ccf-data`）
2. 上传生成的 `ccf_sci_data.json`
3. 点击文件详情页右上角 **"原始数据"** 按钮
4. **复制浏览器地址栏的 URL**（格式：`https://gitee.com/用户名/仓库/raw/master/ccf_sci_data.json`）

#### 第 3 步：配置脚本

**对于油猴脚本：**
1. 刷新任意学术网站页面
2. 点击浏览器右上角 Tampermonkey 图标
3. 选择菜单中的 **`[CCF] 设置远程数据源`**
4. 粘贴 Gitee Raw URL
5. 确保 **`[CCF] 启用远程更新`** 为 **"开"** 状态
6. 刷新页面验证

**对于浏览器插件：**
1. 点击浏览器右上角 CCF Rating 图标打开设置面板
2. 在 "Remote Data Source" 字段输入 Gitee Raw URL
3. 勾选 "Enable Remote Update"
4. 点击 Save 并刷新页面

## ⚙️ 配置选项

### 全局设置
| 选项 | 说明 | 默认值 |
|------|------|--------|
| **显示标签** | 全局显示/隐藏等级标签 | ✅ 开 |
| **显示未识别提示** | 为无法匹配的期刊显示灰色标签 | ✅ 开 |
| **标签大小** | 标签显示大小（sm/md/lg） | `sm` |
| **启用远程更新** | 从远程 URL 加载扩展数据 | ❌ 关 |
| **远程数据源 URL** | SCI/中科院分区数据的 URL | 见脚本头部 |
| **调试日志** | 在浏览器控制台输出详细日志 | ❌ 关 |

## 📖 使用指南

### 查看期刊等级
- 在支持的学术网站浏览时，期刊/会议名称旁会显示彩色标签
- 鼠标悬停标签可查看详细信息

### 调试技巧
1. 按 <kbd>F12</kbd> 打开浏览器开发者工具
2. 打开浏览器控制台 (Console)
3. 启用脚本的调试日志模式
4. 搜索含有 `[CCF]` 前缀的日志信息

### 更新数据
- 重新运行 `python tools/generate_dataset.py`
- 将新的 `ccf_sci_data.json` 推送到 Gitee
- 脚本会自动检测更新（默认 24 小时检查一次）
- 如需立即更新，可清除油猴存储或重新开关远程更新

## ❓ 常见问题

### Q1: 为什么有的期刊显示"未识别"？
**A:** 可能的原因：
- 期刊名称提取有误（开启"显示未识别提示"查看实际名称）
- 期刊名称在数据库中存储形式不同（如缩写、别名）
- 数据源中确实不包含该期刊

**解决方案：**
- 开启"显示未识别提示"，鼠标悬停查看提取的名称
- 更新数据源后重新加载
- 在 GitHub 提交 Issue，我们会补充数据

### Q2: 远程数据没有加载，显示提示信息？
**A:** 检查清单：
1. 确认 URL 是 **Raw 链接**（直接可查看 JSON 内容）
2. 确认已开启 **"启用远程更新"** 选项
3. 检查浏览器控制台是否有红色错误日志
4. 检查网络连接（尤其是跨域问题）

### Q3: 如何离线使用？
**A:** 油猴脚本自带 CCF 核心数据，无需远程数据源也能使用。远程数据源仅用于扩展 SCI/中科院分区功能。

### Q4: 支持其他学术网站吗？
**A:** 目前支持 Google Scholar、DBLP、IEEE Xplore、ACM DL。欢迎提交 PR 扩展支持范围！

### Q5: 数据更新频率如何？
**A:** 
- **CCF 等级数据**：由官方 CCF 维护，我们定期同步
- **SCI 分区**：用户可自主生成，实时性更强
- **中科院分区**：同样支持用户自主生成

## 🛠️ 项目结构

```
ccf-rating-display/
├── ccf-data/                      # 油猴脚本版本
│   ├── ccf_rating_display.user.js # 核心脚本（950+ 行）
│   ├── ccf_sci_data.json          # SCI/中科院分区数据
│   ├── sci_data_template.json     # 数据格式模板
│   ├── package.json               # NPM 配置
│   └── tools/
│       ├── generate_dataset.py    # 数据生成工具（推荐）
│       └── convert_cas_excel.py   # 旧版转换工具
│
├── ccf-rating-extension/          # 浏览器插件版本
│   ├── manifest.json              # Chrome/Edge 插件配置
│   ├── background.js              # 后台服务脚本
│   ├── content.js                 # 内容脚本（注入网页）
│   ├── popup.html                 # 设置面板 HTML
│   └── popup.js                   # 设置面板逻辑
│
└── README.md                      # 本文件
```

### 核心文件说明

| 文件 | 说明 |
|------|------|
| `ccf_rating_display.user.js` | 油猴脚本主体，包含数据库和匹配逻辑 |
| `manifest.json` | Chromium 插件清单，定义权限和内容脚本 |
| `background.js` | 插件后台服务，处理数据同步和更新 |
| `content.js` | 注入网页的脚本，进行期刊名称识别和标签注入 |
| `generate_dataset.py` | 将 Excel 分区表转换为 JSON 格式 |

## 🔄 工作原理

```
用户访问学术网站
       ↓
脚本/插件加载
       ↓
扫描页面中的期刊/会议名称
       ↓
与本地 CCF 数据库匹配
       ↓
如启用远程更新，从 URL 加载 SCI/中科院数据
       ↓
在期刊/会议名称旁注入等级标签
       ↓
展示彩色标签和详细信息
```

## 🤝 贡献指南

欢迎贡献代码、数据或建议！

### 如何贡献
1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 **Pull Request**

### 贡献类型
- 🐛 **Bug 修复**：报告问题，提交修复
- ✨ **新功能**：添加网站支持、优化匹配算法等
- 📚 **文档**：完善 README、添加使用教程
- 📊 **数据**：补充缺失的 CCF/SCI 期刊数据
- 🌍 **国际化**：添加多语言支持

### 报告问题
- 在 GitHub Issues 中清晰描述问题
- 提供浏览器、操作系统版本
- 包含控制台错误日志
- 最好附带期刊名称便于调试

## 📄 许可证

本项目采用 **MIT License**，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- **CCF（中国计算机学会）**：提供权威的会议和期刊评级标准
- **DBLP**：计算机科学文献数据库
- **Tampermonkey 社区**：强大的油猴脚本生态
- **所有贡献者和用户**：感谢你们的支持和反馈

## 📞 联系方式

- 📧 **Email**：your-email@example.com
- 💬 **GitHub Issues**：[提交 Issue](../../issues)
- 📝 **讨论区**：[开启讨论](../../discussions)

## 📚 相关资源

- [CCF 官方网站](https://www.ccf.org.cn/)
- [DBLP 计算机科学文献库](https://dblp.org/)
- [Tampermonkey 官方文档](https://tampermonkey.net/)
- [Chrome 扩展开发指南](https://developer.chrome.com/docs/extensions/)

## 🎯 未来计划

- [ ] 支持 arXiv、PubMed 等更多学术网站
- [ ] 国际化支持（英文、日文等）
- [ ] 浏览器扩展应用商店发布
- [ ] 桌面应用版本
- [ ] API 服务，供第三方集成
- [ ] 期刊排名对比、统计分析等高级功能

## ⭐ 如果有帮助，请给个 Star！

如果这个项目对你有帮助，欢迎点击右上角的 ⭐ Star，这将鼓励我们继续改进和维护。

---

**最后更新**：2025 年 12 月  
**版本**：1.0.0
