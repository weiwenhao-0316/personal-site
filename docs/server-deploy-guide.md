# 宝塔面板部署指南（Vue 3 + FastAPI）

> 本文档记录了将个人网站从 Vercel 迁移到阿里云 ECS + 宝塔面板的完整部署流程。
> 适用于 Vue 3 + Vite 前端 + FastAPI 后端的分离架构项目。

---

## 一、前置准备

### 1.1 你需要什么

| 资源 | 说明 |
|------|------|
| 阿里云 ECS 服务器 | 推荐 2核2G 以上，Ubuntu 22.04 |
| 域名 | 已在腾讯云/阿里云注册并完成实名认证 |
| GitHub 仓库 | 代码已托管在 GitHub |
| FinalShell | 本地 SSH 客户端，用于连接服务器 |

### 1.2 项目结构

```
personal-site/
── backend/          # FastAPI 后端
│   ├── main.py
│   ├── requirements.txt
│   └── .env          # 环境变量（API Key 等）
├── frontend/         # Vue 3 前端
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── ...
```

---

## 二、服务器环境搭建

### 2.1 安装宝塔面板

SSH 登录服务器后执行（Ubuntu）：

```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

安装完成后会显示面板地址、用户名、密码，**务必记录下来**。

### 2.2 安全组放行端口

在阿里云 ECS 控制台 → 安全组中放行：

| 端口 | 用途 |
|------|------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 面板端口（如 16049） | 宝塔面板 |

### 2.3 安装 LNMP 环境

首次登录宝塔面板后，选择安装 **LNMP**：
- Nginx ✅（必须）
- MySQL ❌（本项目不需要，可后期按需安装）
- PHP ❌（本项目不需要，可后期按需安装）
- **Python 项目管理器** ✅（必须，用于部署 FastAPI 后端）

> ⚠️ **重要经验**：MySQL 和 PHP 会占用大量内存（约 500MB）。如果服务器内存较小（≤2G），建议不安装或安装后立即停止并禁用：
> ```bash
> systemctl stop mysql
> systemctl stop php-fpm-81
> systemctl disable mysql
> systemctl disable php-fpm-81
> ```

### 2.4 安装 Node.js

在宝塔面板 → 软件商店 → 搜索 **Node.js版本管理器** 安装，或在终端执行：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

验证：
```bash
node -v   # 应显示 v20.x.x
npm -v    # 应显示 10.x.x
```

---

## 三、拉取代码

### 3.1 创建项目目录并克隆

```bash
mkdir -p /www/wwwroot/haoriver
cd /www/wwwroot/haoriver
git clone https://github.com/weiwenhao-0316/personal-site.git
```

> ⚠️ **注意**：clone 后代码在 `personal-site/` 子目录下，所有路径都要加上这一层：
> - 后端路径：`/www/wwwroot/haoriver/personal-site/backend`
> - 前端路径：`/www/wwwroot/haoriver/personal-site/frontend`

### 3.2 Git 地址选择

| 方式 | 适用场景 |
|------|---------|
| **HTTPS** | 服务器拉取代码（推荐，无需额外配置） |
| SSH | 本地开发/频繁推送（需配置 SSH Key） |
| GitHub CLI | 本地开发（需安装 gh） |

私有仓库需要在 URL 中带上 Token：
```bash
git clone https://<Token>@github.com/用户名/仓库名.git
```

---

## 四、部署后端（FastAPI）

### 4.1 Python 项目管理器添加项目

宝塔面板 → Python项目管理器 → 添加项目：

| 配置项 | 填写内容 |
|--------|---------|
| 项目名称 | `haoriver-backend` |
| 项目路径 | `/www/wwwroot/haoriver/personal-site/backend` |
| Python版本 | **必须先安装并选择**（如 3.9.7 或 3.10） |
| 框架 | `python` |
| 启动方式 | `python` |
| 启动文件 | `/www/wwwroot/haoriver/personal-site/backend/main.py` |
| 运行用户 | `root` |
| 安装模块依赖 | ✅ 勾选 |
| 开机启动 | ✅ 勾选 |
| 守护进程 | ✅ 建议勾选 |

> ️ **常见错误**：添加项目时报 `指定文件不存在!`，原因是 **Python 版本未选择**。必须先点击"版本管理"安装一个 Python 版本，然后在添加项目时选中。

### 4.2 配置环境变量

项目添加成功后 → 点 **配置** → 添加环境变量：

```
DEEPSEEK_API_KEY=你的API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
CORS_ORIGINS=https://haoriver.site,https://www.haoriver.site
PORT=8000
```

### 4.3 启动并验证

1. 在 Python 项目管理器中点 **启动**
2. 确认状态变为 **运行中**
3. 在终端验证：
```bash
curl http://127.0.0.1:8000/api/health
# 应返回 {"status":"ok"}
```

---

## 五、构建前端

### 5.1 安装依赖并构建

```bash
cd /www/wwwroot/haoriver/personal-site/frontend
npm config set registry https://registry.npmmirror.com   # 换国内镜像加速
npm install
npm run build
```

构建完成后，产物在 `frontend/dist/` 目录。

### 5.2 验证 dist 目录

在宝塔文件管理器中进入 `frontend/` 目录，确认出现了 `dist/` 文件夹，里面包含 `index.html` 和 `assets/` 目录。

---

## 六、配置 Nginx 网站

### 6.1 添加站点

宝塔面板 → 网站 → 添加站点：

| 配置项 | 填写内容 |
|--------|---------|
| 域名 | `haoriver.site` |
| 根目录 | `/www/wwwroot/haoriver/personal-site/frontend/dist` |
| PHP版本 | **纯静态** |
| 数据库 | 不创建 |

> **为什么选纯静态？** Vue 3 + Vite 构建后生成的是纯 HTML/CSS/JS 文件，不需要 PHP 处理。选纯静态 = Nginx 直接返回文件，更快更省资源。

### 6.2 添加 www 域名

站点 → 设置 → 域名管理 → 添加 `www.haoriver.site`

> **为什么需要加 www？** `haoriver.site` 和 `www.haoriver.site` 是两个不同的地址。很多用户习惯输入 www 前缀，不加的话他们访问会打不开。两者是同一个网站，在同一个站点里添加多个域名即可，不需要单独建站。

### 6.3 配置反向代理

站点 → 设置 → 反向代理 → 添加反向代理：

| 配置项 | 填写内容 |
|--------|---------|
| 代理名称 | `api` |
| 目标URL | `http://127.0.0.1:8000` |
| 代理目录 | `/api` |
| 发送域名 | `127.0.0.1` |

> **反向代理 vs 正向代理**：
> - **正向代理**：你 → 代理服务器 → 目标网站（如翻墙工具，目标网站不知道你是谁）
> - **反向代理**：用户 → Nginx → 你的后端（用户不知道后端在哪，Nginx 把 `/api` 请求转发给 FastAPI）
>
> 端口说明：`8000` 是 FastAPI 后端端口，`16049` 是宝塔面板端口（与网站无关）。

### 6.4 修改 Nginx 配置（支持 Vue Router History 模式）

站点 → 设置 → 配置文件，在 `#REWRITE-END` 下面添加：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

> **为什么需要这个配置？** Vue Router 使用 history 模式时，URL 如 `/blog`、`/chat` 不是真实文件路径。没有这个配置，用户刷新页面会 404。`try_files` 的作用是：找不到文件时返回 `index.html`，让 Vue Router 处理路由。

---

## 七、域名解析

### 7.1 在域名 DNS 管理中添加 A 记录

以腾讯云 DNSPod 为例：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | `@` | `120.77.2.164`（你的服务器公网IP） | 600 |
| A | `www` | `120.77.2.164` | 600 |

> ️ **DNS vs 宝塔的关系**：
> - **DNS 解析**（腾讯云）：告诉全世界"haoriver.site 指向哪个 IP"→ 像电话簿
> - **宝塔添加域名**：告诉 Nginx"有人访问这个域名时用哪个文件夹响应"→ 像前台接待
> - 两者都需要配置，缺一不可

### 7.2 删除旧的解析记录

如果之前部署在 Vercel，需要删除指向 Vercel 的旧记录：
- 删除指向 `76.76.21.21` 的 A 记录
- 删除指向 `cname.vercel-dns.com` 的 CNAME 记录
- 删除 `api` 子域名的 A 记录（API 现在走反向代理，不需要单独解析）

等待 5-10 分钟生效，可用 `ping haoriver.site` 验证。

---

## 八、SSL 证书（HTTPS）

### 8.1 申请 Let's Encrypt 证书

站点 → 设置 → SSL → 免费证书 → 申请证书：

| 配置项 | 选择 |
|--------|------|
| 品牌 | **Let's Encrypt**（比 LiteSSL 更通用） |
| 证书算法 | RSA2048 |
| 验证方法 | **DNS验证**（文件验证可能因权限问题失败） |
| 手动解析 | ✅ 勾选 |
| 域名 | 全选 `haoriver.site` 和 `www.haoriver.site` |

### 8.2 添加 DNS TXT 记录

申请后会显示需要添加的 TXT 记录，去 DNSPod 添加：

| 主机记录 | 记录类型 | 记录值 |
|---------|---------|--------|
| `_acme-challenge` | TXT | （复制宝塔提供的值） |
| `_acme-challenge.www` | TXT | （复制宝塔提供的值） |

添加后等 1-2 分钟，回到宝塔点 **验证**。

> ⚠️ **文件验证 403 错误**：如果文件验证报错 `Invalid response...403`，是因为 `.well-known` 验证目录权限问题。改用 DNS 验证即可解决。

### 8.3 开启强制 HTTPS

证书申请成功后，打开 **强制 HTTPS** 开关。这样 http 访问会自动跳转到 https。

---

## 九、验证清单

| 检查项 | 验证方式 |
|--------|---------|
| 域名解析 | `ping haoriver.site` 返回服务器 IP |
| 前端页面 | 浏览器打开 `https://haoriver.site` |
| 后端 API | `curl https://haoriver.site/api/health` 返回 `{"status":"ok"}` |
| HTTPS | 浏览器地址栏显示锁图标 |
| Vue 路由 | 访问 `/blog` 等子页面，刷新不 404 |
| Chat 功能 | 测试 AI 聊天流式输出是否正常 |

---

## 十、日常维护

### 10.1 更新代码流程

```bash
# 1. 本地修改代码后 push 到 GitHub
git add .
git commit -m "更新内容"
git push

# 2. 服务器拉取最新代码
cd /www/wwwroot/haoriver/personal-site
git pull

# 3. 重新构建前端（如果前端有改动）
cd frontend
npm run build

# 4. 重启后端（如果后端有改动）
# 在宝塔 Python项目管理器 里点重启
```

### 10.2 常用命令速查

```bash
# 查看宝塔面板地址
bt default

# 查看/修改面板端口
bt              # 进入菜单，选 5 修改端口

# 查看运行中的服务
systemctl list-units --type=service --state=running

# 查看后端日志
# 在宝塔 Python项目管理器 → 项目 → 日志

# 查看 Nginx 访问日志
tail -f /www/wwwlogs/haoriver.site.log

# 重启 Nginx
systemctl reload nginx
```

### 10.3 服务器资源优化

对于 2G 内存以下的服务器：

```bash
# 停止不需要的服务
systemctl stop mysql
systemctl stop php-fpm-81

# 禁止开机自启
systemctl disable mysql
systemctl disable php-fpm-81
```

### 10.4 宝塔面板访问不了怎么办

1. 确认服务器在阿里云控制台是"运行中"状态
2. 用 FinalShell 或阿里云远程连接登录服务器
3. 执行 `bt default` 查看面板地址
4. 如果面板服务没运行，执行 `bt start`
5. 检查安全组是否放行了面板端口

---

## 十一、常见问题 FAQ

### Q1: 添加 Python 项目时报"指定文件不存在"
**原因**：Python 版本未选择。必须先点击"版本管理"安装 Python 版本，然后在添加项目时选中。

### Q2: 服务器 CPU 100%、内存 98%，面板卡死
**原因**：MySQL + PHP + Nginx + Python 后端同时运行，内存不够。
**解决**：停掉 MySQL 和 PHP，释放约 500MB 内存。如果 FinalShell 也卡住，去阿里云控制台重启服务器。

### Q3: SSL 证书文件验证报 403 错误
**原因**：`.well-known` 验证目录权限问题。
**解决**：改用 DNS 验证方式，添加 TXT 记录即可。

### Q4: 改了 DNS 解析后面板变卡了
**原因**：DNS 解析不影响服务器性能。卡的原因是服务器资源耗尽（CPU/内存满了），和 DNS 无关。

### Q5: 宝塔面板的 SSL 和左侧菜单的 SSL 有什么区别
**原因**：左侧菜单的 SSL 是全局证书管理，站点的 SSL 在 **网站 → 设置 → SSL** 里。申请证书要在站点设置里操作。

### Q6: 反向代理目标 URL 端口填多少
**答**：填 `8000`（FastAPI 后端端口），不是 `16049`（宝塔面板端口）。

### Q7: 重启服务器是人工操作吗
**答**：不是。点重启后系统自动重启，1-2 分钟恢复，数据不会丢失。

### Q8: 外网地址和内网地址有什么区别
**答**：外网地址（如 `120.77.2.164`）是公网 IP，全世界都能访问。内网地址（如 `172.17.44.201`）是阿里云内部 IP，只有同机房的服务器能访问。你从家里访问永远用外网地址。

### Q9: 宝塔面板地址中端口和路径是什么意思
以 `https://120.77.2.164:16049/d0cb6842` 为例：
- `16049`：面板端口（安装时随机生成，安全考虑）
- `/d0cb6842`：安全入口（相当于暗号路径，防止别人直接访问面板）

---

## 十二、部署流程总览

```
购买服务器 → 安装宝塔面板 → 安装 LNMP + Python项目管理器
    ↓
Git clone 代码 → 安装 Node.js → npm run build 构建前端
    ↓
Python项目管理器添加后端项目 → 配置环境变量 → 启动
    ↓
宝塔添加网站(纯静态) → 根目录指向 dist
    ↓
添加 www 域名 → 配置反向代理 /api → 127.0.0.1:8000
    ↓
修改 Nginx 配置(try_files) → 腾讯云 DNSPod 添加 A 记录
    ↓
申请 Let's Encrypt SSL(DNS验证) → 开启强制 HTTPS
    ↓
✅ 部署完成
```
