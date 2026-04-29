// 计算到下一个农历三月三的倒计时（简化版用公历近似，后续可换精确农历库）
function getNextSanYueSan() {
    const now = new Date();
    const year = now.getFullYear();
    // 农历三月三通常在公历4月，我们这里先用公历4月15日作为示例（实际每年不同）
    let target = new Date(year, 3, 15); // 月份从0开始，3=4月
    if (now > target) {
        target = new Date(year + 1, 3, 15);
    }
    return target;
}

function updateCountdown() {
    const target = getNextSanYueSan();
    const now = new Date();
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('countdown').innerHTML = 
        `距离三月三还有 ${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
}

updateCountdown();
setInterval(updateCountdown, 1000);