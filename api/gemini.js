// api/gemini.js
export default async function handler(req, res) {
  // 增加 CORS 頭部設定，確保 Vercel 環境通暢
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: '僅支援 POST' });

  const { imageData } = req.body;
  const API_KEY = "AIzaSyDg_iNtdfK0wplOxG6OoPXbOvaoBCcF_O0"; // 你的金鑰

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是一張南山人壽建議書。請分析表格，提取險種代碼(如 20STCB)、年期、實繳保費。僅回傳 JSON 陣列格式，如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // 如果 Google 返回錯誤，直接轉發給前端，不要傳回空值
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "後端運算崩潰: " + error.message });
  }
}