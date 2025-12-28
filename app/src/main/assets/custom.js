window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});(function() {
    /**
     * 1. 拦截新窗口跳转 (解决 target="_blank" 失效问题)
     */
    const hookClick = (e) => {
        const origin = e.target.closest('a');
        const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
        
        if (origin && origin.href) {
            // 如果链接设置了新窗口打开，或者 head 设置了全局新窗口
            if (origin.target === '_blank' || isBaseTargetBlank) {
                e.preventDefault();
                console.log('拦截新窗口，当前页跳转:', origin.href);
                location.href = origin.href;
            }
        }
    };
    document.addEventListener('click', hookClick, { capture: true });

    /**
     * 2. 拦截 JS 弹窗 (window.open)
     */
    window.open = function (url) {
        if (url) {
            console.log('拦截 window.open:', url);
            location.href = url;
        }
        return null; // window.open 通常返回新窗口引用，这里返回 null 防止后续报错
    };

    /**
     * 3. 保护登录状态 (防止被网页脚本恶意清空)
     */
    const originalClear = window.localStorage.clear;
    window.localStorage.clear = function() {
        console.warn("阻止了 LocalStorage.clear()，保护登录状态");
    };

    /**
     * 4. 视频全屏功能适配
     */
    const initVideoFeatures = () => {
        // 点击原生全屏按钮修复
        document.addEventListener('click', (e) => {
            const target = e.target;
            const isFsBtn = target.closest('[class*="fullscreen"], [class*="player-full"], [aria-label*="全屏"]');
            if (isFsBtn) {
                const videoWrap = target.closest('div, section, .video-container') || document.querySelector('video');
                if (videoWrap && !document.fullscreenElement) {
                    videoWrap.requestFullscreen().catch(() => {
                        const v = document.querySelector('video');
                        if (v) v.requestFullscreen();
                    });
                }
            }
        }, true);

        // 双击视频区域全屏 (备用方案)
        document.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'VIDEO') {
                if (!document.fullscreenElement) {
                    e.target.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        });
    };

    // 启动初始化
    if (document.readyState === 'complete') {
        initVideoFeatures();
    } else {
        window.addEventListener('load', initVideoFeatures);
    }
})();