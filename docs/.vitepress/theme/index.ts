import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    if (typeof window !== 'undefined') {
      const updateNavActive = () => {
        const path = window.location.pathname
        const isHome = path === '/' || path === '/index.html' || path === ''
        if (!isHome) return

        const homeLinks = document.querySelectorAll('a[href="/"].VPNavBarMenuLink, a[href="/"].VPNavScreenMenuLink')
        const rankingLinks = document.querySelectorAll('a[href="/#ranking"].VPNavBarMenuLink, a[href="/#ranking"].VPNavScreenMenuLink')
        if (!homeLinks.length || !rankingLinks.length) return

        const rankingEl = document.getElementById('ranking')
        const scrollY = window.scrollY || window.pageYOffset || 0
        const hash = window.location.hash

        let isAtRanking = false
        if (rankingEl) {
          const rect = rankingEl.getBoundingClientRect()
          // 榜单标题进入视口上方（例如离顶部 200px 以内），或者在页面中下部
          isAtRanking = hash === '#ranking' || (rect.top <= 200 && rect.bottom >= -500)
        } else if (hash === '#ranking') {
          isAtRanking = true
        }

        // 如果用户往上滚回了顶部 Hero 区域（小于 250px），且没有点击 #ranking 锚点，则归位到首页高亮
        if (scrollY < 250 && hash !== '#ranking') {
          isAtRanking = false
        }

        if (isAtRanking) {
          homeLinks.forEach(el => el.classList.remove('active'))
          rankingLinks.forEach(el => el.classList.add('active'))
        } else {
          homeLinks.forEach(el => el.classList.add('active'))
          rankingLinks.forEach(el => el.classList.remove('active'))
        }
      }

      // 点击导航栏瞬间零延迟切换高亮
      document.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement)?.closest('a')
        if (!target) return
        const href = target.getAttribute('href')
        const homeLinks = document.querySelectorAll('a[href="/"].VPNavBarMenuLink, a[href="/"].VPNavScreenMenuLink')
        const rankingLinks = document.querySelectorAll('a[href="/#ranking"].VPNavBarMenuLink, a[href="/#ranking"].VPNavScreenMenuLink')
        
        if (href === '/#ranking' || href === '#ranking') {
          homeLinks.forEach(el => el.classList.remove('active'))
          rankingLinks.forEach(el => el.classList.add('active'))
        } else if (href === '/' || href === '/index.html') {
          homeLinks.forEach(el => el.classList.add('active'))
          rankingLinks.forEach(el => el.classList.remove('active'))
        }
      }, { passive: true })

      window.addEventListener('scroll', updateNavActive, { passive: true })
      window.addEventListener('hashchange', () => setTimeout(updateNavActive, 50))
      window.addEventListener('popstate', () => setTimeout(updateNavActive, 50))
      
      // 页面挂载完成与刷新后立即检测并同步
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(updateNavActive, 100))
      } else {
        setTimeout(updateNavActive, 100)
      }
    }
  }
}
