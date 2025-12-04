const geminiInput = document.getElementById("geminiKey");
const openaiInput = document.getElementById("openaiKey");
const btn = document.getElementById("save");
const msg = document.getElementById("msg");
const aiStatus = document.getElementById("aiStatus");

// Chrome AI の利用可否をチェック
async function checkChromeAI() {
  try {
    if (typeof self.ai === "undefined" || !self.ai.languageModel) {
      return { available: false, reason: "このブラウザはChrome AIに対応していません" };
    }
    const capabilities = await self.ai.languageModel.capabilities();
    if (capabilities.available === "readily") {
      return { available: true };
    } else if (capabilities.available === "after-download") {
      return { available: false, reason: "Chrome AIモデルのダウンロードが必要です" };
    } else {
      return { available: false, reason: "Chrome AIが利用できません" };
    }
  } catch (e) {
    return { available: false, reason: "Chrome AIの確認中にエラーが発生しました" };
  }
}

// AI状態を表示
async function updateAIStatus() {
  const result = await checkChromeAI();
  const { geminiApiKey, openaiApiKey } = await chrome.storage.sync.get([
    "geminiApiKey",
    "openaiApiKey"
  ]);

  let statusText = "";
  let statusClass = "status-ng";

  if (result.available) {
    statusText = "Chrome AI 利用可能 - APIキーなしで動作します";
    statusClass = "status-ok";
  } else if (geminiApiKey) {
    statusText = "Gemini API を使用します";
    statusClass = "status-ok";
  } else if (openaiApiKey) {
    statusText = "OpenAI API を使用します";
    statusClass = "status-ok";
  } else {
    statusText = "APIキーが未設定です。Gemini APIキーの設定を推奨します（無料）";
  }

  aiStatus.className = `status-box ${statusClass}`;
  aiStatus.textContent = statusText;
}

// 初期化
updateAIStatus();

chrome.storage.sync.get(["geminiApiKey", "openaiApiKey"], (data) => {
  if (data.geminiApiKey) geminiInput.value = data.geminiApiKey;
  if (data.openaiApiKey) openaiInput.value = data.openaiApiKey;
});

btn.addEventListener("click", () => {
  const geminiKey = geminiInput.value.trim();
  const openaiKey = openaiInput.value.trim();

  chrome.storage.sync.set(
    { geminiApiKey: geminiKey, openaiApiKey: openaiKey },
    () => {
      msg.textContent = "保存しました。";
      updateAIStatus();
      setTimeout(() => (msg.textContent = ""), 2000);
    }
  );
});
