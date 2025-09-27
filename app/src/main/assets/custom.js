console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// 全局标记：CSS是否加载成功（控制后续JS功能范围）
let isCssLoadedSuccess = false;

// 1. 加载外部CSS的函数（核心：成功后标记状态，不加载JS；失败重试后才用备用JS）
function loadExternalCss(url, fallbackJsUrl) {
    // 先检查CSS是否已加载
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
        console.log(`外部CSS已存在，无需加载: ${url}`);
        isCssLoadedSuccess = true;
        console.log('CSS已加载，不加载备用JS，仅初始化事件响应');
        initLoginEventOnly(); // 只启动事件响应
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

    // CSS加载成功 - 标记状态，只初始化事件，不加载JS
    link.onload = function() {
        console.log(`外部CSS加载成功: ${url}`);
        isCssLoadedSuccess = true;
        console.log('CSS加载成功，不加载备用JS，仅初始化事件响应');
        initLoginEventOnly(); // 仅启动登录事件修复，无样式操作
    };

    // CSS加载失败 - 重试，多次失败后加载备用JS（备用JS也只处理事件）
    link.onerror = function() {
        console.error(`外部CSS加载失败: ${url}`);
        retryLoadCss(url, fallbackJsUrl, 5, 2000);
    };

    loadWhenReady();
}

// 2. 加载外部JS的函数（仅CSS失败时使用，且JS仅处理事件，不包含样式）
function loadExternalScript(url) {
    // 先检查脚本是否已加载
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
        console.log(`备用JS已加载: ${url}`);
        initLoginEventOnly(); // 即使JS已存在，也只启动事件功能
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

    // JS加载成功后：仅初始化事件，屏蔽原JS中的样式相关函数
    script.onload = function() {
        console.log(`备用JS加载成功: ${url}`);
        console.log('备用JS仅启用事件响应，屏蔽样式操作');
        
        // 1. 屏蔽原JS中可能的样式函数（避免干扰CSS）
        if (typeof window.hideElements === 'function') {
            // 重写hideElements，只执行事件相关逻辑，移除样式操作
            const originalHideElements = window.hideElements;
            window.hideElements = function() {
                try {
                    // 执行原函数但过滤样式代码（或直接调用事件初始化）
                    console.log('屏蔽hideElements中的样式操作，仅保留事件逻辑');
                    initLoginEventOnly(); // 优先用统一的事件初始化
                } catch (e) {
                    console.error('重写hideElements执行出错:', e);
                }
            };
            console.log('已重写hideElements，仅保留事件功能');
        } else {
            // 若没有hideElements，直接初始化事件
            initLoginEventOnly();
        }
    };

    // JS加载失败 - 重试
    script.onerror = function() {
        console.error(`备用JS加载失败: ${url}`);
        retryLoadJs(url, 3, 2000);
    };

    executeWhenReady();
}

// 3. 核心：仅初始化登录事件响应（无任何样式操作，确保不干扰CSS）
function initLoginEventOnly() {
    console.log('开始初始化登录事件响应（无样式操作）');

    // 等待DOM和CSS完全渲染（确保登录按钮已存在）
    const waitForLoginBtn = () => {
        const loginBtn = document.querySelector('.style-login-botton.ivu-btn[data-v-2f9eb9a7]');
        if (!loginBtn) {
            console.log('未找到登录按钮，1秒后重试');
            setTimeout(waitForLoginBtn, 1000);
            return;
        }

        // 移除旧事件（避免重复绑定）
        loginBtn.removeEventListener('click', handleLoginClick);

        // 绑定新的事件处理（适配Vue/表单/原生三种场景）
        function handleLoginClick(e) {
            // 场景1：Vue框架（通过__vue__实例获取原始登录方法）
            if (loginBtn.__vue__) {
                const vueInstance = loginBtn.__vue__;
                const commonLoginMethods = ['handleLogin', 'submitLogin', 'onLogin', 'login'];
                
                for (const method of commonLoginMethods) {
                    if (typeof vueInstance[method] === 'function') {
                        vueInstance[method]();
                        console.log(`登录事件：通过Vue方法[${method}]触发`);
                        return;
                    }
                }
            }

            // 场景2：原生表单（触发form提交事件）
            const loginForm = loginBtn.closest('form.ivu-form');
            if (loginForm) {
                e.preventDefault(); // 阻止默认行为，避免冲突
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                loginForm.dispatchEvent(submitEvent);
                console.log(`登录事件：通过表单submit触发`);
                return;
            }

            // 场景3：原生点击（最后兜底，模拟原始点击）
            const nativeClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            loginBtn.dispatchEvent(nativeClickEvent);
            console.log(`登录事件：通过原生点击事件触发`);
        }

        loginBtn.addEventListener('click', handleLoginClick);
        console.log('登录事件响应初始化完成（无样式干扰）');
    };

    waitForLoginBtn();
}

// 4. CSS重试加载函数（多次失败后才加载备用JS）
function retryLoadCss(cssUrl, jsUrl, maxRetries, delay) {
    let retries = 0;
    
    const attemptLoad = () => {
        retries++;
        if (retries <= maxRetries) {
            console.log(`CSS第${retries}次重试加载: ${cssUrl}`);
            setTimeout(() => loadExternalCss(cssUrl, jsUrl), delay);
        } else {
            console.error(`CSS达到最大重试次数(${maxRetries})，尝试加载备用JS（仅事件功能）`);
            loadExternalScript(jsUrl); // 仅加载JS的事件部分
        }
    };
    
    attemptLoad();
}

// 5. JS重试加载函数
function retryLoadJs(url, maxRetries, delay) {
    let retries = 0;
    
    const attemptLoad = () => {
        retries++;
        if (retries <= maxRetries) {
            console.log(`备用JS第${retries}次重试加载: ${url}`);
            setTimeout(() => loadExternalScript(url), delay);
        } else {
            console.error(`备用JS达到最大重试次数(${maxRetries})，尝试直接初始化事件`);
            initLoginEventOnly(); // 最后兜底：直接初始化事件
        }
    };
    
    attemptLoad();
}

// 6. 原有chunk加载失败处理（保持不变）
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        const url = e.target.src;
        if (url.includes('chunk')) {
            console.error(`Chunk加载失败: ${url}`);
            retryLoadJs(url, 3, 3000);
        }
    }
}, true);

// 7. 原有核心点击事件处理（保持不变，不干扰登录事件）
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

// 8. 启动入口：加载CSS，指定备用JS（逻辑不变，后续功能由isCssLoadedSuccess控制）
loadExternalCss(
    'https://server.kexuny.cn/work/midd.css', 
    'https://server.kexuny.cn//work/midd.js'
);