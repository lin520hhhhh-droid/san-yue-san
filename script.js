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
/*********************** 五色糯米饭上色游戏 ***********************/
(function(){
    // 五种颜色定义（对应红兰、蝶豆花、枫叶等植物的象征色）
    const dyeColors = [
        { name: '红', color: '#D93B3B', plant: '红兰草' },
        { name: '黄', color: '#F2C94C', plant: '黄花' },
        { name: '蓝', color: '#2F80ED', plant: '蝶豆花' },
        { name: '紫', color: '#9B51E0', plant: '紫蕃藤' },
        { name: '黑', color: '#2E1A1A', plant: '枫叶' } // 原来#333333，现在带点暖黑
    ];

    const canvas = document.getElementById('riceCanvas');
    const ctx = canvas.getContext('2d');
    const dyesContainer = document.getElementById('dyes');
    const messageDiv = document.getElementById('gameMessage');

    // 调整Canvas尺寸适应小屏幕（可选）
    function resizeCanvas() {
        const maxWidth = Math.min(500, window.innerWidth - 40);
        if (canvas.width !== maxWidth) {
            canvas.width = maxWidth;
            canvas.height = maxWidth * 0.8;
            drawRice();
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ---------- 1. 绘制饭团轮廓 ----------
   // 饭团轮廓：底部宽大，向上逐层收拢，顶部中央凸起
const riceParts = [
    // 底层——最宽大的基底（像饭碗扣出来的大圆底）
    { x: 0.50, y: 0.58, r: 0.27 }, 
    { x: 0.30, y: 0.52, r: 0.22 },   
    { x: 0.70, y: 0.52, r: 0.22 },   
    // 中层——开始收拢，但保持饱满
    { x: 0.35, y: 0.38, r: 0.22 },
    { x: 0.65, y: 0.38, r: 0.22 },
    { x: 0.50, y: 0.34, r: 0.24 },
    // 上层——进一步收，形成坡度
    { x: 0.40, y: 0.22, r: 0.18 },
    { x: 0.60, y: 0.22, r: 0.18 },
    // 顶点——最上面鼓出来的几粒米
    { x: 0.45, y: 0.11, r: 0.14 },
    { x: 0.55, y: 0.11, r: 0.14 },
    { x: 0.50, y: 0.06, r: 0.10 }
];
// 每个区域内的米粒偏移（预生成，提高性能）
const grainOffsets = [];
function generateGrains() {
    for (let i = 0; i < riceParts.length; i++) {
        const part = riceParts[i];
        const grains = [];
        const count = 22 + Math.floor(Math.random() * 12); // 22~33个米粒
        const baseR = part.r;
        for (let j = 0; j < count; j++) {
            // 在圆内随机分布，略偏中心以避免边缘太稀疏
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * baseR * 0.85; // 保证在圆内
            const ox = Math.cos(angle) * dist;
            const oy = Math.sin(angle) * dist;
            const grainR = 0.03 + Math.random() * 0.04; // 小圆半径比例
            grains.push({ ox, oy, r: grainR });
        }
        grainOffsets.push(grains);
    }
}
generateGrains(); // 立即生成
    // 存储每个区域的染色状态，-1表示未染，0-4表示对应颜色索引
    let partColors = new Array(riceParts.length).fill(-1);
    let filledCount = 0;

    function drawRice() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // === 画碗 ===
    ctx.save();
    const bowlCX = w * 0.5;
    const bowlCY = h * 0.62;
    const bowlRX = w * 0.34;
    const bowlRY = h * 0.28;
    ctx.beginPath();
    ctx.ellipse(bowlCX, bowlCY, bowlRX, bowlRY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 250, 240, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#e6c04c';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 碗口阴影
    ctx.beginPath();
    ctx.ellipse(bowlCX, bowlCY - bowlRY * 0.3, bowlRX * 0.75, bowlRY * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fill();
    ctx.restore();

    // === 画饭团米粒 ===
    for (let i = 0; i < riceParts.length; i++) {
        const part = riceParts[i];
        const cx = part.x * w;
        const cy = part.y * h;
        const baseColor = partColors[i] >= 0 ? dyeColors[partColors[i]].color : '#FFFEF0';
        const grains = grainOffsets[i];

        for (let g = 0; g < grains.length; g++) {
            const grain = grains[g];
            const gx = cx + grain.ox * Math.min(w, h);
            const gy = cy + grain.oy * Math.min(w, h);
            const gr = grain.r * Math.min(w, h);

            ctx.beginPath();
            ctx.arc(gx, gy, gr, 0, Math.PI * 2);

            // 给米粒加一点细微的颜色深浅变化
            if (partColors[i] >= 0) {
                // 已染色：在基础色上随机变亮或变暗
                const rgb = hexToRgb(baseColor);
                const variation = 0.85 + Math.random() * 0.3; // 0.85~1.15
                const r = Math.min(255, Math.floor(rgb.r * variation));
                const g2 = Math.min(255, Math.floor(rgb.g * variation));
                const b = Math.min(255, Math.floor(rgb.b * variation));
                ctx.fillStyle = `rgb(${r},${g2},${b})`;
            } else {
                // 未染色：米白带极微的暖黄
                const rand = Math.random();
                ctx.fillStyle = rand < 0.3 ? '#fffef5' : '#fffefa';
            }

            ctx.fill();
            // 不加描边，米粒之间自然融合
        }
    }
}

// 辅助函数：十六进制颜色转RGB
function hexToRgb(hex) {
    const c = hex.substring(1);
    const bigint = parseInt(c, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

    // ---------- 2. 创建染料块 ----------
    function createDyes() {
        dyeColors.forEach((dye, index) => {
            const div = document.createElement('div');
            div.className = 'dye';
            div.style.backgroundColor = dye.color;
            div.setAttribute('data-index', index);
            div.title = dye.plant; // 悬浮提示植物名
            div.setAttribute('draggable', 'true');

            // 鼠标事件
            div.addEventListener('dragstart', handleDragStart);
            div.addEventListener('dragend', handleDragEnd);

            // 触摸事件（移动端）
            div.addEventListener('touchstart', handleTouchStart, {passive: false});
            div.addEventListener('touchmove', handleTouchMove, {passive: false});
            div.addEventListener('touchend', handleTouchEnd);

            dyesContainer.appendChild(div);
        });
    }

    // ---------- 3. 拖拽与染色逻辑 ----------
    let draggedDyeIndex = null;
    let touchClone = null; // 触摸时跟随手指的元素

    // --- 桌面端拖拽事件 ---
    function handleDragStart(e) {
        draggedDyeIndex = parseInt(this.getAttribute('data-index'));
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedDyeIndex);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedDyeIndex = null;
    }

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedDyeIndex === null) return;

        // 获取掉落位置
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;   // canvas 实际像素与CSS大小的比
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        dyeRiceAt(mouseX, mouseY, draggedDyeIndex);
        draggedDyeIndex = null;
    });

    // --- 移动端触摸事件 ---
    let touchDragging = false;
    let currentTouchDyeIndex = null;
    let touchStartX, touchStartY;

    function handleTouchStart(e) {
        e.preventDefault();
        touchDragging = true;
        currentTouchDyeIndex = parseInt(this.getAttribute('data-index'));
        this.classList.add('dragging');

        // 创建一个跟随手指的色块副本
        touchClone = document.createElement('div');
        touchClone.style.cssText = `
            position: fixed;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${dyeColors[currentTouchDyeIndex].color};
            opacity: 0.8;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(touchClone);

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchClone.style.left = touch.clientX + 'px';
        touchClone.style.top = touch.clientY + 'px';
    }

    function handleTouchMove(e) {
        if (!touchDragging || !touchClone) return;
        e.preventDefault();
        const touch = e.touches[0];
        touchClone.style.left = touch.clientX + 'px';
        touchClone.style.top = touch.clientY + 'px';
    }

    function handleTouchEnd(e) {
        if (!touchDragging || currentTouchDyeIndex === null) return;

        const dye = document.querySelector(`.dye[data-index='${currentTouchDyeIndex}']`);
        if (dye) dye.classList.remove('dragging');

        // 判断手指是否在canvas范围内
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;

        if (canvasX >= 0 && canvasX <= rect.width && canvasY >= 0 && canvasY <= rect.height) {
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = canvasX * scaleX;
            const mouseY = canvasY * scaleY;
            dyeRiceAt(mouseX, mouseY, currentTouchDyeIndex);
        }

        // 清理
        if (touchClone) {
            document.body.removeChild(touchClone);
            touchClone = null;
        }
        touchDragging = false;
        currentTouchDyeIndex = null;
    }

    // ---------- 4. 染色逻辑 ----------
    function dyeRiceAt(mx, my, dyeIndex) {
        const w = canvas.width;
        const h = canvas.height;
        let hitPartIndex = -1;

        // 从上层（后画的）开始检查，这样上面的区域优先被点中
        for (let i = riceParts.length - 1; i >= 0; i--) {
            const part = riceParts[i];
            const cx = part.x * w;
            const cy = part.y * h;
            const r = part.r * Math.min(w, h);

            const dx = mx - cx;
            const dy = my - cy;
            if (dx * dx + dy * dy <= r * r) {
                hitPartIndex = i;
                break;
            }
        }

        if (hitPartIndex === -1) return; // 没拖到任何饭粒上

        if (partColors[hitPartIndex] === dyeIndex) {
            // 相同颜色，不重复计数
            drawRice();
            return;
        }

        if (partColors[hitPartIndex] >= 0) {
            // 已经染过其他颜色，本次替换颜色，但filledCount不增不减
            // （如果需要巩固记忆，可以提示“已染色，替换颜色”）
        } else {
            // 新染色
            filledCount++;
        }

        partColors[hitPartIndex] = dyeIndex;
        drawRice();

        // 检查是否全部染色
        if (filledCount === riceParts.length) {
            allColored();
        }
    }

    // ---------- 5. 完成动画 ----------
    function allColored() {
        messageDiv.innerHTML = '✨ 恭喜！你做出一碗吉祥五彩饭！<br>愿你全年顺耐，福气满满 ✨';
        // 简单撒花效果（用DOM创建彩色方块）
        spawnConfetti();
    }

    function spawnConfetti() {
        const colors = ['#F2C94C','#D93B3B','#2F80ED','#9B51E0','#333333','#27AE60'];
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random()*colors.length)]};
                    opacity: 0.8;
                    pointer-events: none;
                    z-index: 10000;
                    transform: rotate(${Math.random()*360}deg);
                    animation: confettiFall ${1 + Math.random()*2}s ease-out forwards;
                `;
                document.body.appendChild(confetti);
                setTimeout(() => {
                    if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
                }, 3000);
            }, i * 30);
        }
    }

    // 撒花动画的关键帧（加到CSS里也行，这里动态注入）
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
    `;
    document.head.appendChild(styleEl);

    // ---------- 6. 启动 ----------
    createDyes();
    drawRice();
})();
// --- 故事面板滚动淡入 ---
const storyPanels = document.querySelectorAll('.story-panel');

function checkStoryPanels() {
    const triggerBottom = window.innerHeight * 0.8;
    storyPanels.forEach(panel => {
        const panelTop = panel.getBoundingClientRect().top;
        if (panelTop < triggerBottom) {
            panel.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkStoryPanels);
checkStoryPanels(); // 初始检查