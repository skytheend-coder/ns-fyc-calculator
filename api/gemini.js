// api/gemini.js - 官方標準穩定版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  // 請確保這裡貼的是你最新產生的金鑰
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  // 使用 Google 官方最標準的 v1beta 路徑
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是南山人壽建議書。請提取險種代碼(如 20STCB)、年期、實繳保費。僅回傳 JSON 陣列，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // 如果 Google 回傳錯誤，我們會直接看到具體的原因（例如金鑰無效或頻率限制）
    if (data.error) {
      return res.status(200).json({ error: `Google API 報錯: ${data.error.message}` });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "伺服器通訊異常: " + error.message });
  }
}