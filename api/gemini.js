// api/gemini.js - Node.js 專用純淨版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyDg_iNtdfK0wplOxG6OoPXbOvaoBCcF_O0"; 

  try {
    // 核心修正：移除 v1beta 後面多餘的 models 標籤，改用最原始的拼接方式
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是南山人壽建議書。請提取險種代碼(如 20STCB)、年期、折扣後保費。僅回傳 JSON 陣列，例如: [{\"code\": \"20STCB\", \"term\": \"20\", \"premium\": 5220}]。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // 如果 Google 返回模型找不到，這段邏輯會直接告訴我們正確路徑
    if (data.error) {
      return res.status(200).json({ 
        error: `Google 伺服器訊息: ${data.error.message}`,
        status: data.error.status 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "中繼站運算崩潰: " + error.message });
  }
}