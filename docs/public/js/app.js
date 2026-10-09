/**
 * 机场专线云 | JichangZhuanxianYun.com 交互脚本
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initTableFilter();
  initScenarioFilter();
  initSearch();
  initFaqAccordion();
  initCopyButtons();
  initReviewModal();
});

/* 1. Theme Toggle */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;
  
  // Check user preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(toggleBtn, savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(toggleBtn, newTheme);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('title', theme === 'dark' ? '切换亮色模式' : '切换暗色模式');
}

/* 2. Recommendation Table Filter */
function initTableFilter() {
  const filterBtns = document.querySelectorAll('.table-filter-btn');
  const tableRows = document.querySelectorAll('#recommendTable tbody tr');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-category');

      tableRows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (cat === 'all' || rowCategory.includes(cat)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

/* 3. Scenario Filter */
function initScenarioFilter() {
  const scenarioBtns = document.querySelectorAll('.scenario-filter-btn');
  const scenarioCards = document.querySelectorAll('.scenario-card');

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTag = btn.getAttribute('data-scenario');

      scenarioCards.forEach(card => {
        const cardTag = card.getAttribute('data-tag');
        if (targetTag === 'all' || cardTag === targetTag) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 4. Live Search Across Page Content */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchBtn = document.getElementById('globalSearchBtn');
  const tipContainer = document.getElementById('searchResultTip');
  if (!searchInput) return;

  function performSearch(shouldScroll = false) {
    const query = searchInput.value.toLowerCase().trim();

    // Collect all searchable elements on current page
    const searchableElements = [
      ...document.querySelectorAll('#recommendTable tbody tr'),
      ...document.querySelectorAll('.scenario-card'),
      ...document.querySelectorAll('.review-card'),
      ...document.querySelectorAll('.coupon-card'),
      ...document.querySelectorAll('.faq-item'),
      ...document.querySelectorAll('.tool-card'),
      ...document.querySelectorAll('.blacklist-card li')
    ];

    if (!query) {
      // Reset all elements
      searchableElements.forEach(el => {
        el.style.display = '';
        el.classList.remove('search-highlight');
      });
      if (tipContainer) {
        tipContainer.textContent = '';
      }
      return;
    }

    let matchCount = 0;
    let firstMatch = null;

    searchableElements.forEach(el => {
      const text = el.innerText.toLowerCase();
      if (text.includes(query)) {
        el.style.display = '';
        el.classList.add('search-highlight');
        matchCount++;
        if (!firstMatch) firstMatch = el;
      } else {
        el.style.display = 'none';
        el.classList.remove('search-highlight');
      }
    });

    // Update tip text
    if (tipContainer) {
      if (matchCount > 0) {
        tipContainer.textContent = `🔍 在本页找到 ${matchCount} 条相关内容`;
        tipContainer.style.color = 'var(--accent-glow)';
      } else {
        tipContainer.textContent = `⚠️ 未找到包含 "${query}" 的相关内容`;
        tipContainer.style.color = 'var(--status-danger)';
      }
    }

    // Smooth scroll to first match if requested (e.g. click search button or press Enter)
    if (shouldScroll && firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Event Listeners
  searchInput.addEventListener('input', () => performSearch(false));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(true);
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch(true);
    });
  }
}

/* 5. FAQ Accordion */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const parent = q.parentElement;
      const isOpen = parent.classList.contains('active');

      // Close all other items for clean accordion effect
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isOpen) {
        parent.classList.add('active');
      }
    });
  });
}

/* 6. Copy Buttons & Toast */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (!code) return;

      navigator.clipboard.writeText(code).then(() => {
        showToast(`已成功复制优惠码: ${code}`);
      }).catch(err => {
        showToast('复制失败，请手动选择复制');
      });
    });
  });
}

function showToast(msg) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* 7. Detailed Review Modal */
const reviewData = {
  'yunjiexian': {
    name: '云界线 (Yunjiexian) - 第一名',
    score: '9.9',
    lines: '全节点 1x 倍率原厂 IPLC 专线 / 单节点最高 2.5Gbps 峰值带宽 / 不限速不限设备数',
    speed: '晚高峰 YouTube 4K 1.0秒开、8K极速缓冲、全节点 0 丢包率',
    unlock: 'Netflix, Disney+, ChatGPT 4o, Claude 3.5, TikTok 原生 IP 零验证全解封',
    price: '轻云·基础版 ￥22.00/月 (150GB) | 凌云·进阶版 ￥40.00/月 (300GB) | 年付小包 ￥96.00/年 (折合￥8/月 60GB/月)',
    service: '高效客服响应，快速处理工单问题，全平台客户端一键订阅',
    pros: [
      '全节点 1x 真实倍率，绝无虚标扣量陷阱，单节点峰值高达 2.5Gbps',
      '完全不限制客户端连接设备数量与峰值网速上限',
      '多样化套餐：年付包折合 ￥8/月、轻云基础版 ￥22/月，另有 ￥99 闲云随心按量包'
    ],
    cons: [
      '促销季度热门轻量套餐偶有售罄需及时关注补货',
      '按量随心包不提供单独补充流量包'
    ],
    target: '非常适合对晚高峰 4K/8K 极速播放、多设备合租、ChatGPT/Claude 原生纯净 IP 有高要求的用户，以及寻求极致性价比与 IPLC 专线稳定性的极客。'
  },
  'dalao': {
    name: '大佬云 (DaLao Cloud) - 第二名',
    score: '9.7',
    lines: '全节点 1x 倍率原厂 IPLC 专线 / 单节点最高 2.5Gbps 峰值带宽 / 节点涵盖香港x20、台湾x10、日本x10、新加坡x10、美国x10',
    speed: '晚高峰 YouTube 4K 1.2秒开，8K超清极速播放，全节点 0 丢包',
    unlock: 'Netflix, Disney+, ChatGPT 4o, Claude 3.5 原生家庭宽带 IP 零验证解锁',
    price: '初云·入门版 ￥23.00/月 (130GB) | 凌云·基础版 ￥43.00/月 (300GB) | 御云·高级版 ￥73.00/月 (600GB) | 年付活动包 ￥96.00/年 (折合￥8/月 60GB/月)',
    service: '高效客服响应，快速处理工单问题，多客户端全平台一键订阅',
    pros: [
      '全节点 1x 真实倍率 IPLC 专线，单节点最高 2.5Gbps 峰值带宽，覆盖港日台新美等多机房',
      '完全不限制客户端连接设备并发数量，原生 IP 完美解封主流流媒体与 AI 大模型',
      '多样化套餐方案：初云版 ￥23/月 (130G)、年付活动包 ￥96/年 (折合￥8/月)，另有 ￥99/￥199 终身按量随心包'
    ],
    cons: [
      '年付活动包每月流量额度为 60GB，适合小流量及日常办公用户',
      '终身按量包用完后需重新下单购买'
    ],
    target: '非常适合对 IPLC 专线低延迟有较高要求、多设备同时在线、需要轻量年付活动包（折合8元/月）或不限时按量备用的用户。'
  },
  'huanqiu': {
    name: '环球梯 (HuanQiu Ti) - 第三名',
    score: '9.5',
    lines: 'IPLC 专线 + Hysteria2 高速协议 / 晚高峰优化 / 多地区线路智能选择',
    speed: '晚高峰 YouTube 4K 1.5秒开，8K超清播放流畅，低丢包率',
    unlock: '美/日/港/台主流流媒体 (Netflix/Disney+) & ChatGPT / Claude AI 服务全解锁',
    price: '环球学生套餐 ￥96.00/年 (折合￥8/月 60GB 3设备) | 环球轻享 ￥23.00/月 (120GB 3设备) | 环球畅游 ￥39.00/月 (240GB 5设备) | 环球尊享 ￥69.00/月 (600GB 10设备) | 随行按量包 ￥99 (80GB 365天 5设备)',
    service: '客服响应迅速，提供流量重置包（￥10~￥36/次），支持全平台客户端一键订阅',
    pros: [
      '全系节点适配 Hysteria2 弱网协议与 IPLC 专线晚高峰优化，极强抗封锁与抗抖动',
      '清晰合理规定不同套餐同时在线设备上限（3台~10台），保障共享公用带宽速度不被恶意滥用',
      '丰富档位选项：环球学生套餐 ￥96/年 (折合8元/月)、轻享版 ￥23/月 (120GB)、畅游版 ￥39/月 (240GB 5设备)'
    ],
    cons: [
      '学生套餐与轻享版同时在线设备上限为 3 台',
      '环球随行包 (￥99/80G) 与灵活包 (￥299/400G) 按照 365 天有效期计费'
    ],
    target: '非常适合注重同时在线设备数明确、喜欢学生年付优惠（折合8元/月）、需要多设备家庭共享 (最高10设备) 及 Hysteria2 弱网协议优化的用户。'
  },
  'liulian': {
    name: '榴莲云 (LiuLian Cloud) - 第四名',
    score: '9.3',
    lines: '全节点 1x 倍率原厂 IPLC 专线 / 单节点最高 2.5Gbps 峰值速率 / 香港x20、台湾x10、日本x10、新加坡x10、英国x10',
    speed: '晚高峰 YouTube 4K 1.5秒秒开，8K超清播放顺畅，丢包率 < 0.1%',
    unlock: 'Netflix, Disney+, ChatGPT 4o, Claude 3.5 原生 IP 零验证全解封',
    price: '搬迁包-年付特惠 ￥96.00/年 (折合￥8/月 60GB) | 轻享包 ￥24.00/月 (140GB，两年付折合￥16.80/月) | 畅享包 ￥40.00/月 (260GB) | 尊享包 ￥60.00/月 (420GB) | 搬迁王 ￥100.00/月 (750GB，每100G低至￥13.33)',
    service: '高效客服响应，快速处理问题，全平台一键订阅库完善',
    pros: [
      '全节点 1x 真实倍率 IPLC 专线，单节点最高 2.5Gbps，完全不限制客户端连接设备数与网速',
      '多重订阅折扣优惠：季付 9 折、半年 8.5 折、年付 8 折、两年付更享 7 折大优惠',
      '超值海量套餐选择：搬迁王 750GB/月 每 100G 低至 13.33 元，年付特惠搬迁包低至 8 元/月'
    ],
    cons: [
      '搬迁包-年付特惠版月流量为 60GB，适合小流量及日常轻度用户',
      '两年付方案虽享有 7 折最大折扣，但周期较长，建议先月付体验'
    ],
    target: '非常适合追求大流量超高性价比（750G海量包/140G轻享包）、重视长周期折扣（最高7折优惠）及 IPLC 专线低延迟高稳定性的追剧与办公用户。'
  },
  'shenxing': {
    name: '神行加速 (ShenXing Express) - 第五名',
    score: '9.1',
    lines: 'BGP 中转 + FullCone NAT 电竞级',
    speed: '外服游戏延迟 35-50ms，YouTube 4K 极速',
    unlock: 'YouTube 4K, TikTok, Steam, 外服游戏加速',
    price: '￥18.00 / 月 (配额 300GB)',
    service: '在线客服响应及时，帮助文档完善',
    pros: ['开放 FullCone NAT 类型，专为外服游戏与追剧优化', '300GB 大流量套餐，满足多媒体下载需求'],
    cons: ['AI 解封节点需特殊挑选', '节点数量相对集中'],
    target: '适合外服主机电竞玩家、4K 影音狂热追剧族以及大流量需求用户。'
  },
  'shandian': {
    name: '闪电鼠 (ShanDian Shu) - 第六名',
    score: '9.1',
    lines: '全线 IEPL 专线 / 单节点最高 2.5Gbps 峰值带宽 / 香港x20、台湾x10、日本x10、新加坡x10、美国x10 及欧洲热门节点',
    speed: '晚高峰 4K 秒开、8K 极速流畅播放、低延迟 0 丢包',
    unlock: 'Netflix, Disney+, ChatGPT, TikTok 原生 IP 零验证解锁',
    price: '限时钜惠小包 ￥96.00/年 (折合￥8/月 60GB) | 闪电鼠·轻快版 ￥22.00/月 (120GB，每天不到￥0.74) | 闪电鼠·疾速版 ￥40.00/月 (250GB，每天约￥1.33) | 闪电鼠·雷霆版 ￥70.00/月 (500GB，每天约￥2.33)',
    service: '7x24 小时真人客服支持，每 30 天自动刷新重置流量，全平台一键订阅',
    pros: [
      '全节点 1x 真实倍率 IEPL 专线，单节点最高 2.5Gbps 峰值，晚高峰不限速',
      '完全不限制同时使用客户端数量，多设备（电脑、手机、路由器）自由在线',
      '套餐阶梯丰富：限时钜惠年付包折合 ￥8/月、120G 轻快版 ￥22/月、250G 疾速版 ￥40/月、500G 雷霆版 ￥70/月'
    ],
    cons: [
      '限时钜惠小包需按年订阅，月配额 60GB 适合小流量轻度用户',
      '大流量 500GB 雷霆版每月预算需 70 元'
    ],
    target: '非常适合注重 IEPL 专线低延迟体验、多设备同时在线无限制、追求折合￥8/月高性价比年付包或大流量追剧（250G/500G）的用户。'
  }
};

function initReviewModal() {
  const modalOverlay = document.getElementById('reviewModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const triggerBtns = document.querySelectorAll('.open-review-modal');

  if (!modalOverlay) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const airportId = btn.getAttribute('data-id');
      const data = reviewData[airportId];

      if (data) {
        document.getElementById('modalTitle').textContent = `${data.name} 深度测评报告`;
        document.getElementById('modalScore').textContent = `${data.score} 分`;
        document.getElementById('modalLines').textContent = data.lines;
        document.getElementById('modalSpeed').textContent = data.speed;
        document.getElementById('modalUnlock').textContent = data.unlock;
        document.getElementById('modalPrice').textContent = data.price;
        document.getElementById('modalService').textContent = data.service;
        
        // Pros
        const prosUl = document.getElementById('modalPros');
        prosUl.innerHTML = data.pros.map(p => `<li>${p}</li>`).join('');

        // Cons
        const consUl = document.getElementById('modalCons');
        consUl.innerHTML = data.cons.map(c => `<li>${c}</li>`).join('');

        // Target
        document.getElementById('modalTarget').textContent = data.target;

        modalOverlay.classList.add('active');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
}
