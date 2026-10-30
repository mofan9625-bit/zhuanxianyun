import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '机场专线云',
  description: '机场专线云精选2026高性价比稳定专线机场推荐榜单。基于全自费晚高峰真实网络压测，提供按需计费与周期订阅深度横评，涵盖IPLC物理专线、流媒体解锁实测与跑路避坑预警，为您呈现透明可信的性价比测速与选购指南。',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: false,
  sitemap: {
    hostname: 'https://jichangzhuanxianyun.com'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/logo.png' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    ['style', {}, `
      /* Critical Inline CSS - 防止弱网首屏样式缺失与移动端排版撑爆 */
      .visually-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      .VPNavBarTitle .logo,
      .VPImage.logo {
        height: 32px !important;
        width: auto !important;
        max-width: 160px !important;
        object-fit: contain !important;
        display: inline-block !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      @media (max-width: 768px) {
        .VPNavBarMenu.menu {
          overflow-x: auto;
          white-space: nowrap;
        }
        .VPNavBarAppearance.appearance,
        .VPFlyout.extra {
          display: none !important;
        }
      }
    `]
  ],
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
            { text: '关于我们', link: '/about/' },
            { text: '免责声明与推广披露', link: '/about/disclaimer' },
            { text: '评测标准与评分权重', link: '/about/methodology' },
            { text: '测速基准与环境规范', link: '/about/benchmarks' }
          ]
        }
      ]
    },
    footer: {
      message: '<a href="/about/disclaimer">免责声明与推广披露</a> ｜ <a href="/about/methodology">评测方法论</a> ｜ <a href="/about/benchmarks">测速基准说明</a>',
      copyright: '© 2026 机场专线云 (jichangzhuanxianyun.com) - 专注于 2026 稳定机场推荐与高速专线测评'
    }
  }
})
