console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// 加载外部CSS的函数，成功则不加载JS，失败则加载JS作为备用
function loadExternalCss(url, fallbackJsUrl) {
    // 先检查CSS是否已加载
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
        console.log(`外部CSS已存在，无需加载: ${url}`);
        console.log('CSS已加载，不加载备用JS');
        return;
    }

    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';

    // 确保在DOM准备好后再加载CSS
    const loadWhenReady = () => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            document.head.appendChild(link);
        } else {
            setTimeout(loadWhenReady, 100);
        }
    };

    // CSS加载成功 - 不加载JS
    link.onload = function() {
        console.log(`外部CSS加载成功: ${url}`);
        console.log('CSS加载成功，不加载备用JS');
    };

    // CSS加载失败 - 尝试加载备用JS
    link.onerror = function() {
        console.error(`外部CSS加载失败: ${url}`);
        // 失败重试机制，最多重试5次
        retryLoadCss(url, fallbackJsUrl, 5, 2000);
    };

    loadWhenReady();
}

// 加载外部JS的函数（仅作为CSS加载失败的备用方案）
function loadExternalScript(url) {
    // 先检查脚本是否已加载
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
        console.log(`备用JS已加载: ${url}`);
        return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;

    const executeWhenReady = () => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            document.head.appendChild(script);
        } else {
            setTimeout(executeWhenReady, 100);
        }
    };

    script.onload = function() {
        console.log(`备用JS加载成功: ${url}`);
        if (typeof window.hideElements === 'function') {
            try {
                window.hideElements();
                console.log('hideElements函数执行成功');
            } catch (e) {
                console.error('hideElements函数执行出错:', e);
            }
        } else {
            console.warn('备用JS中未找到hideElements函数');
        }
    };

    script.onerror = function() {
        console.error(`备用JS加载失败: ${url}`);
        retryLoadJs(url, 3, 2000);
    };

    executeWhenReady();
}

// CSS重试加载函数 - 多次失败后加载备用JS
function retryLoadCss(cssUrl, jsUrl, maxRetries, delay) {
    let retries = 0;
    
    const attemptLoad = () => {
        retries++;
        if (retries <= maxRetries) {
            console.log(`CSS第${retries}次重试加载: ${cssUrl}`);
            setTimeout(() => loadExternalCss(cssUrl, jsUrl), delay);
        } else {
            console.error(`CSS达到最大重试次数(${maxRetries})，尝试加载备用JS`);
            loadExternalScript(jsUrl); // CSS最终失败，加载备用JS
        }
    };
    
    attemptLoad();
}

// JS重试加载函数
function retryLoadJs(url, maxRetries, delay) {
    let retries = 0;
    
    const attemptLoad = () => {
        retries++;
        if (retries <= maxRetries) {
            console.log(`备用JS第${retries}次重试加载: ${url}`);
            setTimeout(() => loadExternalScript(url), delay);
        } else {
            console.error(`备用JS达到最大重试次数(${maxRetries})，停止加载`);
        }
    };
    
    attemptLoad();
}

// 处理chunk加载失败的错误
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        const url = e.target.src;
        if (url.includes('chunk')) {
            console.error(`Chunk加载失败: ${url}`);
            retryLoadJs(url, 3, 3000);
        }
    }
}, true);

// 加载CSS，并指定备用JS地址
loadExternalCss(
    'https://server.kexuny.cn/work/midd.css', 
    'https://server.kexuny.cn//work/midd.js'
);

// 核心点击事件处理，请勿修改
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })
    