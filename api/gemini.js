// api/gemini.js - 自動模型匹配畢業版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const { imageData } = req.body;
  const API_KEY = "AIzaSyCjUZeGE8MbmNyaIM6zZveoj3b1SB6ExDs"; 

  try {
    // 步驟 1：先抓取目前 API Key 權限下所有可用的模型列表
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (!listData.models) {
      return res.status(200).json({ error: "無法獲取模型清單，請確認 API Key 是否正確設定。" });
    }

    // 步驟 2：從清單中找出最新、支援圖片生成的 Flash 模型
    // 我們優先找 gemini-2.0-flash，找不到再找 gemini-1.5-flash-latest
    const availableModels = listData.models.map(m => m.name.split('/').pop());
    const targetModel = availableModels.find(m => m.includes('2.0-flash')) || 
                        availableModels.find(m => m.includes('1.5-flash')) || 
                        availableModels[0];

    // 步驟 3：使用偵測到的正確模型名稱進行呼叫
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "提取南山人壽建議書 JSON：[{\"code\":\"代碼\",\"term\":\"年期\",\"premium\":保費}]" },
            { inline_data: { mime_type: "image/jpeg", data: imageData } }
          ]
        }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(200).json({ error: `Google API (${targetModel}): ${data.error.message}` });

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({ error: "系統自動校準失敗: " + error.message });
  }
}