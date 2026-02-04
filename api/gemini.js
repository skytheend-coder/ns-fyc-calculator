// api/gemini.js - 南山前豐區 AI 辨識引擎優化版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 自動獲取最新模型，優先選擇 2.0-flash 或 1.5-flash
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
              【任務】將南山人壽建議書「規劃險種內容」表格轉換為 JSON 數據。
              【提取規則】
              1. code: 險種代碼 (如 30HPH12, 20STCB, SBBR, HCAR2)。
              2. term: 提取「繳費年期」欄位的純數字 (如 30, 20, 1)。
              3. premium: 提取「折扣後保費」欄位的數字，移除逗號。
              【輸出規範】僅回傳純 JSON 陣列，不准包含任何解釋文字或 Markdown 標籤。
              【範例格式】[{"code":"20STCB","term":"20","premium":5220}]
            `},
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }],
        generationConfig: { 
          response_mime_type: "application/json", // 強制輸出為 JSON 格式
          temperature: 0.1 // 降低隨機性以提高穩定度
        }
      })
    });

    const data = await response.json();

    // 檢查 Google API 錯誤
    if (data.error) {
      return res.status(200).json({ error: data.error.message });
    }

    // 直接回傳最乾淨的資料結構
    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "辨識引擎暫時中斷: " + error.message });
  }
}