<template>
  <div class="tools">
    <h1 class="page-title">备考资料</h1>
    <p class="page-desc">西藏高考复习资料，点击文件名下载。</p>

    <div v-for="group in groups" :key="group.name" class="group">
      <h2 class="group-title">{{ group.name }}</h2>
      <div class="file-list">
        <a
          v-for="file in group.files"
          :key="file"
          :href="`/exam/${group.name}/${file}`"
          :download="file"
          class="file-item"
        >
          <span class="file-icon">📄</span>
          <span class="file-name">{{ file.replace('.docx', '') }}</span>
          <span class="file-ext">.docx</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const groups = [
  {
    name: '高考历史',
    files: [
      '2026年西藏高考历史押题训练卷（一）.docx',
      '2026年西藏高考历史押题训练卷（二）.docx',
      '2026年西藏高考历史论述题应试专项.docx',
      '2026年西藏高考历史选择题专项训练卷.docx',
      '2026年西藏高考历史速查手册.docx',
      '2026年西藏高考历史速查手册（一轮复习完整版）.docx',
      '2026年西藏高考历史速查手册（一轮复习版）.docx',
    ],
  },
  {
    name: '高考政治',
    files: [
      '2026年西藏高考政治押题训练卷（一）.docx',
      '2026年西藏高考政治押题训练卷（二）.docx',
      '2026年西藏高考政治押题训练卷（三）.docx',
      '2026年西藏高考政治押题训练卷（四）.docx',
      '2026年西藏高考政治选择题专项训练卷.docx',
      '2026年西藏高考政治选择题综合练习.docx',
      '2026年高考政治时政热点深度解读.docx',
      '高中政治完全手册.docx',
    ],
  },
  {
    name: '高考西藏文综4pro生成训练卷',
    files: [
      '2026年西藏高考政治大题术语总结与答题技巧.docx',
      '2026年西藏高考文综均衡型押题训练卷（一）.docx',
      '2026年西藏高考文综均衡型押题训练卷（二）.docx',
      '2026年西藏高考文综押题训练卷（一）.docx',
      '2026年西藏高考文综押题训练卷（二）.docx',
      '2026年西藏高考文综押题训练卷（三）.docx',
    ],
  },
]
</script>

<style scoped>
.tools {}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.page-desc { color: var(--text-secondary); margin-bottom: 40px; font-size: 16px; }

.group {
  margin-bottom: 40px;
}

.group-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}

.file-list {
  display: flex;
  flex-direction: column;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: padding 0.2s;
}

.file-item:hover {
  padding-left: 6px;
  background: #faf9f5;
}

.file-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  min-width: 0;
}

.file-ext {
  font-size: 12px;
  color: var(--text-tertiary);
  background: #f5f0ec;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .file-name { font-size: 13px; }
}
</style>
