const MENU_ID = "note-draft-generator";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "note記事案を作成",
    contexts: ["selection"]
  });
});

// 右クリックメニューが押されたとき
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;

  const selectedText = info.selectionText || "";
  if (!selectedText.trim()) return;

  // 生成中の状態を保存
  await saveResult({ type: "LOADING", message: "生成中..." });

  try {
    const draft = await generateDraft(selectedText);
    await saveResult({ type: "DRAFT_READY", payload: draft });
    // 生成完了時にポップアップウィンドウを自動で開く
    await openResultWindow();
  } catch (e) {
    await saveResult({ type: "ERROR", message: e.message || "生成エラー" });
    await openResultWindow();
  }
});

// 結果表示ウィンドウを開く
async function openResultWindow() {
  const popupURL = chrome.runtime.getURL("popup.html");
  await chrome.windows.create({
    url: popupURL,
    type: "popup",
    width: 400,
    height: 500
  });
}

// AI選択と生成（優先順位: Chrome AI → Gemini → OpenAI）
async function generateDraft(text) {
  // 1. Chrome AI を試す
  if (await checkChromeAI()) {
    return await generateWithChromeAI(text);
  }

  // 2. APIキーを取得
  const { geminiApiKey, openaiApiKey } = await chrome.storage.sync.get([
    "geminiApiKey",
    "openaiApiKey"
  ]);

  // 3. Gemini API を試す
  if (geminiApiKey) {
    return await generateWithGemini(geminiApiKey, text);
  }

  // 4. OpenAI API を試す
  if (openaiApiKey) {
    return await generateWithOpenAI(openaiApiKey, text);
  }

  // 5. どれも使えない
  throw new Error("APIキーが設定されていません。設定画面でGeminiまたはOpenAIのAPIキーを入力してください。");
}

// 結果をstorageに保存（ポップアップが閉じていても受け取れるように）
async function saveResult(data) {
  await chrome.storage.local.set({ lastResult: { ...data, timestamp: Date.now() } });
  chrome.runtime.sendMessage(data, () => {
    void chrome.runtime.lastError;
  });
}

// ========== Chrome AI (Prompt API) ==========

async function checkChromeAI() {
  try {
    if (typeof self.ai === "undefined" || !self.ai.languageModel) {
      return false;
    }
    const capabilities = await self.ai.languageModel.capabilities();
    return capabilities.available === "readily";
  } catch (e) {
    return false;
  }
}

async function generateWithChromeAI(text) {
  const session = await self.ai.languageModel.create({
    systemPrompt: getSystemPrompt()
  });
  const result = await session.prompt(getUserPrompt(text));
  session.destroy();
  return parseResult(result);
}

// ========== Gemini API ==========

async function generateWithGemini(apiKey, text) {
  const prompt = `${getSystemPrompt()}\n\n${getUserPrompt(text)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return parseResult(content);
}

// ========== OpenAI API ==========

async function generateWithOpenAI(apiKey, text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: getUserPrompt(text) }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return parseResult(content);
}

// ========== 共通 ==========

function getSystemPrompt() {
  return `あなたはnote.comで記事を書く日本語ライターです。
与えられたテキストをもとに、noteの記事の下書き案をJSONで出力してください。

出力形式（必ずこのJSONだけを返すこと）:
{
  "titles": ["タイトル案1", "タイトル案2", "タイトル案3"],
  "outlines": [
    ["見出し1-1", "見出し1-2", "見出し1-3"],
    ["見出し2-1", "見出し2-2", "見出し2-3"],
    ["見出し3-1", "見出し3-2", "見出し3-3"]
  ]
}`;
}

function getUserPrompt(text) {
  return `このテキストを元にnote記事のタイトル案と見出し構成案を作ってください。

---
${text}
---`;
}

function parseResult(content) {
  let jsonStr = content;
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    jsonStr = match[1];
  }
  return JSON.parse(jsonStr.trim());
}
