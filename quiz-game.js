// 三月三知识答题
(function(){
    var box = document.getElementById('quizBox');
    var qEl = document.getElementById('quizQuestion');
    var optsEl = document.getElementById('quizOptions');
    var fbEl = document.getElementById('quizFeedback');
    var curEl = document.getElementById('quizCurrent');
    var corrEl = document.getElementById('quizCorrect');
    var wallpaper = document.getElementById('quizWallpaper');

    if (!box || !qEl || !optsEl) return;

    var questions = [
        { q: '三月三是哪个民族的传统节日？', opts: ['苗族', '壮族', '彝族', '侗族'], ans: 1 },
        { q: '"歌圩"是三月三的什么活动？', opts: ['集市贸易', '祭祀仪式', '对歌集会', '体育比赛'], ans: 2 },
        { q: '五色糯米饭用什么来染色？', opts: ['人工色素', '天然植物', '水果汁', '食用香精'], ans: 1 },
        { q: '歌仙刘三姐是哪个朝代的传说人物？', opts: ['汉代', '唐代', '宋代', '明代'], ans: 1 },
        { q: '抛绣球在三月三中象征什么？', opts: ['祈福丰收', '传情择偶', '驱邪避灾', '纪念祖先'], ans: 1 },
    ];

    var idx = 0, correct = 0, locked = false;

    function showQuestion() {
        if (idx >= questions.length) { finish(); return; }
        var q = questions[idx];
        qEl.textContent = (idx + 1) + '. ' + q.q;
        curEl.textContent = idx + 1;
        optsEl.innerHTML = '';
        fbEl.textContent = '';
        fbEl.className = 'quiz-feedback';
        locked = false;
        for (var i = 0; i < q.opts.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'quiz-opt';
            btn.textContent = q.opts[i];
            btn.setAttribute('data-i', i);
            btn.addEventListener('click', onPick);
            optsEl.appendChild(btn);
        }
    }

    function onPick() {
        if (locked) return;
        locked = true;
        var pick = parseInt(this.getAttribute('data-i'));
        var q = questions[idx];
        var btns = optsEl.querySelectorAll('.quiz-opt');
        for (var i = 0; i < btns.length; i++) btns[i].disabled = true;

        if (pick === q.ans) {
            this.classList.add('correct');
            fbEl.textContent = '✅ 正确！';
            fbEl.className = 'quiz-feedback correct';
            correct++;
            corrEl.textContent = correct;
        } else {
            this.classList.add('wrong');
            btns[q.ans].classList.add('correct');
            fbEl.textContent = '❌ 答案是：' + q.opts[q.ans];
            fbEl.className = 'quiz-feedback wrong';
        }

        setTimeout(function() {
            idx++;
            showQuestion();
        }, 1200);
    }

    function finish() {
        qEl.textContent = correct === questions.length ? '🎉 全部答对！壮锦壁纸已解锁！' : '📖 答对 ' + correct + '/' + questions.length + ' 题，再来一次吧！';
        optsEl.innerHTML = '';
        fbEl.textContent = '';

        if (correct === questions.length) {
            if (wallpaper) wallpaper.classList.add('unlocked');
        }

        var restart = document.createElement('button');
        restart.className = 'quiz-restart';
        restart.textContent = '🔄 重新答题';
        restart.addEventListener('click', function() {
            if (wallpaper) wallpaper.classList.remove('unlocked');
            idx = 0; correct = 0; corrEl.textContent = '0';
            showQuestion();
        });
        optsEl.appendChild(restart);
    }

    showQuestion();
})();
