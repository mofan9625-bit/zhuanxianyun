const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hostname = 'https://jichangzhuanxianyun.com';

// 页面配置表：定义优先级与更新频率
const urlConfig = {
  '/article-2026-airport-selection-guide': { priority: '0.9', changefreq: 'weekly' },
  '/article-pay-as-you-go-airport-guide': { priority: '0.9', changefreq: 'weekly' },
  '/': { priority: '1.0', changefreq: 'daily' },
  '/articles': { priority: '0.9', changefreq: 'weekly' },
  '/promos': { priority: '0.8', changefreq: 'weekly' },
  '/status-monitor': { priority: '0.8', changefreq: 'daily' },
  '/faq': { priority: '0.8', changefreq: 'weekly' },
  '/toolbox': { priority: '0.8', changefreq: 'weekly' },
  '/about/': { priority: '0.7', changefreq: 'monthly' },
  '/about/disclaimer': { priority: '0.6', changefreq: 'monthly' },
  '/about/methodology': { priority: '0.6', changefreq: 'monthly' },
  '/about/benchmarks': { priority: '0.6', changefreq: 'monthly' },
};

function getGitDate(filePath) {
  try {
    const gitDate = execSync(`git log -1 --format=%cs -- "${filePath}"`, { encoding: 'utf8' }).trim();
    if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
      return gitDate;
    }
  } catch (e) {
    // fallback if git not accessible
  }
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().split('T')[0];
}

const docsDir = path.resolve(__dirname, '../docs');
const pages = [];

// 1. 递归扫描 docs 目录下所有 .md 文件
function scanDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== '.vitepress' && file !== 'public' && file !== 'node_modules') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.md')) {
      const rel = path.relative(docsDir, fullPath).replace(/\\/g, '/');
      let route = '/' + rel.replace(/\.md$/, '');
      if (route === '/index') route = '/';
      else if (route.endsWith('/index')) route = route.replace(/\/index$/, '/');

      const date = getGitDate(fullPath);
      const conf = urlConfig[route] || {
        priority: route.startsWith('/article-') ? '0.8' : '0.7',
        changefreq: 'monthly'
      };

      pages.push({
        loc: `${hostname}${route}`,
        lastmod: date,
        changefreq: conf.changefreq,
        priority: conf.priority
      });
    }
  });
}

scanDir(docsDir);

// 排序：首页第一，其余按优先级和路径排序
pages.sort((a, b) => {
  if (a.loc === `${hostname}/`) return -1;
  if (b.loc === `${hostname}/`) return 1;
  return parseFloat(b.priority) - parseFloat(a.priority) || a.loc.localeCompare(b.loc);
});

// 生成标准符合协议的 XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

pages.forEach(p => {
  xml += '  <url>\n';
  xml += `    <loc>${p.loc}</loc>\n`;
  xml += `    <lastmod>${p.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
  xml += `    <priority>${p.priority}</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>\n';

// 输出目标路径
const targets = [
  path.resolve(__dirname, '../sitemap.xml'),
  path.resolve(__dirname, '../docs/public/sitemap.xml')
];

const distDir = path.resolve(__dirname, '../docs/.vitepress/dist');
if (fs.existsSync(distDir)) {
  targets.push(path.join(distDir, 'sitemap.xml'));
}

targets.forEach(t => {
  fs.writeFileSync(t, xml, 'utf8');
  console.log(`[Sitemap] Generated: ${t}`);
});

console.log(`[Sitemap] Successfully wrote ${pages.length} clean URLs!`);
