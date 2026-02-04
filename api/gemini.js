// api/gemini.js - 南山建議書表格專用版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    const availableModels = listData.models.map(m => m.name.split('/').pop());
    const targetModel = availableModels.find(m => m.includes('2.0-flash')) || 
                        availableModels.find(m => m.includes('1.5-flash')) || 
                        availableModels[0];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `
              你現在是南山人壽建議書解析專家。
              請掃描圖片中的【規劃險種內容】表格，每一列都要提取：
              1. code (險種代碼)：提取險種名稱末端的代碼，例如 30HPH12, 30FLTC, 20STCB, SBBR, PAMR, DHI, 1HIR, 1TED, HCAR2, 1HS。
              2. term (年期)：精準提取【繳費年期】欄位的數字。例如主約填 30 或 20，附約通常填 1。
              3. premium (保費)：提取【折扣後保費】欄位的數字。例如 12916, 5220, 2200。
              
              僅回傳 JSON 陣列，嚴格禁止其他文字：
              [{"code":"30HPH12","term":"30","premium":12916},{"code":"SBBR","term":"1","premium":2200}]
            `},
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1 
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "解析邏輯優化中" });
  }
}