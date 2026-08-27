-- 笔记表建表 + 种子数据（一次性迁移脚本）
-- 执行方式：FinalShell 里 mysql -uhaoriver -p 登录后整段粘贴执行
-- 幂等性：CREATE TABLE IF NOT EXISTS 重复执行不会报错；种子数据用固定 id，重复执行会主键冲突跳过——所以只需要执行成功这一次

CREATE TABLE IF NOT EXISTS notes (
    id         VARCHAR(64)  NOT NULL PRIMARY KEY,       -- UUID 字符串，与前端路由/编辑操作对应
    date       DATE         NOT NULL,                    -- 笔记归属日期（业务字段，非入库时间）
    mood       VARCHAR(20)  NOT NULL DEFAULT '记录',      -- 心情/状态标签：记录、学习、重构……
    title      VARCHAR(500) NOT NULL,                    -- 标题（沿用收藏表的扩容经验，防长标题1406）
    excerpt    VARCHAR(1000) NOT NULL DEFAULT '',        -- 摘要
    content    TEXT,                                     -- 正文
    tags       TEXT,                                     -- JSON 数组字符串：'["Vue","设计"]'
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 种子数据：来自旧版 localStorage 的两条示例笔记，保证上线首日页面不空
INSERT INTO notes (id, date, mood, title, excerpt, content, tags)
VALUES
('site-rebuild', '2026-07-27', '重构',
 '把个人网站从展示页改成个人系统',
 '先让网站能承载自己的内容流，再逐步接入数据库、AI 摘要和自动分类。',
 '收藏不是终点。真正有价值的是把外部内容变成自己的笔记、项目和判断。',
 '["个人网站", "Vue", "产品设计"]'),
('learning-loop', '2026-07-20', '学习',
 '输入、整理、输出是一个闭环',
 '收藏不是终点，真正有价值的是把外部内容变成自己的笔记、项目和判断。',
 '先快速收集，再定期整理，最后输出成可以复用的经验。',
 '["学习方法", "复盘"]');
