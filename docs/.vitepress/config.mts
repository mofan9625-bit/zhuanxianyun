import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '机场专线云',
  description: '2026 稳定机场推荐、高速 IPLC 专线测评与科学上网技术指南',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: false,
  // These routes are maintained as native HTML files in docs/public.
  // Exclude the legacy Markdown copies so VitePress does not overwrite them.
  srcExclude: [
    'articles.md',
    'promos.md',
    'faq.md',
    'status-monitor.md',
    'toolbox.md'
  ],
  ignoreDeadLinks: true,
  themeConfig: {
    logo: '/images/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '推荐榜单', link: '/#recommendations' },
      { text: '知识库', link: '/articles.html' },
      { text: '福利优惠', link: '/promos.html' },
      { text: '跑路避坑监控', link: '/status-monitor.html' },
      { text: '知识问答 FAQ', link: '/faq.html' },
      { text: '客户端工具', link: '/toolbox.html' },
      { text: '关于我们', link: '/about/index.html' }
    ],
    sidebar: {
      '/about/': [
        {
          text: '关于与信任体系',
          items: [
            { text: '关于我们', link: '/about/index.html' },
            { text: '免责声明与推广披露', link: '/about/disclaimer.html' },
            { text: '评测标准与评分权重', link: '/about/methodology.html' },
            { text: '测速基准与环境规范', link: '/about/benchmarks.html' }
          ]
        }
      ]
    },
    footer: {
      message: '<a href="/about/disclaimer.html">免责声明与推广披露</a> ｜ <a href="/about/methodology.html">评测方法论</a> ｜ <a href="/about/benchmarks.html">测速基准说明</a>',
      copyright: '© 2026 机场专线云 (jichangzhuanxianyun.com) - 专注于 2026 稳定机场推荐与高速专线测评'
    }
  }
})
