// api/gemini.js - 核心辨識引擎 (去中文、嚴格格式化版)
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
              任務：將南山人壽建議書表格轉為 JSON 陣列。
              
              【嚴格抓取規則】
              1. code (代碼)：
                 - 請徹底忽略險種名稱中的中文。
                 - 僅擷取險種名稱最後端的英數組合。例如『30HPHI2』擷取為『HPHI2』，『SBBR』擷取為『SBBR』。
              2. term (年期)：擷取『繳費年期』欄位的純數字。
              3. premium (保費)：擷取『折扣後保費』欄位數字，並移除逗號。
              
              【禁止項目】絕不允許擷取『本人』、『1單位』等非代碼內容。
              【回傳要求】僅回傳純 JSON 陣列，不准包含任何 Markdown 標籤或解釋文字。
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
    res.status(200).json({ error: "辨識中斷，請重試" });
  }
}