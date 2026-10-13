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

