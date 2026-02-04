// api/gemini.js - 核心辨識引擎 (去中文、防錯位優化版)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 自動尋找目前最穩定的模型
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
              你現在是南山人壽建議書專家。請將截圖中的表格轉換為 JSON。
              
              【嚴格抓取規則】
              1. code (代碼)：
                 - 請忽略所有中文，只擷取險種名稱最後面的英數代碼。
                 - 範例：『30HPHI2 溢心守護』應擷取為 『HPHI2』。
                 - 範例：『20STCB 終身健康』應擷取為 『STCB』。
                 - 範例：『SBBR 骨折手術』應擷取為 『SBBR』。
              2. term (年期)：擷取『繳費年期』欄位數字。範例：30, 20, 1。
              3. premium (保費)：擷取『折扣後保費』欄位數字，移除逗號。
              
              【禁止行為】嚴禁擷取『本人』、『計劃』或中文名稱作為代碼。
              【格式要求】僅回傳純 JSON 陣列，例如: [{"code":"HPHI2","term":"30","premium":12916}]
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