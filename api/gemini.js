// api/gemini.js - 自動模型偵測畢業版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 步驟 1: 先嘗試最標準的 v1beta 路徑
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const url = `${baseUrl}?key=${API_KEY}`;
    
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
    
    // 步驟 2: 如果 v1beta 噴錯找不到模型，自動嘗試切換到 v1
    if (data.error && data.error.message.includes("not found")) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const retryResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "提取建議書數據 JSON 陣列。" },
              { inline_data: { mime_type: "image/jpeg", data: imageData } }
            ]
          }]
        })
      });
      const retryData = await retryResponse.json();
      return res.status(200).json(retryData);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "後端通訊最終防線崩潰: " + error.message });
  }
}