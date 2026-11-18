import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 优先扫描的目录列表
const candidateDirs = ['docs', 'src/content', 'src/pages'];

function findContentDir() {
  for (const dir of candidateDirs) {
    const full = path.join(rootDir, dir);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      return full;
    }
  }
  return path.join(rootDir, 'docs');
}

const contentDir = findContentDir();
const contentDirRel = path.relative(rootDir, contentDir).replace(/\\/g, '/');

// 递归获取所有 .md / .mdx 文件
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== '.vitepress' && file !== 'node_modules' && file !== 'dist') {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// 轻量健壮的 Frontmatter 与元数据解析
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let meta = {};
  let body = content;

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    const fmText = fmMatch[1];
    body = fmMatch[2];

    // 解析简单键值
    const lines = fmText.split(/\r?\n/);
    let currentKey = null;
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const kvMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (kvMatch) {
        currentKey = kvMatch[1];
        let val = kvMatch[2].trim();
        inList = false;

        if (val.startsWith('[') && val.endsWith(']')) {
          meta[currentKey] = val
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        } else if (val) {
          meta[currentKey] = val.replace(/^['"]|['"]$/g, '');
        } else {
          meta[currentKey] = [];
          inList = true;
        }
      } else if (inList && currentKey && trimmed.startsWith('-')) {
        const item = trimmed.replace(/^-\s*/, '').replace(/^['"]|['"]$/g, '');
        if (Array.isArray(meta[currentKey])) {
          meta[currentKey].push(item);
        }
      }
    });
  }

  // 1. 提取标题 Title
  let title = meta.title;
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    } else {
      title = path.basename(filePath, path.extname(filePath));
    }
  }
  // 清洗标题中的多余后缀（如 - 机场专线云）
  title = title.replace(/\s*-\s*机场专线云.*$/, '').trim();

  // 2. 提取访问路径 URL Slug
  const relPath = path.relative(contentDir, filePath).replace(/\\/g, '/');
  let slug = '';
  if (relPath === 'index.md' || relPath === 'index.mdx') {
    slug = '/';
  } else if (relPath.endsWith('/index.md') || relPath.endsWith('/index.mdx')) {
    slug = '/' + relPath.replace(/\/index\.mdx?$/, '/');
  } else {
    slug = '/' + relPath.replace(/\.mdx?$/, '');
  }

  // 3. 提取日期 Date / PubDate
  let date = meta.date || meta.pubDate;
  if (date) {
    if (date instanceof Date) {
      date = date.toISOString().slice(0, 10);
    } else {
      date = String(date).slice(0, 10);
    }
  } else {
    // 尝试通过 Git 提取最后提交日期
    try {
      const gitDate = execSync(`git log -1 --format=%cs "${filePath}"`, {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (gitDate) {
        date = gitDate;
      }
    } catch {
      // 忽略 git 报错
    }
    // 兜底使用文件 mtime
    if (!date) {
      const stat = fs.statSync(filePath);
      date = stat.mtime.toISOString().slice(0, 10);
    }
  }

  // 4. 提取标签与关键词 Tags / Keywords
  let tags = [];
  if (Array.isArray(meta.tags)) {
    tags.push(...meta.tags);
  } else if (typeof meta.tags === 'string') {
    tags.push(...meta.tags.split(',').map((s) => s.trim()));
  }

  if (Array.isArray(meta.keywords)) {
    tags.push(...meta.keywords);
  } else if (typeof meta.keywords === 'string') {
    tags.push(...meta.keywords.split(',').map((s) => s.trim()));
  }

  tags = Array.from(new Set(tags.filter(Boolean)));
  if (tags.length === 0) {
    if (meta.description) {
      tags.push(meta.description.slice(0, 20) + '...');
    } else {
      tags.push('通用');
    }
  }

  return {
    filePath,
    relPath: `${contentDirRel}/${relPath}`,
    title,
    slug,
    date,
    tags,
  };
}

function generateIndex() {
  const allFiles = getAllFiles(contentDir);
  const articles = allFiles.map(parseMarkdown);

  // 按日期降序排列（最新在前），同日期按标题字母排序
  articles.sort((a, b) => {
    const dDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dDiff !== 0) return dDiff;
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  });

  const now = new Date();
  const updateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let md = `# 📄 全站文章内容索引 (CONTENT_INDEX.md)\n\n`;
  md += `> 本文件由 \`scripts/gen-index.js\` 自动扫描生成并维护，记录全站已发布的文章、访问路径、发布时间与核心关键词。\n`;
  md += `> 每次规划选题、撰写新文章或更新内链闭环时，必须以本索引作为唯一权威参考源。\n`;
  md += `> \n`;
  md += `> 📅 **最近同步时间**：${updateTime} ｜ 📚 **索引文章总量**：${articles.length} 篇\n\n`;
  md += `---\n\n`;
  md += `## 📑 文章全景清单（按发布日期倒序）\n\n`;

  articles.forEach((art, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const tagsStr = art.tags.map((t) => `\`${t}\``).join(', ');
    md += `${num}. [${art.date}] [**${art.title}**](${art.slug}) — 标签/关键词: ${tagsStr} <!-- 源码: ${art.relPath} -->\n`;
  });

  md += `\n---\n`;
  md += `\n### 💡 维护指南\n`;
  md += `- 当新增文章、修改标题或调整 tags 时，在终端运行 \`node scripts/gen-index.js\` 即可自动更新此索引。\n`;
  md += `- 写作与内链规范详见项目根目录 [AGENTS.md](./AGENTS.md)。\n`;

  const outputPath = path.join(rootDir, 'CONTENT_INDEX.md');
  fs.writeFileSync(outputPath, md, 'utf-8');
  console.log(`[Success] 文章索引生成成功: ${outputPath}`);
  console.log(`[Stats] 共索引 ${articles.length} 篇文章，已按发布日期倒序排序完成！`);
}

generateIndex();

