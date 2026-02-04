// api/gemini.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('只允許 POST 請求');
  
  const { imageData } = req.body;
  // 直接寫死 API KEY，Vercel 後端請求不會被別人看到
  const API_KEY = "AIzaSyDg_iNtdfK0wplOxG6OoPXbOvaoBCcF_O0"; 
  
  try {
    // 這是 Google 在 Node.js 環境最穩定的路徑格式
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "這是一張南山人壽建議書截圖。請以 JSON 陣列格式回傳：險種代碼(code)、年期(term)、折扣後保費(premium)。範例：[{\"code\":\"20STCB\",\"term\":\"20\",\"premium\":5220}]。僅回傳 JSON。" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}