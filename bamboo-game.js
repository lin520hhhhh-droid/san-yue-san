// 竹竿舞游戏
(function(){
    var cv = document.getElementById('bambooCanvas');
    if (!cv) return;
    var cx = cv.getContext('2d');
    var scoreEl = document.getElementById('bambooScore');
    var levelEl = document.getElementById('bambooLevel');
    var restartBtn = document.getElementById('bambooRestart');
    if (!scoreEl || !levelEl || !restartBtn) return;

    cv.width = 500; cv.height = 450;
    var W = 500, H = 450;
    var N = 4, PW = 155, PH = 14, GAP_MAX = 100, GAP_MIN = 12;
    var frame = 0, score = 0, level = 1, speed = 1;
    var state = 'playing';
    var dLevel = -1;
    var dy = H - 60, targetY = H - 60;

    var pY = [], pPhase = [];
    function resetPoles() {
        pY = []; pPhase = [];
        var s = H * 0.72, step = (s - 85) / (N - 1);
        for (var i = 0; i < N; i++) {
            pY.push(s - step * i);
            pPhase.push(i * 0.6 * Math.PI + (i % 2) * 0.5);
        }
    }
    resetPoles();

    function gap(i) {
        var t = Math.sin(frame * 0.045 * speed + pPhase[i]);
        return (t + 1) / 2 * (GAP_MAX - GAP_MIN) + GAP_MIN;
    }
    function isOpen(i) { return gap(i) > GAP_MAX * 0.4; }

    function draw() {
        cx.fillStyle = '#1f3460';
        cx.fillRect(0, 0, W, H);

        var cp = W / 2;
        for (var i = 0; i < N; i++) {
            var gv = gap(i), py = pY[i] - PH / 2;
            var lx = cp - gv / 2 - PW, rx = cp + gv / 2;
            cx.fillStyle = '#6B9B37';
            cx.fillRect(lx, py, PW, PH);
            cx.fillRect(rx, py, PW, PH);
            cx.fillStyle = '#8BC34A';
            cx.fillRect(lx + 2, py + 1, PW - 4, PH * 0.35);
            cx.fillRect(rx + 2, py + 1, PW - 4, PH * 0.35);
        }

        var gy = H - 14;
        cx.fillStyle = '#3D2B1F';
        cx.fillRect(0, gy, W, 14);
        cx.fillStyle = '#5D8A3C';
        cx.fillRect(0, gy - 2, W, 3);

        if (dy > -30) {
            cx.fillStyle = '#E74C3C';
            cx.beginPath();
            cx.moveTo(cp - 8, dy);
            cx.lineTo(cp + 8, dy);
            cx.lineTo(cp + 11, dy + 11);
            cx.lineTo(cp - 11, dy + 11);
            cx.closePath();
            cx.fill();
            cx.fillStyle = '#2ECC71';
            cx.fillRect(cp - 6, dy - 14, 12, 14);
            cx.fillStyle = '#FFD5A0';
            cx.beginPath();
            cx.arc(cp, dy - 18, 12, 0, Math.PI * 2);
            cx.fill();
            cx.fillStyle = '#2C1810';
            cx.beginPath();
            cx.arc(cp, dy - 21, 11, Math.PI, 2 * Math.PI);
            cx.fill();
            cx.beginPath();
            cx.arc(cp, dy - 25, 4.5, 0, Math.PI * 2);
            cx.fill();
            cx.fillStyle = '#1a1a1a';
            cx.beginPath();
            cx.arc(cp - 3, dy - 19, 1.5, 0, Math.PI * 2);
            cx.fill();
            cx.beginPath();
            cx.arc(cp + 3, dy - 19, 1.5, 0, Math.PI * 2);
            cx.fill();
        }

        cx.fillStyle = 'rgba(0,0,0,0.35)';
        cx.fillRect(0, 0, W, 26);
        cx.fillStyle = '#f0e6c5';
        cx.font = '13px sans-serif';
        cx.textAlign = 'left';
        cx.fillText('❤️ ' + (N - dLevel), 12, 18);
        cx.textAlign = 'right';
        cx.fillText('速度 ' + speed.toFixed(1), W - 12, 18);

        if (state === 'gameover') {
            cx.fillStyle = 'rgba(0,0,0,0.55)';
            cx.fillRect(0, 0, W, H);
            cx.textAlign = 'center';
            cx.fillStyle = '#E74C3C';
            cx.font = 'bold 32px sans-serif';
            cx.fillText('😵 夹到脚了！', W / 2, H / 2 - 20);
            cx.fillStyle = '#f0e6c5';
            cx.font = '17px sans-serif';
            cx.fillText('得分: ' + score + ' | 第 ' + level + ' 关', W / 2, H / 2 + 20);
        } else if (state === 'victory') {
            cx.fillStyle = 'rgba(0,0,0,0.55)';
            cx.fillRect(0, 0, W, H);
            cx.textAlign = 'center';
            cx.fillStyle = '#F1C40F';
            cx.font = 'bold 32px sans-serif';
            cx.fillText('🎉 全部通过！', W / 2, H / 2 - 20);
            cx.fillStyle = '#f0e6c5';
            cx.font = '17px sans-serif';
            cx.fillText('得分: ' + score + ' | 下一关速度 ' + Math.min(3, speed + 0.25).toFixed(1), W / 2, H / 2 + 20);
        }
    }

    function loop() {
        frame++;
        dy += (targetY - dy) * 0.13;
        if (Math.abs(dy - targetY) < 0.3) dy = targetY;
        draw();
    }

    function handleClick() {
        if (state === 'gameover') { resetGame(); return; }
        if (state === 'victory') {
            level++;
            speed = Math.min(3, 1 + (level - 1) * 0.25);
            levelEl.textContent = level;
            dLevel = -1;
            targetY = H - 60;
            dy = H - 60;
            state = 'playing';
            return;
        }
        var next = dLevel + 1;
        if (next >= N) {
            dLevel = N;
            targetY = 20;
            score += 20;
            scoreEl.textContent = score;
            state = 'victory';
            return;
        }
        if (isOpen(next)) {
            dLevel = next;
            targetY = (next === N - 1) ? 40 : (pY[next] + pY[next + 1]) / 2;
            score += 10;
            scoreEl.textContent = score;
        } else {
            state = 'gameover';
        }
    }

    function resetGame() {
        score = 0;
        level = 1;
        speed = 1;
        dLevel = -1;
        targetY = H - 60;
        dy = H - 60;
        state = 'playing';
        scoreEl.textContent = '0';
        levelEl.textContent = '1';
        resetPoles();
    }

    // --- 音频控制 ---
    var audio = document.getElementById('bambooMusic');
    var musicBtn = document.getElementById('musicToggle');
    var volumeSlider = document.getElementById('musicVolume');
    var volumeLabel = document.getElementById('volumeLabel');
    var musicStarted = false;

    function startMusic() {
        if (!musicStarted && audio) {
            audio.volume = 0.5;
            audio.play().then(function() {
                musicStarted = true;
                if (musicBtn) { musicBtn.classList.add('playing'); musicBtn.textContent = '🎵 暂停'; }
            }).catch(function() {});
        }
    }

    function stopMusic() {
        if (audio) {
            audio.pause();
            musicStarted = false;
            if (musicBtn) { musicBtn.classList.remove('playing'); musicBtn.textContent = '🎵 音乐'; }
        }
    }

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play().then(function() {
                    musicBtn.classList.add('playing');
                    musicBtn.textContent = '🎵 暂停';
                }).catch(function() {});
            } else {
                audio.pause();
                musicBtn.classList.remove('playing');
                musicBtn.textContent = '🎵 音乐';
            }
        });
    }

    if (volumeSlider && audio) {
        volumeSlider.addEventListener('input', function() {
            audio.volume = parseFloat(this.value);
            if (volumeLabel) volumeLabel.textContent = Math.round(this.value * 100) + '%';
        });
    }

    // --- 排行榜 ---
    var rankInput = document.getElementById('rankInput');
    var rankName = document.getElementById('rankName');
    var rankSaveBtn = document.getElementById('rankSaveBtn');
    var rankList = document.getElementById('rankList');
    var rankEmpty = document.getElementById('rankEmpty');
    var rankBody = document.getElementById('rankBody');
    var rankToggle = document.getElementById('rankToggle');

    function getRankings() {
        try { return JSON.parse(localStorage.getItem('bambooRank') || '[]'); } catch(e) { return []; }
    }

    function saveRankings(data) {
        localStorage.setItem('bambooRank', JSON.stringify(data));
    }

    function isTopScore(sc, data) {
        if (data.length < 10) return true;
        return sc > data[data.length - 1].score;
    }

    function renderRank() {
        var data = getRankings();
        if (rankEmpty) rankEmpty.style.display = data.length ? 'none' : 'block';
        if (!rankList) return;
        rankList.innerHTML = '';
        var medals = ['🥇', '🥈', '🥉'];
        for (var i = 0; i < data.length && i < 10; i++) {
            var r = data[i];
            var tr = document.createElement('tr');
            var numHtml = i < 3 ? '<span class="rank-medal">' + medals[i] + '</span>' : '<span class="rank-num">' + (i + 1) + '</span>';
            tr.innerHTML = '<td>' + numHtml + '</td><td class="rank-name">' + escHtml(r.name) + '</td><td class="rank-score">' + r.score + '</td><td class="rank-level">' + r.level + '</td>';
            rankList.appendChild(tr);
        }
    }

    function escHtml(s) { return (s + '').replace(/[&<>]/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }

    function showRankInput() {
        if (!rankInput) return;
        rankInput.style.display = 'block';
        if (rankName) { rankName.value = ''; rankName.focus(); }
    }

    function hideRankInput() {
        if (rankInput) rankInput.style.display = 'none';
    }

    function saveRankScore() {
        var name = rankName ? (rankName.value.trim() || '匿名') : '匿名';
        var data = getRankings();
        // Check if same name already exists — keep the best score
        var existing = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name === name) { existing = data[i]; break; }
        }
        if (existing) {
            if (score > existing.score) {
                // New high score — replace
                existing.score = score;
                existing.level = level;
                existing.date = new Date().toLocaleDateString();
            } else {
                // Lower than existing — don't save
                hideRankInput();
                renderRank();
                return;
            }
        } else {
            data.push({ name: name, score: score, level: level, date: new Date().toLocaleDateString() });
        }
        data.sort(function(a, b) { return b.score - a.score; });
        if (data.length > 10) data = data.slice(0, 10);
        saveRankings(data);
        hideRankInput();
        renderRank();
    }

    if (rankSaveBtn) rankSaveBtn.addEventListener('click', saveRankScore);
    if (rankName) rankName.addEventListener('keydown', function(e) { if (e.key === 'Enter') saveRankScore(); });
    if (rankToggle) rankToggle.addEventListener('click', function() {
        if (rankBody) rankBody.classList.toggle('hidden');
        var arrow = rankToggle.querySelector('.rank-arrow');
        if (arrow) arrow.classList.toggle('collapsed');
    });

    // Hook into game state changes for rank prompt
    var origHandleClick = handleClick;
    handleClick = function() {
        // Auto-save before resetting (player clicked to continue without saving)
        var wasGameover = (state === 'gameover' || state === 'victory');
        var prevScore = score;
        origHandleClick();
        if (state === 'gameover') { showRankInput(); stopMusic(); }
        if (state === 'victory') showRankInput();
        // If player clicked to restart while input was showing, auto-save
        if (wasGameover && (state === 'playing' || state === 'gameover')) {
            if (rankInput && rankInput.style.display === 'block') {
                autoSaveScore(prevScore);
            }
        }
    };

    function autoSaveScore(s) {
        var data = getRankings();
        var name = rankName ? (rankName.value.trim() || '匿名') : '匿名';
        var existing = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name === name) { existing = data[i]; break; }
        }
        if (existing) {
            if (s > existing.score) { existing.score = s; existing.level = level; existing.date = new Date().toLocaleDateString(); }
        } else {
            data.push({ name: name, score: s, level: level, date: new Date().toLocaleDateString() });
        }
        data.sort(function(a, b) { return b.score - a.score; });
        if (data.length > 10) data = data.slice(0, 10);
        saveRankings(data);
        hideRankInput();
        renderRank();
    }

    // Hook reset — no longer hides the input (auto-save handles it)

    renderRank();

    // First click on canvas also starts music
    var origClick = handleClick;
    handleClick = function() {
        startMusic();
        origClick();
    };

    cv.addEventListener('click', handleClick);
    cv.addEventListener('touchstart', function(e) { e.preventDefault(); handleClick(); });
    restartBtn.addEventListener('click', resetGame);
    setInterval(loop, 1000 / 30);
})();
