// api/gemini.js - 官方原始拼接版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyDg_iNtdfK0wplOxG6OoPXbOvaoBCcF_O0"; 

  try {
    // 最終路徑：v1beta 正式對應 flash 模型，移除 models/ 前綴試驗，改用標準 API 路徑
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是一張南山人壽建議書截圖。請分析表格，提取險種代碼(如 20STCB)、年期、實繳保費。僅回傳 JSON 陣列格式，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // 如果又是 "not found"，我們這次加入一個萬能偵錯機制
    if (data.error && data.error.message.includes("not found")) {
        // 自動嘗試第二種 Google 可能接受的路徑格式
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const retry = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "..." }, { inline_data: { mime_type: "image/jpeg", data: imageData } }] }] })
        });
        const retryData = await retry.json();
        return res.status(200).json(retryData);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "伺服器運算崩潰: " + error.message });
  }
}