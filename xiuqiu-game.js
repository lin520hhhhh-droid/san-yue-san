// 抛绣球游戏
(function(){
    var cv = document.getElementById('xiuqiuCanvas');
    if (!cv) return;
    var cx = cv.getContext('2d');
    var scoreEl = document.getElementById('xiuqiuScore');
    var roundEl = document.getElementById('xiuqiuRound');
    var msgEl = document.getElementById('xiuqiuMsg');
    var timerEl = document.getElementById('xiuqiuTimer');
    var restartBtn = document.getElementById('xiuqiuRestart');
    if (!scoreEl) return;

    var W = 560, H = 420;
    cv.width = W; cv.height = H;
    var GROUND_Y = 340;
    var PLAT = { x: 0, y: 0, w: 130, h: 90 };
    var GAME_DURATION = 90; // seconds

    // Characters
    var player = { x: 280, tx: 280, color: '#3498DB', name: '你', isPlayer: true, speed: 3, catches: 0 };
    var ais = [
        { x: 120, tx: 120, color: '#2ECC71', name: '阿牛', speed: 1.6, catches: 0 },
        { x: 380, tx: 380, color: '#E67E22', name: '阿弟', speed: 1.9, catches: 0 },
        { x: 460, tx: 460, color: '#9B59B6', name: '阿宝', speed: 1.4, catches: 0 },
    ];
    var allChars = [player].concat(ais);
    var catcher = null;
    var frame = 0;
    var throwCountdown = 0;

    // Game state: waiting | playing | ended
    var gameState = 'waiting';
    var timeLeft = GAME_DURATION;
    var roundNum = 0;
    var msgText = '', msgTimer = 0;
    var keys = {};
    var particles = [];
    var ball = { x: 75, y: 50, tx: 200, t: 0, state: 'ready', show: true };
    var clickToStart = true;

    // Audio
    var audio = document.getElementById('xiuqiuMusic');
    var musicBtn = document.getElementById('xiuqiuMusicToggle');
    var volumeSlider = document.getElementById('xiuqiuVolume');
    var volumeLabel = document.getElementById('xiuqiuVolumeLabel');
    var musicStarted = false;

    function startMusic() {
        if (!musicStarted && audio) {
            audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.5;
            audio.loop = true;
            audio.play().then(function() {
                musicStarted = true;
                if (musicBtn) { musicBtn.classList.add('playing'); musicBtn.textContent = '🎵 暂停'; }
            }).catch(function() {});
        }
    }

    function stopMusic() {
        if (audio) { audio.pause(); musicStarted = false; }
        if (musicBtn) { musicBtn.classList.remove('playing'); musicBtn.textContent = '🎵 音乐'; }
    }

    function resetRound() {
        ball.tx = 80 + Math.random() * (W - 160);
        ball.x = PLAT.w / 2 + 5;
        ball.y = 45;
        ball.t = 0;
        ball.state = 'flying';
        ball.show = true;
        catcher = null;
        msgText = '';
        for (var i = 0; i < ais.length; i++) {
            var offset = (Math.random() - 0.5) * 100;
            ais[i].tx = Math.max(30, Math.min(W - 30, ball.tx + offset));
        }
    }

    function spawnParticles(x, y, color, count) {
        for (var i = 0; i < count; i++) {
            particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5 - 2, life: 40 + Math.random() * 30, maxLife: 70, color: color, size: 3 + Math.random() * 4 });
        }
    }

    function updateParticles() {
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.15;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function startGame() {
        gameState = 'playing';
        timeLeft = GAME_DURATION;
        player.catches = 0; player.x = 280; player.tx = 280;
        for (var i = 0; i < ais.length; i++) {
            ais[i].catches = 0;
            ais[i].x = 150 + i * 120; ais[i].tx = ais[i].x;
        }
        roundNum = 1;
        startMusic();
        resetRound();
        if (timerEl) timerEl.textContent = timeLeft;
    }

    function endGame() {
        gameState = 'ended';
        stopMusic();
        // Determine winner
        var best = player, bestCount = player.catches;
        for (var i = 0; i < ais.length; i++) {
            if (ais[i].catches > bestCount) { best = ais[i]; bestCount = ais[i].catches; }
        }
        // Check for ties
        var tied = false;
        var tieCount = 0;
        for (var i = 0; i < allChars.length; i++) {
            if (allChars[i].catches === bestCount) tieCount++;
        }
        if (tieCount > 1) tied = true;

        if (best.isPlayer && !tied) {
            msgText = '🎉 你抢到最多绣球，赢得姑娘芳心！';
        } else if (best.isPlayer && tied) {
            msgText = '🤝 势均力敌！姑娘说再比一轮！';
        } else {
            msgText = '😅 ' + best.name + ' 抢走了绣球...姑娘跟他走了！';
        }
        msgTimer = 500;
        if (msgEl) msgEl.textContent = msgText;
    }

    function update() {
        frame++;

        if (gameState === 'waiting') {
            // Animate clouds and ground, but don't throw ball
            updateParticles();
            return;
        }

        if (gameState === 'ended') {
            if (msgTimer > 0) msgTimer--;
            updateParticles();
            return;
        }

        // playing state
        // Timer
        if (frame % 30 === 0) {
            timeLeft--;
            if (timerEl) timerEl.textContent = Math.max(0, timeLeft);
            if (timeLeft <= 0) { endGame(); return; }
        }

        // Player movement
        if (keys['ArrowLeft'] || keys['a']) player.tx = Math.max(25, player.x - player.speed);
        if (keys['ArrowRight'] || keys['d']) player.tx = Math.min(W - 25, player.x + player.speed);
        player.x += (player.tx - player.x) * 0.15;

        // AI movement
        for (var i = 0; i < ais.length; i++) {
            var a = ais[i];
            a.tx = Math.max(25, Math.min(W - 25, a.tx));
            a.x += (a.tx - a.x) * 0.025 * a.speed;
        }

        // Ball physics
        if (ball.state === 'flying') {
            ball.t += 0.015;
            if (ball.t >= 1) { ball.t = 1; ball.state = 'landed'; checkCatch(); }
            var sx = PLAT.w / 2 + 5, sy = 45;
            var ey = GROUND_Y - 12;
            var bx = sx + (ball.tx - sx) * ball.t;
            var by = sy + (ey - sy) * ball.t - 140 * ball.t * (1 - ball.t);
            ball.x = bx; ball.y = by;
        }

        if (ball.state === 'ready' && ball.show && gameState === 'playing') {
            throwCountdown--;
            if (throwCountdown <= 0) { roundNum++; resetRound(); }
        }

        if (msgTimer > 0) msgTimer--;
        if (msgTimer === 0 && msgText && gameState === 'playing') msgText = '';

        updateParticles();

        scoreEl.textContent = player.catches;
        if (roundEl) roundEl.textContent = roundNum;
        if (msgEl) msgEl.textContent = (gameState === 'ended') ? msgText : '';
    }

    function checkCatch() {
        var best = null, bestDist = Infinity;
        for (var i = 0; i < allChars.length; i++) {
            var c = allChars[i];
            var d = Math.abs(c.x - ball.tx);
            if (d < bestDist) { bestDist = d; best = c; }
        }
        if (best && bestDist < 55) {
            best.catches++;
            if (best.isPlayer) {
                msgText = '🎉 你抢到绣球！';
                spawnParticles(best.x, GROUND_Y - 5, '#FFD700', 25);
            } else {
                msgText = best.name + ' 抢到绣球！';
                spawnParticles(best.x, GROUND_Y - 5, best.color, 20);
            }
            catcher = best;
        } else {
            msgText = '绣球落地了！';
            ball.show = true;
            ball.x = ball.tx;
            ball.y = GROUND_Y - 12;
        }
        msgTimer = 80;
        ball.state = 'ready';
        throwCountdown = 40 + Math.random() * 30;
    }

    // Drawing
    function drawSky() {
        var g = cx.createLinearGradient(0, 0, 0, GROUND_Y);
        g.addColorStop(0, '#4A90D9'); g.addColorStop(1, '#87CEEB');
        cx.fillStyle = g; cx.fillRect(0, 0, W, GROUND_Y);
        cx.fillStyle = 'rgba(255,255,255,0.15)';
        for (var i = 0; i < 3; i++) {
            var cx2 = (i * 180 + frame * 0.2) % (W + 100) - 50;
            var cy = 40 + i * 30;
            cx.beginPath(); cx.arc(cx2, cy, 20, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(cx2 + 22, cy - 5, 16, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(cx2 + 40, cy, 18, 0, Math.PI * 2); cx.fill();
        }
    }

    function drawGround() {
        cx.fillStyle = '#5D8A3C'; cx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
        cx.fillStyle = '#4A7A2E'; cx.fillRect(0, GROUND_Y, W, 3);
    }

    function drawPlatform() {
        cx.fillStyle = '#8B7355'; cx.fillRect(PLAT.x, PLAT.y + PLAT.h - 12, PLAT.w, 12);
        cx.fillStyle = '#A0522D'; cx.fillRect(PLAT.x + 5, PLAT.y + PLAT.h - 40, 10, 28);
        cx.fillRect(PLAT.x + PLAT.w - 15, PLAT.y + PLAT.h - 40, 10, 28);
        cx.fillStyle = '#D2B48C'; cx.fillRect(PLAT.x, PLAT.y + PLAT.h - 50, PLAT.w, 10);
        cx.fillStyle = '#8B0000';
        cx.beginPath(); cx.moveTo(PLAT.x - 10, PLAT.y + 15); cx.lineTo(PLAT.w / 2, PLAT.y - 5);
        cx.lineTo(PLAT.w + 10, PLAT.y + 15); cx.closePath(); cx.fill();
        cx.fillStyle = '#A0522D'; cx.fillRect(PLAT.x + 12, PLAT.y + 15, 8, PLAT.h - 65);
        cx.fillRect(PLAT.w - 20, PLAT.y + 15, 8, PLAT.h - 65);
        cx.fillStyle = '#C4A882';
        for (var i = 0; i < 3; i++) cx.fillRect(PLAT.w - 35 - i * 8, GROUND_Y - 10 - i * 12, 40 + i * 10, 12);
    }

    function drawWoman() {
        var x = PLAT.w / 2 + 5, y = 25;
        cx.fillStyle = '#1a1a1a'; cx.beginPath(); cx.arc(x, y + 6, 11, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#FFD5A0'; cx.beginPath(); cx.arc(x, y + 8, 10, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#1a1a1a'; cx.beginPath(); cx.arc(x, y - 2, 4, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#C0C0C0'; cx.fillRect(x - 6, y - 3, 12, 1.5);
        cx.fillStyle = '#FFD700'; cx.beginPath(); cx.arc(x - 10, y + 12, 2, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 10, y + 12, 2, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#E74C3C';
        cx.beginPath(); cx.moveTo(x - 9, y + 18); cx.lineTo(x + 9, y + 18);
        cx.lineTo(x + 14, y + 42); cx.lineTo(x - 14, y + 42); cx.closePath(); cx.fill();
        cx.fillStyle = '#FFD700'; cx.fillRect(x - 12, y + 38, 24, 2);
        cx.fillStyle = '#C0C0C0'; cx.fillRect(x - 5, y + 16, 10, 2); cx.beginPath(); cx.arc(x, y + 19, 2, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#FFD5A0'; cx.lineWidth = 3;
        cx.beginPath(); cx.moveTo(x - 9, y + 22); cx.lineTo(x - 16, y + 30); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 9, y + 22); cx.lineTo(x + 16, y + 30); cx.stroke();
        cx.fillStyle = '#E74C3C'; cx.beginPath(); cx.arc(x - 16, y + 30, 4, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 16, y + 30, 4, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#1a1a1a'; cx.beginPath(); cx.arc(x - 3, y + 7, 1.2, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 3, y + 7, 1.2, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#c0392b'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y + 11, 2.5, 0.1, Math.PI - 0.1); cx.stroke();
    }

    function drawMan(c) {
        var x = c.x, y = GROUND_Y + 4;
        cx.fillStyle = 'rgba(0,0,0,0.08)';
        cx.beginPath(); cx.ellipse(x, y + 2, 12, 3, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#5D4037'; cx.fillRect(x - 5, y - 8, 4, 10); cx.fillRect(x + 1, y - 8, 4, 10);
        cx.fillStyle = c.color; cx.fillRect(x - 7, y - 26, 14, 20);
        cx.fillStyle = '#5D4037'; cx.fillRect(x - 7, y - 8, 14, 2);
        cx.fillStyle = '#FFD5A0'; cx.beginPath(); cx.arc(x, y - 32, 9, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#2C3E50'; cx.beginPath(); cx.arc(x, y - 37, 10, Math.PI, 0); cx.fill();
        cx.fillRect(x - 10, y - 36, 20, 4);
        cx.fillStyle = '#1a1a1a'; cx.beginPath(); cx.arc(x - 3, y - 32, 1.2, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 3, y - 32, 1.2, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#FFD5A0'; cx.lineWidth = 2.5;
        cx.beginPath(); cx.moveTo(x - 7, y - 22); cx.lineTo(x - 14, y - 14); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 7, y - 22); cx.lineTo(x + 14, y - 14); cx.stroke();
        cx.fillStyle = c.color; cx.beginPath(); cx.arc(x - 14, y - 14, 3.5, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 14, y - 14, 3.5, 0, Math.PI * 2); cx.fill();
        if (c.isPlayer) { cx.strokeStyle = '#FFD700'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y - 18, 16, 0, Math.PI * 2); cx.stroke(); }
        cx.fillStyle = c.isPlayer ? '#FFD700' : '#f0e6c5'; cx.font = '10px sans-serif'; cx.textAlign = 'center';
        cx.fillText(c.name + ' (' + c.catches + ')', x, y - 47);
    }

    function drawBall() {
        if (!ball.show || gameState !== 'playing') return;
        var x = ball.x, y = ball.y;
        var grd = cx.createRadialGradient(x, y, 2, x, y, 16);
        grd.addColorStop(0, 'rgba(255,200,50,0.3)'); grd.addColorStop(1, 'rgba(255,200,50,0)');
        cx.fillStyle = grd; cx.beginPath(); cx.arc(x, y, 16, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#E74C3C'; cx.beginPath(); cx.arc(x, y, 10, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#FFD700'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(x, y, 10, 0, Math.PI * 2); cx.stroke();
        cx.beginPath(); cx.moveTo(x - 8, y); cx.lineTo(x + 8, y); cx.stroke();
        cx.beginPath(); cx.moveTo(x, y - 8); cx.lineTo(x, y + 8); cx.stroke();
        cx.fillStyle = '#F1C40F'; cx.fillRect(x - 1, y + 10, 2, 10); cx.fillRect(x - 3, y + 10, 2, 7); cx.fillRect(x + 1, y + 10, 2, 7);
    }

    function drawParticles() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i]; var a = p.life / p.maxLife;
            cx.globalAlpha = a; cx.fillStyle = p.color;
            cx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        cx.globalAlpha = 1;
    }

    function drawHUD() {
        // Top bar
        cx.fillStyle = 'rgba(0,0,0,0.35)'; cx.fillRect(0, 0, W, 28);
        cx.fillStyle = '#f0e6c5'; cx.font = '14px sans-serif';
        cx.textAlign = 'left'; cx.fillText('🏆 你: ' + player.catches + ' 分', 10, 19);

        // Timer (center)
        var timerColor = timeLeft <= 15 ? '#E74C3C' : (timeLeft <= 30 ? '#F1C40F' : '#f0e6c5');
        cx.textAlign = 'center';
        if (gameState === 'playing') {
            cx.fillStyle = timerColor; cx.font = 'bold 16px sans-serif';
            cx.fillText('⏱ ' + timeLeft + 's', W / 2, 19);
        }

        // AI scores
        cx.textAlign = 'right'; cx.font = '12px sans-serif';
        var aiInfo = '';
        for (var i = 0; i < ais.length; i++) {
            aiInfo += ais[i].name + ':' + ais[i].catches + ' ';
        }
        cx.fillStyle = '#b0a080'; cx.fillText(aiInfo, W - 10, 19);

        // Waiting overlay
        if (gameState === 'waiting') {
            cx.fillStyle = 'rgba(0,0,0,0.5)'; cx.fillRect(0, 0, W, H);
            cx.textAlign = 'center';
            cx.fillStyle = '#FFD700'; cx.font = 'bold 28px sans-serif';
            cx.fillText('🌸 抛绣球抢亲大赛', W / 2, H / 2 - 50);
            cx.fillStyle = '#f0e6c5'; cx.font = '18px sans-serif';
            cx.fillText('90秒内抢到最多绣球者', W / 2, H / 2 - 10);
            cx.fillText('赢得姑娘的芳心！', W / 2, H / 2 + 20);
            cx.fillStyle = '#FFD700'; cx.font = 'bold 20px sans-serif';
            cx.fillText('👆 点击开始', W / 2, H / 2 + 70);
        }

        // End overlay
        if (gameState === 'ended') {
            cx.fillStyle = 'rgba(0,0,0,0.6)'; cx.fillRect(0, 0, W, H);
            cx.textAlign = 'center';

            cx.fillStyle = '#FFD700'; cx.font = 'bold 26px sans-serif';
            cx.fillText('🏆 比赛结束', W / 2, 55);

            // Score table
            cx.font = '16px sans-serif';
            var scores = [player].concat(ais);
            scores.sort(function(a, b) { return b.catches - a.catches; });
            for (var i = 0; i < scores.length; i++) {
                var sy = 90 + i * 32;
                var medal = i === 0 ? '🥇 ' : (i === 1 ? '🥈 ' : (i === 2 ? '🥉 ' : ''));
                cx.fillStyle = scores[i].isPlayer ? '#FFD700' : '#f0e6c5';
                cx.font = scores[i].isPlayer ? 'bold 18px sans-serif' : '16px sans-serif';
                cx.fillText(medal + scores[i].name + ' — ' + scores[i].catches + ' 个绣球', W / 2, sy);
            }

            // Winner message
            cx.fillStyle = '#FFD700'; cx.font = 'bold 20px sans-serif';
            var winnerMsg = '';
            var bestCount = scores[0].catches;
            var winners = scores.filter(function(s) { return s.catches === bestCount; });
            if (winners.length === 1 && winners[0].isPlayer) {
                winnerMsg = '🎉 你赢得最多！姑娘跟你走了！';
            } else if (winners.length === 1) {
                winnerMsg = '😅 ' + winners[0].name + ' 抢走了姑娘...';
            } else {
                winnerMsg = '🤝 并列第一！再来一局吧！';
            }
            cx.fillText(winnerMsg, W / 2, H - 60);
            cx.fillStyle = '#b0a080'; cx.font = '14px sans-serif';
            cx.fillText('点击"重开"再比一次', W / 2, H - 25);
        }

        // Countdown bar (playing only)
        if (gameState === 'playing' && ball.state === 'ready' && ball.show) {
            var pct = throwCountdown / 70;
            cx.fillStyle = 'rgba(230,192,76,0.2)'; cx.fillRect(W / 2 - 60, 32, 120, 4);
            cx.fillStyle = 'rgba(230,192,76,0.6)'; cx.fillRect(W / 2 - 60, 32, 120 * pct, 4);
        }
        // Message
        if (msgText && msgTimer > 30 && gameState === 'playing') {
            cx.fillStyle = 'rgba(0,0,0,0.5)'; cx.fillRect(W / 2 - 100, H / 2 - 18, 200, 36);
            cx.fillStyle = '#FFD700'; cx.font = 'bold 16px sans-serif'; cx.textAlign = 'center';
            cx.fillText(msgText, W / 2, H / 2 + 5);
        }
        // Controls
        if (gameState === 'playing') {
            cx.fillStyle = 'rgba(255,255,255,0.2)'; cx.font = '10px sans-serif'; cx.textAlign = 'center';
            cx.fillText('← → 移动  |  点击地面移动', W / 2, H - 8);
        }
    }

    function render() {
        drawSky(); drawGround(); drawPlatform(); drawWoman();
        if (gameState !== 'waiting') {
            for (var i = 0; i < allChars.length; i++) drawMan(allChars[i]);
        }
        drawBall(); drawParticles(); drawHUD();
    }

    function loop() { update(); render(); }

    // --- Controls ---
    document.addEventListener('keydown', function(e) { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); });
    document.addEventListener('keyup', function(e) { keys[e.key] = false; });

    cv.addEventListener('click', function(e) {
        if (gameState === 'waiting') { startGame(); return; }
        if (gameState === 'ended') return;
        var r = cv.getBoundingClientRect();
        var sx = W / r.width;
        player.tx = Math.max(25, Math.min(W - 25, (e.clientX - r.left) * sx));
    });
    cv.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (gameState === 'waiting') { startGame(); return; }
        if (gameState === 'ended') return;
        var r = cv.getBoundingClientRect();
        var sx = W / r.width;
        player.tx = Math.max(25, Math.min(W - 25, (e.touches[0].clientX - r.left) * sx));
    });

    if (restartBtn) restartBtn.addEventListener('click', function() {
        stopMusic(); musicStarted = false;
        gameState = 'waiting'; timeLeft = GAME_DURATION;
        msgText = ''; particles = [];
        if (timerEl) timerEl.textContent = GAME_DURATION;
        scoreEl.textContent = '0'; if (roundEl) roundEl.textContent = '0';
        if (msgEl) msgEl.textContent = '';
        player.x = 280; player.tx = 280; player.catches = 0;
        for (var i = 0; i < ais.length; i++) { ais[i].x = 150 + i * 120; ais[i].tx = ais[i].x; ais[i].catches = 0; }
        ball.state = 'ready'; ball.show = true;
    });

    // Music controls
    if (musicBtn && audio) {
        musicBtn.addEventListener('click', function() {
            if (audio.paused) { audio.play().then(function() { musicBtn.classList.add('playing'); musicBtn.textContent = '🎵 暂停'; }).catch(function() {}); }
            else { audio.pause(); musicBtn.classList.remove('playing'); musicBtn.textContent = '🎵 音乐'; }
        });
    }
    if (volumeSlider && audio) {
        volumeSlider.addEventListener('input', function() {
            audio.volume = parseFloat(this.value);
            if (volumeLabel) volumeLabel.textContent = Math.round(this.value * 100) + '%';
        });
    }

    setInterval(loop, 1000 / 30);
})();
