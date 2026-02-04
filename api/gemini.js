// api/gemini.js - 最終穩定版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyDg_iNtdfK0wplOxG6OoPXbOvaoBCcF_O0"; 

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是南山建議書。提取險種代碼(如 20STCB)、年期、折扣後保費。僅回傳 JSON 陣列，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    
    // 如果 Google 有報錯，我們回傳一個明確的字串而非物件
    if (data.error) {
      return res.status(200).json({ error: String(data.error.message) });
    }

    // 正常情況下回傳整個結果
    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "伺服器異常: " + error.message });
  }
}