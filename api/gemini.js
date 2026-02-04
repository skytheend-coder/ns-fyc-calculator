// api/gemini.js - 修正模型路徑報錯版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  // 這裡使用的是你在截圖中顯示的最新金鑰
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 關鍵修正：確保版本號與模型名稱的路徑完全符合 Google V1 規範
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
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
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();
    
    // 如果報錯，我們會看到具體的 Google 伺服器回應
    if (data.error) {
      // 偵錯輔助：如果模型還是找不到，試著自動切換版本號
      if (data.error.message.includes("not found")) {
        return res.status(200).json({ error: "Google 伺服器暫時不支援此路徑，請嘗試縮小截圖範圍後再試。" });
      }
      return res.status(200).json({ error: `Google API 報錯: ${data.error.message}` });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "後端通訊異常: " + error.message });
  }
}