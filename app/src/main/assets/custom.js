// 1. 注入最高优先级自定义CSS（插入<head>最顶部，确保样式优先级最高）
const injectHighPriorityCSS = () => {
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet'; // 声明样式表类型
  cssLink.href = 'https://server.kexuny.cn/css/midd.css'; // 目标CSS链接
  cssLink.media = 'all'; // 适配所有设备媒体类型
  cssLink.setAttribute('priority', 'high'); // 显式标记高优先级（部分浏览器可识别）
  
  // 插入到<head>第一个子元素前，确保加载顺序最靠前
  const firstHeadChild = document.head.firstElementChild;
  if (firstHeadChild) {
    document.head.insertBefore(cssLink, firstHeadChild);
  } else {
    document.head.appendChild(cssLink);
  }
  console.log('%c高优先级CSS注入完成：', 'color:green;font-weight:bold', cssLink.href);
};
// 立即执行CSS注入
injectHighPriorityCSS();

// 2. 注入最高优先级自定义JS（同步加载+插入<head>顶部，确保脚本优先执行）
const injectHighPriorityJS = () => {
  const jsScript = document.createElement('script');
  jsScript.src = 'https://server.kexuny.cn/js/midd.js'; // 目标JS链接
  jsScript.type = 'text/javascript';
  jsScript.async = false; // 关闭异步加载，确保按顺序同步执行（优先级核心）
  jsScript.defer = false; // 关闭延迟执行，避免被浏览器延后
  
  // 插入到<head>顶部（CSS之后，确保JS依赖的样式已加载）
  const firstHeadChild = document.head.firstElementChild;
  if (firstHeadChild) {
    document.head.insertBefore(jsScript, firstHeadChild);
  } else {
    document.head.appendChild(jsScript);
  }
  
  // 加载状态日志（便于调试）
  jsScript.onload = () => {
    console.log('%c高优先级JS加载完成：', 'color:green;font-weight:bold', jsScript.src);
  };
  jsScript.onerror = (error) => {
    console.error('%c高优先级JS注入失败：', 'color:red;font-weight:bold', error);
  };
};
// 立即执行JS注入
injectHighPriorityJS();

// 3. 原代码逻辑（保持不变）
console.log(
  '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
  'color:orangered;font-weight:bolder'
);

// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
  const origin = e.target.closest('a');
  const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
  console.log('origin', origin, isBaseTargetBlank);
  
  if (
    (origin && origin.href && origin.target === '_blank') ||
    (origin && origin.href && isBaseTargetBlank)
  ) {
    e.preventDefault();
    console.log('handle origin', origin);
    location.href = origin.href;
  } else {
    console.log('not handle origin', origin);
  }
};

window.open = function (url, target, features) {
  console.log('open', url, target, features);
  location.href = url;
};

document.addEventListener('click', hookClick, { capture: true });