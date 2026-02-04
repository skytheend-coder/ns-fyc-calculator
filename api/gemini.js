// api/gemini.js - 2.0 Flash 升級版
export default async function handler(req, res) {
  // ... 前面的 CORS 設定保持不變 ...
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 關鍵修正：將模型名稱改為目前 AI Studio 支援的 2.0 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是一張南山人壽建議書截圖。請提取表格中的險種代碼、年期、保費。僅回傳 JSON 陣列。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // 如果 2.0-flash-exp 也報錯，代表你的帳號可能已經自動升級到更穩定的 2.0-flash
      return res.status(200).json({ error: `Google API (${data.error.code}): ${data.error.message}` });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "後端通訊異常: " + error.message });
  }
}