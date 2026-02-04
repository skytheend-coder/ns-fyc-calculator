// api/gemini.js - Gemini 3 Flash 旗艦對接版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  // 使用你在 image_0d8124.jpg 中設定好帳單地址的 Key
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 關鍵修正：切換至最新的 Gemini 3 Flash 路徑
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是南山人壽建議書截圖。請提取表格內容，包含險種代碼、年期、保費。僅回傳 JSON 陣列，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ error: `Google API (${data.error.code}): ${data.error.message}` });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "伺服器通訊異常: " + error.message });
  }
}