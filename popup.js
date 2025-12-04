const statusEl = document.getElementById("status");
const titlesEl = document.getElementById("titles");
const outlinesEl = document.getElementById("outlines");
const selectionHint = document.getElementById("selectionHint");
const generateBtn = document.getElementById("generateBtn");
const promptArea = document.getElementById("promptArea");
const promptText = document.getElementById("promptText");
const copyPromptBtn = document.getElementById("copyPromptBtn");

// 選択状態
let selectedTitle = null;
let selectedOutline = null;

// ポップアップが開いたときにstorageから結果を読み取る
chrome.storage.local.get("lastResult", ({ lastResult }) => {
  if (lastResult) {
    handleResult(lastResult);
  }
});

// リアルタイムでメッセージを受信（ポップアップが開いている場合）
chrome.runtime.onMessage.addListener((msg) => {
  handleResult(msg);
});

// 結果を処理
function handleResult(msg) {
  if (msg.type === "DRAFT_READY") {
    renderDraft(msg.payload);
  } else if (msg.type === "LOADING") {
    statusEl.textContent = msg.message;
    titlesEl.innerHTML = "";
    outlinesEl.innerHTML = "";
    hidePromptArea();
  } else if (msg.type === "ERROR") {
    statusEl.textContent = msg.message;
  }
}

function renderDraft(draft) {
  statusEl.textContent = "タイトルと見出しを選択してください";
  selectionHint.style.display = "block";

  // タイトル案
  titlesEl.innerHTML = "<h2>タイトル案（1つ選択）</h2>";
  draft.titles.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "title";
    div.textContent = `【${i + 1}】${t}`;
    div.dataset.title = t;

    div.addEventListener("click", () => {
      // 他の選択を解除
      titlesEl.querySelectorAll(".title").forEach(el => el.classList.remove("selected"));
      // 選択状態にする
      div.classList.add("selected");
      selectedTitle = t;
      updateGenerateButton();
    });

    titlesEl.appendChild(div);
  });

  // 見出し案
  outlinesEl.innerHTML = "<h2>見出し案（1つ選択）</h2>";
  draft.outlines.forEach((outline, i) => {
    const div = document.createElement("div");
    div.className = "outline";
    div.dataset.outlineIndex = i;

    // パターン番号
    const label = document.createElement("div");
    label.className = "outline-label";
    label.textContent = `パターン${i + 1}`;
    div.appendChild(label);

    // 見出しリスト
    outline.forEach(h => {
      const item = document.createElement("div");
      item.className = "outline-item";
      item.textContent = `・${h}`;
      div.appendChild(item);
    });

    div.addEventListener("click", () => {
      // 他の選択を解除
      outlinesEl.querySelectorAll(".outline").forEach(el => el.classList.remove("selected"));
      // 選択状態にする
      div.classList.add("selected");
      selectedOutline = outline;
      updateGenerateButton();
    });

    outlinesEl.appendChild(div);
  });
}

// 生成ボタンの表示を更新
function updateGenerateButton() {
  if (selectedTitle && selectedOutline) {
    generateBtn.classList.add("show");
    selectionHint.style.display = "none";
  } else {
    generateBtn.classList.remove("show");
  }
}

// プロンプト生成ボタンのクリック
generateBtn.addEventListener("click", () => {
  const prompt = generatePrompt(selectedTitle, selectedOutline);
  promptText.textContent = prompt;
  promptArea.classList.add("show");
});

// プロンプトをコピー
copyPromptBtn.addEventListener("click", () => {
  const prompt = promptText.textContent;
  navigator.clipboard.writeText(prompt).then(() => {
    copyPromptBtn.textContent = "コピーしました！";
    setTimeout(() => {
      copyPromptBtn.textContent = "プロンプトをコピー";
    }, 2000);
  });
});

// プロンプトエリアを非表示
function hidePromptArea() {
  promptArea.classList.remove("show");
  generateBtn.classList.remove("show");
  selectedTitle = null;
  selectedOutline = null;
}

// プロンプトを生成（YAML形式）
function generatePrompt(title, outlines) {
  const outlineYaml = outlines.map(h => `    - "${h}"`).join("\n");

  return `task: note記事の執筆

article:
  title: "${title}"
  headings:
${outlineYaml}

instructions:
  word_count: 各見出しごとに300〜500文字程度
  tone: 読者に語りかけるような親しみやすい文体
  content:
    - 具体例やエピソードを交えて分かりやすく説明する
    - 最後にまとめや読者へのメッセージを入れる
  format: note記事として読みやすい形式で出力`;
}
