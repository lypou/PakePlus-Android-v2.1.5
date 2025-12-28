window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});(function() {
    'use strict';

    /**
     * 1. 桌面布局适配 (1920*1080)
     * 强制 WebView 模拟桌面宽屏显示
     */
    const designWidth = 1920;
    const updateViewport = () => {
        const scale = window.screen.width / designWidth;
        let meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "viewport";
            document.head.appendChild(meta);
        }
        // initial-scale 根据屏幕宽度自动缩放以适配 1920px
        meta.content = `width=${designWidth}, initial-scale=${scale}, maximum-scale=2.0, user-scalable=yes`;
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);

    /**
     * 2. 导航拦截 (处理 _blank 和 window.open)
     * 解决打包 App 无法打开新窗口/点击链接无反应的问题
     */
    const handleNavigation = (url) => {
        if (!url || url.startsWith('javascript:')) return;
        window.location.href = url;
    };

    // 拦截 <a> 标签点击
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href) {
            const isBlank = anchor.target === '_blank' || 
                          document.querySelector('head base[target="_blank"]');
            if (isBlank) {
                e.preventDefault();
                handleNavigation(anchor.href);
            }
        }
    }, { capture: true });

    // 拦截脚本控制的弹出窗口
    window.open = (url) => {
        handleNavigation(url);
        return null;
    };

    /**
     * 3. 页面路径记忆功能
     * 自动记录并恢复上次访问的页面
     */
    const STORAGE_KEY = 'pake_last_visited_url';
    const REDIRECT_FLAG = 'pake_auto_redirected';

    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl && savedUrl !== location.href && !sessionStorage.getItem(REDIRECT_FLAG)) {
        sessionStorage.setItem(REDIRECT_FLAG, 'true');
        window.location.replace(savedUrl);
    }

    // 监听 URL 变化，实时保存（兼容单页应用 SPA）
    const recordUrl = () => {
        if (location.href !== localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, location.href);
        }
    };
    window.addEventListener('popstate', recordUrl);
    window.addEventListener('hashchange', recordUrl);
    document.addEventListener('click', () => setTimeout(recordUrl, 500));

    /**
     * 4. UI 导航控件 (前进/后退/刷新/置顶)
     */
    const injectUI = () => {
        // 注入样式
        const style = document.createElement('style');
        style.innerHTML = `
            #pake-desktop-nav {
                position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                display: flex; background: rgba(45, 45, 45, 0.8); backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; 
                padding: 5px 15px; z-index: 2147483647;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4); opacity: 0.5; transition: opacity 0.3s;
                user-select: none; -webkit-user-select: none;
            }
            #pake-desktop-nav:hover { opacity: 1; }
            .nav-btn {
                color: white; width: 45px; height: 45px; line-height: 45px;
                text-align: center; font-size: 20px; cursor: pointer; margin: 0 5px;
            }
            .nav-btn:active { background: rgba(255,255,255,0.2); border-radius: 50%; }
        `;
        document.head.appendChild(style);

        // 注入 HTML
        const nav = document.createElement('div');
        nav.id = 'pake-desktop-nav';
        nav.innerHTML = `
            <div class="nav-btn" id="pake-back">◀</div>
            <div class="nav-btn" id="pake-reload">↻</div>
            <div class="nav-btn" id="pake-forward">▶</div>
            <div class="nav-btn" id="pake-top">▲</div>
        `;
        document.body.appendChild(nav);

        // 绑定事件
        document.getElementById('pake-back').onclick = () => window.history.back();
        document.getElementById('pake-reload').onclick = () => window.location.reload();
        document.getElementById('pake-forward').onclick = () => window.history.forward();
        document.getElementById('pake-top').onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // 确保 DOM 加载完成后再注入导航条
    if (document.readyState === 'complete') {
        injectUI();
    } else {
        window.addEventListener('load', injectUI);
    }
})();