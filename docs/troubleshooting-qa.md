# 实战排错问答录（2026-08-27 视觉改造上线日）

> 本文按"一问一答"记录了燕麦鼠尾草视觉改造部署当天遇到的全部问题。
> 每个问答分三段：**现象**（我们看到了什么）、**解决**（具体做了什么）、**知识点**（提炼出的通用经验）。
> 遇到新问题时，先来这里找有没有同款——大部分线上问题的套路是重复的。

---

## 第一部分：代码从电脑到网站的完整旅程

### Q1：改完网站代码后，怎么让它出现在线上？

**现象**：在本地改好了代码，但打开 haoriver.site 一切照旧。

**解决**：完整流程是五步，缺一步都不行：

```bash
# 【1-2 步：在你自己电脑上】把改动打包上传到 GitHub
git add .                              # ① 装箱：把所有改动放进"待提交区"
git commit -m "fix: 修复xx问题"         # ② 封箱贴标签：生成一条带说明的版本快照
git push origin master                 # ③ 发货：推送到 GitHub 的 master 分支

# 【3-5 步：在服务器 FinalShell 里】下载并让网站吃到新代码
cd /www/wwwroot/haoriver/personal-site && git pull    # ④ 收货：服务器拉取最新代码

# ⑤ 根据"改了什么"追加对应动作：
cd frontend && npm run build           #    改了前端 → 必须重新构建！
#    改了后端 → 到宝塔 Python 项目管理器点重启
```

**知识点**：
- **`git pull` ≠ 网站更新**。pull 只是把源码下载到服务器磁盘。前端真正对外服务的不是 `src/` 源码，而是构建产物 `frontend/dist/` —— 不跑 `npm run build`，dist 永远是老的。这是本次栽得最深的一跤（界面半天不变，就是因为只 pull 了没 build）。
- **后端同理**：`.py` 文件即使拉到最新，正在运行的进程里装的还是启动那一刻的旧代码，必须重启才会加载新的。
- 浏览器还有一层缓存：确认全部做完页面还旧的话，**Ctrl+F5 强制刷新**。

### Q2：详细解释推送那三条命令各自的意思？

| 命令 | 白话翻译 | 补充说明 |
|------|---------|---------|
| `git add .` | "这次改动有这些文件" | `.` 代表当前目录全部改动；也可以指定单文件如 `git add main.py` |
| `git commit -m "说明"` | "打包成一个版本，标签写这个" | `-m` 后面是给人看的说明，**要用 conventional commits 格式**（feat:/fix:/docs:/chore: 开头），日后翻历史一目了然 |
| `git push origin master` | "把这个版本传到 GitHub 上的 master 分支" | `origin` 是远程仓库的代称，`master` 是分支名 |

### Q3：服务器上 `git pull` 失败（报 GnuTLS / connect 失败），该怎么办？

**现象**：
```
fatal: unable to access 'https://github.com/...'
GnuTLS recv error (-110): The TLS connection was non-properly terminated.
```

**解决**：绕开 GitHub 本体，走国内镜像站中转：

```bash
cd /www/wwwroot/haoriver/personal-site
git pull https://gh-proxy.com/https://github.com/weiwenhao-0316/personal-site.git master
```

如果这个镜像站临时挂了，把开头换成 `https://ghproxy.net/` 再试。

**命令逐段拆解**：
- `git pull <网址> <分支名>` —— 正常情况 pull 不用带参数（因为仓库注册过来源地址），但当默认地址连不上时，可以**显式指定从哪个网址拉**；
- `https://gh-proxy.com/https://github.com/xxx.git` —— 这是"**镜像前缀 + 原地址**"的拼接写法：gh-proxy.com 是一台放在国内外都能顺畅访问的中转服务器，你把原地址整个粘到它后面，它替你去 GitHub 下载再转交给你；
- 结尾的 `master` —— 明确告诉它拉取 master 分支。

**知识点**：
- 你电脑上的代理软件**只对这台电脑有效**。代理开着 → 我能帮你 push/pull；但它管不到阿里云服务器——服务器在国内机房直连 GitHub，时通时不通，所以服务器侧永远首选镜像方案；
- 三种通道各管一段：**电脑改码push（要代理）/ 服务器 pull（用镜像）/ 宝塔上传文件（万能兜底）**。

### Q4：仓库最新提交怎么核对真的拉下来了？

**解决**：拉完后立刻验证：

```bash
git log --oneline -2     # 显示最近两条提交的编号和标题
```

看到_expected_的提交编号（比如 `85a995e feat: ...`）才算拉成功。（顺带一提：手滑敲成 `--online` 会报 `unrecognized argument`——Git 对参数拼写很严格。）

---

## 第二部分：后端部署的三连击（依赖 → 表结构 → 进程）

### Q5：装了 requests 还报 `ModuleNotFoundError: No module named 'requests'`，为什么？

**现象**：明明在终端执行过 `pip3 install requests`，模块管理里也有，日志却还在报找不到。

**解决**：把包装进**项目虚拟环境的 pip 里**：

```bash
/www/wwwroot/haoriver/personal-site/backend/e778d61ae403fbb16e643ebfd764d320_venv/bin/pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**知识点**：
- **虚拟环境（venv）**：宝塔给每个 Python 项目单独造一套隔离的小 Python（文件夹名以 `_venv` 结尾），项目运行只认这套。你在终端裸敲的 `pip3` 装到的是系统大 Python——两边互不相通，装了等于没装；
- `-i https://pypi.tuna.tsinghua.edu.cn/simple` 是清华大学的国内镜像源，下载不再超时；
- 小心文件名陷阱：venv 里的可执行文件叫 `python3` 和 `pip`，敲成 `python` 会报 `No such file or directory`——差一个字符都不行（真实踩坑）。

### Q6：保存收藏时报错（红字提示保存失败），后端日志一大串英文，怎么看？

**解决**：读 Python 报错（traceback）的黄金法则——**从最后一行往上看**：

```
pymysql.err.DataError: (1406, "Data too long for column 'url' at row 1")
└── 错误类别: DataError（数据有问题）
└── 1406: MySQL 标准错误码
└── 人话: 'url' 这一列装不下你给的数据
```

三个规律：
1. **最后一行 = 判决书**，90% 的答案在这；
2. **看清错误出自哪个库**：`pymysql.xxx` 死在数据库层（去查表结构），`requests.xxx` 死在网络层（去查目标网站），`/phpmyadmin/...` 是管理工具自己病了不用管；
3. 中间大段调用链是"案发路径"，只有深挖内部 bug 时才逐帧看。

本次结果：B 站分享链接拖着一大串跟踪参数超过了 255 字符上限 → 需要把列改宽（见下一问）。

### Q7：数据库列太短怎么改？（1406 错误的实际解法）

**解决**：拓宽字段，只放宽不收紧，存量数据无损：

```sql
ALTER TABLE collections MODIFY title VARCHAR(500);
ALTER TABLE collections MODIFY url   VARCHAR(2048);
ALTER TABLE collections MODIFY cover VARCHAR(2048);
```

执行途径有两种：宝塔 → 数据库 → phpMyAdmin 的 SQL 页签；或 FinalShell 敲 `mysql -uhaoriver -p` 进命令行执行（后者当天最终采用，因为 phpMyAdmin 自己坏了……见下两问）。改完用 `SHOW COLUMNS FROM collections;` 目视确认 `varchar(2048)` 生效。

**知识点**：MySQL 错误码 1406 = 数据超长；`VARCHAR(n)` 的 n 就是字符容量上限。

### Q8：为什么推荐给每个业务建独立数据库账号，而不是到处用 root？

**现象**：登录 phpMyAdmin 时纠结填宝塔面板密码还是数据库密码。

**知识点：三套账号体系彻底分清**

| 账号 | 用在哪 |
|------|--------|
| 宝塔面板账号 | 登录 `IP:端口/安全入口`的管理后台 |
| SSH 账号 | FinalShell 连服务器敲命令 |
| MySQL 账号 | phpMyAdmin 登录、后端 `.env` 里的 `DB_USER`/`DB_PASSWORD` |

三者互相独立！root 密码可在宝塔"数据库"页顶部查看。最小权限原则：日常操作用业务账号（`haoriver`），它只能动自己的库。

### Q9：phpMyAdmin 登录就崩 / 执行 SQL 也崩，怎么办？

**现象**：普通账号登录秒崩（SELECT denied on mysql.user）；换成 root 后执行验证 SQL 又崩（syntax near ''），栈轨迹全是 `/www/server/phpmyadmin/...` 路径。

**解决**：识别出是**管理工具自身坏了**（这套宝塔打包的 phpMyAdmin 与新版 PHP 兼容性差），果断弃用它，改用 `mysql` 命令行——所有 SQL 操作换终端完成，一次通过。

**知识点**：
- 错误栈路径指向谁，锅就是谁的。死在自己项目路径才需要修自己的代码；死在第三方工具路径，换工具绕开即可，别恋战；
- 命令行操作 MySQL 的最小流程：
  ```bash
  mysql -uhaoriver -p      # 登录 MySQL 服务本身（-p=接下来交互式输密码）
  USE haoriver;            # 切换到名叫 haoriver 的库（账号名≠库名，只是恰好同名）
  ...你的SQL...
  EXIT;
  ```

---

## 第三部分：封面功能四重关卡（本次的主战场）

### Q10：为什么 B 站链接的封面抓不到？——机房 IP 反爬（412）

**现象**：同样的抓取代码，家里电脑测试百发百中，服务器上一张都抓不到。

**诊断过程**：写了一段 5 行探针脚本直接在服务器上问 B 站：

```python
import requests, re
r = requests.get('https://www.bilibili.com/video/BV1j68R6bEns/', headers={'User-Agent': '...'}, timeout=5)
print('状态码:', r.status_code, '页面大小:', len(r.text))
m = re.search(r'og:image[^>]*content="([^"]+)"', r.text)
print('og:image:', m.group(1)[:80] if m else '页面里没有题目图')
```

输出 `状态码: 412，页面只有3400字节` → 石锤：**B 站反爬系统专门拦截阿里云机房 IP**，回一个 412 拒绝页（正常视频页几百 KB）。家庭宽带被放行，所以本地测得好好的。

**解决**：不爬网页了，改调 **B 站官方数据接口**（本来就是给程序用的，风控宽松）：从任意形态的 B 站链接里正则提取 BV 号（`BV` + 10 位字母数字），请求 `api.bilibili.com/x/web-interface/view?bvid=BV号`，JSON 里的 `data.pic` 字段就是封面地址。代码里新增 `fetch_bilibili_cover()`，当常规网页抓取失败且链接属于 B 站时自动启用。

**知识点**：
- **HTTP 412** ≈ 风控拒绝的名片，配合"返回内容异常小"基本可断定撞上反爬；
- 大平台普遍区别对待"家庭宽带 IP"与"数据中心 IP"——**本地能通 ≠ 服务器能通**，涉及外部接口的功能必须在目标环境实测；
- 探针脚本思维：把可疑环节抽出来写成 5 行小脚本独立验证，比在大系统里猜快十倍。

### Q11：封面地址抓到了，卡片上却是裂图？——图床防盗链（403）

**现象**：卡片顶部出现浏览器的"裂开图片"图标（说明 `<img>` 已拿到地址），但图加载不出来。

**诊断过程**：用 4 种组合实测同一个封面地址，二分定位：

| 请求形态 | 结果 |
|---------|------|
| 带 `Referer: haoriver.site`（http 或 https 都试了）| **403 拒绝** |
| 不带来路信息 | **200 正常**（180KB 图片）|

石锤：**B 站图床开启 Referer 防盗链**——只看请求是否声明"来自外站"，声明了就拒收。

**解决**（三层保险，前两层还顺手治好老数据）：
1. 前端 `<img>` 加属性 `referrerpolicy="no-referrer"`：加载图片时不向来路上报身份 → 图床放行；
2. 前端读取数据时统一升级：`cover.replace(/^http:\/\//, 'https://')` → 存量老记录原地生效，不用动数据库；
3. 后端入库前同样做 https 归一化 → 新数据生来干净。

第 2、3 条同时解决了另一个隐患：网站是 HTTPS，页面里嵌 HTTP 图片会被部分浏览器拦成裂图（混合内容策略）。

**知识点**：
- **Referer 防盗链**是国内图床标配：判断依据只是"请求头里的来路字符串"，不带这个头即可绕过——这也是 `referrerpolicy` 属性存在的意义；
- 排查图片类问题时，用 requests 把"有无 Referer × http/https"四种组合各打一遍，几分钟就能锁定规则。

### Q12："收藏不存在"？那条收藏明明在列表里！（灵异 404）

**现象**：点编辑→什么都没改直接保存，提示"收藏不存在"；DELETE 却又能删掉它。

**原因**：MySQL 的 UPDATE 默认只统计**内容真正变化**的行数。"清空本来就近空的封面字段"= 没有任何值变化 → 返回影响 0 行 → 我的代码把 0 一律当成"记录不存在"报 404。

**解决**：给数据库连接加一个参数：

```python
from pymysql.constants import CLIENT
pymysql.connect(..., client_flag=CLIENT.FOUND_ROWS)
```

加上之后 UPDATE 返回的是"匹配到几行"而不是"改变了几行"，语义回归直觉。

**知识点**：同一个"0"在不同配置下含义不同——排查"莫名其妙的失败"时，除了看错误，还要审一遍**函数返回值在本环境下的确切语义**。

### Q13：点了宝塔"重启"，行为却没变？（进程不肯换血之谜）

**现象**：代码已确认拉到最新，反复点重启，日志还出现"收藏不存在"等旧行为。

**取证手段**（Linux 自带的进程身份证查询处 `/proc`）：

```bash
PID=$(ss -tlnp | grep :8000 | grep -oP 'pid=\K[0-9]+' | head -1)  # 找出占8000端口的进程号
ls -l /proc/$PID/cwd          # 它的工作目录
tr '\0' ' ' < /proc/$PID/cmdline && echo   # 它的完整启动命令
readlink -f /proc/$PID/exe    # 它用的到底是哪个 python
```

读出来的真相：那个进程是 uvicorn **热重载器派生的子进程**（cmdline 里有 `spawn_main...multiprocessing-fork`），这一族进程的生死由重载器掌控，面板的重启按钮管不到它家内部。

**解决**：清场后亲手拉起，全程日志可见：

```bash
cd /www/wwwroot/haoriver/personal-site/backend
VENV=e778d61ae403fbb16e643ebfd764d320_venv

pkill -f "main.py"; pkill -f "spawn_main"; sleep 2     # 清场：把旧进程全家送走
ss -tlnp | grep :8000 && echo "还有残留!" || echo "已空"

nohup $VENV/bin/python3 main.py > /tmp/backend.log 2>&1 &   # 亲手后台启动，日志落盘
sleep 5 && tail -n 6 /tmp/backend.log                        # 看到 Application startup complete
curl -s http://127.0.0.1:8000/api/health                     # {"status":"ok"}
```

**知识点**：
- `ss -tlnp | grep :端口`：查"谁占着某个端口"，排障第一神器；
- `pkill -f 关键词`：按命令行关键词批量杀进程；
- `nohup 命令 > 日志 2>&1 &`：挂到后台持续运行、输出写进文件——比面板按钮透明一百倍；
- 手动拉起的进程重启服务器后不会自启，验收稳定后回宝塔点一次"重启"让守护模式接管回来。

### Q14：探针脚本跑不起来：`No such file or directory` 但文件明明存在？

**现象**：`backend/xxx_venv/bin/python` 报不存在，可宝塔文件管理器里看得见这个文件夹。

**解决**：真实文件名结尾是 `bin/python3`——少写了个 `3`。另外长文件名在文件管理器里可能被截断显示，别照抄看到的，用 `ls` 现场核实或 Tab 键自动补全。

**知识点**：报"No such file or directory"先做两件事——逐字符比对路径、Tab 补全让 shell 替你找。

---

## 第四部分：一套可以复用的排错心法

### Q15：今天所有问题，背后共同的方法论是什么？

1. **先读日志，从最后一行开始**：错误类型 + 描述写在最下面；往上依次是"案发路径"。
2. **定位错误的层**：`pymysql.*`=数据库层查表结构和 SQL；`requests.*`=网络层查目标网站和 Referer/IP 信誉；`/www/server/...`=管理工具自身的问题，绕开；自己项目路径=改代码。
3. **状态码速记**：200 成功 / 403 拒绝（防盗链·权限）/ 404 找不到（路径或 id）/ 412 风控拒绝 / 500 后端炸了（去看后端日志）/ 无法连接=网络层不通。
4. **最小复现**：怀疑哪一段，就把那段抽成几行的独立脚本在目标环境跑（今天封面的两个疑难都是这么破的）。
5. **组合变量二分法**：http/https × 有无 Referer 这种"变量矩阵"逐格测试，一轮锁定真凶。
6. **证据优于按钮**：`curl`、`ss`、`/proc/*/cmdline` 这些命令给出的是事实，面板按钮的"已重启"只是状态描述。
7. **验证闭环**：每修一处，立刻用一个能区分新旧行为的动作验证（例如"什么都不改点保存"是新代码的专属信号），否则你以为的修复可能根本没上线。

### Q16：以后正常的更新流程清单（打印贴墙版）

```text
□ 本地：git add . && git commit -m "feat/fix: 说明" && git push   （需代理）
□ 服务器：cd /www/wwwroot/haoriver/personal-site
          git pull https://gh-proxy.com/https://github.com/weiwenhao-0316/personal-site.git master
□ 前端有改动：cd frontend && npm run build
□ 后端有改动：重启后端（宝塔按钮 或 手动 pkill+nohup）
□ 浏览器：Ctrl+F5 强刷
□ 冒烟：curl http://127.0.0.1:8000/api/health 应返回 {"status":"ok"}
```

### Q17：本期遗留事项

- 手动 `nohup` 启动的进程在服务器下次断电/重启后不会自启——验收通过后回宝塔点一次"重启"，让守护模式接管回来即可；
- `backend/.env.example` 模板仍旧过时（缺数据库相关变量），下次配置新环境时以 AGENTS.md 的清单为准；
- 老收藏若仍是渐变兜底封面：点编辑→清空封面栏→保存，即可触发新一轮抓取补图。
