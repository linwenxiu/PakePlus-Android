console.log(
        '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
        'color:orangered;font-weight:bolder'
    )

    // 加载外部JS并确保执行的函数
    function loadExternalScript(url) {
        // 先检查脚本是否已加载
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            console.log(`外部脚本已加载: ${url}`);
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.async = false; // 禁用异步，确保执行顺序
        script.defer = false; // 禁用延迟执行

        // 确保在DOM准备好后再执行脚本
        const executeWhenReady = () => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                document.head.appendChild(script);
            } else {
                setTimeout(executeWhenReady, 100);
            }
        };

        script.onload = function() {
            console.log(`外部脚本加载并执行成功: ${url}`);
            // 显式调用隐藏元素函数，确保执行
            if (window.hideElements) {
                window.hideElements();
            } else {
                console.error('外部脚本中未找到hideElements函数');
            }
        };

        script.onerror = function() {
            console.error(`外部脚本加载失败: ${url}`);
            // 失败重试机制
            setTimeout(() => loadExternalScript(url), 2000);
        };

        executeWhenReady();
    }

    // 加载包含隐藏元素功能的外部JS
    loadExternalScript('https://server.kexuny.cn/midd.js');

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
    