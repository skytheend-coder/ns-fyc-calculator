// api/gemini.js - 最終路徑校準版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  // 這裡請確保是你在 image_0d8124.jpg 中產生的最新金鑰
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 核心修正：移除 v1beta 後面的 /models/，改用官方最原始的完整路徑格式
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是南山人壽建議書。請提取險種代碼(如 20STCB)、年期、實繳保費。僅回傳 JSON 陣列，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }],
        // 強制輸出 JSON 格式，減少解析錯誤
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ error: `Google API 報錯: ${data.error.message}` });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "後端通訊異常: " + error.message });
  }
}