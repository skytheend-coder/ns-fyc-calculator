// api/gemini.js - 最終暴力校準版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  // 定義三種 Google 認可但經常變動的路徑格式
  const urls = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/gemini-1.5-flash:generateContent?key=${API_KEY}`
  ];

  for (const url of urls) {
    try {
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
      
      // 如果這條路徑通了且沒報錯，立刻回傳結果
      if (!data.error) {
        return res.status(200).json(data);
      }
      
      // 如果報錯不是 "Not Found"，代表路徑對了但內容有問題，也回傳讓前端知道
      if (!data.error.message.includes("not found")) {
        return res.status(200).json({ error: data.error.message });
      }
      
      // 繼續嘗試下一個網址...
    } catch (e) {
      continue; 
    }
  }

  res.status(200).json({ error: "嘗試了所有 API 路徑皆失敗，請確認 API Key 是否有效或 Google 伺服器狀態。" });
}