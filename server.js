const express = require('express');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 3000;
const CANCRI_KEY = process.env.CANCRI_KEY;
const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const GATEWAY = 'https://diusqgphvybnzazgopor.supabase.co/functions/v1/api-gateway/v1/chat/completions';

async function callCancri(model, prompt) {
  if (!CANCRI_KEY) return null;
  try {
    const resp = await fetch(GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CANCRI_KEY}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2500
      })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.log(`Cancri ${model} 状态 ${resp.status}:`, txt.substring(0, 150));
      return null;
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.log(`Cancri ${model} 失败:`, e.message); return null; }
}

async function callDeepSeek(prompt) {
  if (!DEEPSEEK_KEY) return null;
  try {
    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2500
      })
    });
    if (!resp.ok) { console.log('DeepSeek 状态', resp.status); return null; }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.log('DeepSeek 失败:', e.message); return null; }
}

async function callAI(prompt) {
  // Cancri → Claude Sonnet 优先
  const result = await callCancri('claude-sonnet-4-6', prompt);
  if (result) return result;

  // Cancri → DeepSeek 备用
  const result2 = await callCancri('deepseek-v4-pro', prompt);
  if (result2) return result2;

  // 直接 DeepSeek 兜底
  return await callDeepSeek(prompt);
}

app.post('/api/itinerary', async (req, res) => {
  const { days, from, interests, companions, budget } = req.body;

  const prompt = `你是广西旅游规划专家。请根据以下信息生成一份完整的"广西三月三"旅游行程单。

出行信息：
- 游玩天数：${days}天
- 出发地：${from || '未指定'}
- 兴趣偏好：${(interests || []).join('、') || '未指定'}
- 同行人员：${companions || '未指定'}
- 预算档次：${budget || '未指定'}

请按以下格式输出（用中文）：

## 📋 行程总览
出发地 → 目的地 | ${days}天${days > 3 ? '4' : '3'}晚 | 预算：${budget || '未定'}

## 📅 每日行程
### 第1天
**上午**：[活动]（地点）
**下午**：[活动]（地点）
**晚上**：[活动]（地点）

（第2天、第3天以此类推...）

## 🍜 推荐美食
- [美食名]：[简短说明]

## 🏨 住宿建议
- [档次]：[推荐区域]

## 💡 实用贴士
- [贴士1]
- [贴士2]

注意：行程要贴合三月三节庆特色（歌圩、抛绣球、五色饭、抢花炮等），每天的活动要合理分布，不要过于紧凑。`;

  const result = await callAI(prompt);
  if (result) {
    res.json({ ok: true, data: result });
  } else {
    res.json({ ok: false, msg: '所有 AI 都不可用，请稍后再试' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 服务已启动：http://localhost:${PORT}`);
});
