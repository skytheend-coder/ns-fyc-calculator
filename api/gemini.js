// api/gemini.js - 南山建議書表格「防呆」優化版
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
              任務：將南山人壽建議書表格精準轉為 JSON 陣列。
              
              【嚴格抓取規則】
              1. code (代碼)：請忽略險種名稱中的中文，只提取末尾的英數組合。
                 - 例如：『南山人壽溢心守護2醫療保險 30HPHI2』提取『HPHI2』。
                 - 例如：『南山人壽意外骨折及特定手術... SBBR』提取『SBBR』。
                 - ⚠️ 絕不可提取『本人』、『1單位』、『36萬元』作為代碼。
              
              2. term (年期)：
                 - 請看『繳費年期』欄位。
                 - 僅提取純數字。例如 30, 20, 1。
              
              3. premium (保費)：
                 - 請看『折扣後保費』欄位。
                 - ⚠️ 這是圖片中最右側的金額數字。
                 - 僅提取純數字，移除逗號。例如 12916, 17352, 5220。
              
              【輸出格式】僅回傳純 JSON 陣列，不准有任何 Markdown 標籤或文字。
              範例：[{"code":"HPHI2","term":"30","premium":12916}]
            `},
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1 // 強制嚴謹模式，減少亂猜
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "辨識引擎邏輯深度校準中" });
  }
}