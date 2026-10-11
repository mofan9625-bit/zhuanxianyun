import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '机场专线云',
  description: '机场专线云精选2026高性价比稳定专线机场推荐榜单。基于全自费晚高峰真实网络压测，提供按需计费与周期订阅深度横评，涵盖IPLC物理专线、流媒体解锁实测与跑路避坑预警，为您呈现透明可信的性价比测速与选购指南。',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://jichangzhuanxianyun.com'
  },
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    const hasCanonical = pageData.frontmatter.head.some(
      (item: any) => item[0] === 'link' && item[1]?.rel === 'canonical'
    )
    if (!hasCanonical) {
      const cleanPath = pageData.relativePath
        .replace(/(^|\/)index\.md$/, '$1')
        .replace(/\.md$/, '')
      const canonicalUrl = `https://jichangzhuanxianyun.com/${cleanPath}`
      pageData.frontmatter.head.push([
        'link',
        { rel: 'canonical', href: canonicalUrl }
      ])
    }
  },
  themeConfig: {
    logo: { src: '/images/logo.png', alt: '机场专线云 Logo' },
    nav: [
      { text: '首页', link: '/', target: '_self' },
      { text: '推荐榜单', link: '/#ranking', target: '_self' },
      { text: '知识库', link: '/articles', target: '_self' },
      { text: '福利优惠', link: '/promos', target: '_self' },
      { text: '跑路避坑监控', link: '/status-monitor', target: '_self' },
      { text: '知识问答 FAQ', link: '/faq', target: '_self' },
      { text: '客户端工具', link: '/toolbox', target: '_self' },
      { text: '关于我们', link: '/about/' }
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
