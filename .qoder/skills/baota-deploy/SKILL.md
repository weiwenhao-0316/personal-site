---
name: baota-deploy
description: Guide deployment of Vue 3 + FastAPI projects to Alibaba Cloud ECS with BaoTa (宝塔) panel. Use when the user wants to deploy their website to a server, set up BaoTa panel, configure Nginx, apply SSL certificates, or troubleshoot server deployment issues. Covers the full workflow from server setup to HTTPS.
---

# 宝塔面板部署助手（Vue 3 + FastAPI）

## 适用场景

用户在阿里云 ECS 上使用宝塔面板部署 Vue 3 + Vite 前端 + FastAPI 后端项目。

## 项目信息

- **GitHub 仓库**：`https://github.com/weiwenhao-0316/personal-site`
- **域名**：`haoriver.site` / `www.haoriver.site`
- **服务器 IP**：`120.77.2.164`（可能变化，以用户实际为准）
- **代码路径**：`/www/wwwroot/haoriver/personal-site/`
- **后端路径**：`/www/wwwroot/haoriver/personal-site/backend`
- **前端路径**：`/www/wwwroot/haoriver/personal-site/frontend`
- **前端构建产物**：`/www/wwwroot/haoriver/personal-site/frontend/dist`

## 部署流程（按顺序引导用户）

### Step 1: 服务器环境

确认已安装：宝塔面板、Nginx、Python项目管理器、Node.js

如果服务器内存 ≤ 2G，立即停掉不需要的服务：
```bash
systemctl stop mysql
systemctl stop php-fpm-81
systemctl disable mysql
systemctl disable php-fpm-81
```

### Step 2: 拉取代码

```bash
cd /www/wwwroot/haoriver
git clone https://github.com/weiwenhao-0316/personal-site.git
```

注意：clone 后代码在 `personal-site/` 子目录下。

### Step 3: 部署后端

在宝塔 Python项目管理器中添加项目：
- 项目路径：`/www/wwwroot/haoriver/personal-site/backend`
- 启动文件：`main.py`
- **必须先安装并选择 Python 版本**（否则报"指定文件不存在"）
- 配置环境变量（DEEPSEEK_API_KEY 等）
- 启动并验证：`curl http://127.0.0.1:8000/api/health`

### Step 4: 构建前端

```bash
cd /www/wwwroot/haoriver/personal-site/frontend
npm install
npm run build
```

如果 npm 未安装，先装 Node.js：
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Step 5: 添加网站

宝塔 → 网站 → 添加站点：
- 域名：`haoriver.site`
- 根目录：`/www/wwwroot/haoriver/personal-site/frontend/dist`
- PHP版本：**纯静态**（Vue 构建后是纯 HTML/CSS/JS，不需要 PHP）
- 再添加 `www.haoriver.site` 到域名管理

### Step 6: 反向代理

站点设置 → 反向代理 → 添加：
- 代理名称：`api`
- 目标URL：`http://127.0.0.1:8000`（8000 是后端端口，不是面板端口）
- 代理目录：`/api`

### Step 7: Nginx 配置

站点设置 → 配置文件，在 `#REWRITE-END` 下添加：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
支持 Vue Router history 模式，防止刷新 404。

### Step 8: 域名解析

在域名 DNS 管理（腾讯云 DNSPod）添加 A 记录：
- `@` → 服务器公网 IP
- `www` → 服务器公网 IP
- 删除旧的 Vercel 解析记录

### Step 9: SSL 证书

站点设置 → SSL → 免费证书 → 申请：
- 品牌：Let's Encrypt
- 验证方法：**DNS验证**（文件验证可能 403 失败）
- 手动解析：勾选
- 去 DNSPod 添加 TXT 记录（`_acme-challenge` 和 `_acme-challenge.www`）
- 验证通过后开启强制 HTTPS

## 常见问题速查

| 问题 | 原因 | 解决 |
|------|------|------|
| Python项目添加失败"指定文件不存在" | 未选择 Python 版本 | 先点"版本管理"安装版本 |
| 服务器 CPU 100%/内存 98% | MySQL+PHP 占用太多 | 停掉 mysql 和 php-fpm |
| SSL 文件验证 403 | .well-known 权限问题 | 改用 DNS 验证 |
| 面板访问不了 | 服务器资源耗尽 | 阿里云控制台重启 |
| npm 命令找不到 | 未安装 Node.js | 安装 Node.js 20 |
| 改了 DNS 后面板变卡 | DNS 不影响性能，是资源耗尽 | 停掉不需要的服务 |
| 宝塔 SSL 和左侧 SSL 区别 | 左侧是全局管理，站点 SSL 在站点设置里 | 去网站→设置→SSL |
| 反向代理端口填多少 | 填 8000（后端），不是 16049（面板） | 目标URL: http://127.0.0.1:8000 |
| 外网 vs 内网地址 | 外网=公网IP，内网=阿里云内部IP | 永远用外网地址访问 |
| 面板地址中端口和路径 | 端口=随机安全端口，路径=安全入口 | 用 `bt default` 查看 |

## 更新代码流程

```bash
cd /www/wwwroot/haoriver/personal-site
git pull
cd frontend && npm run build
# 后端有改动则在宝塔 Python项目管理器 重启
```

## 详细文档

完整的部署指南（含截图说明和详细解释）见 [docs/server-deploy-guide.md](../../docs/server-deploy-guide.md)
