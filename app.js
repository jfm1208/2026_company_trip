(() => {
  const SCRIPT_URL = "";
  const form = document.querySelector("#registration-form");
  const button = document.querySelector("#submit-button");
  const status = document.querySelector("#form-status");
  const requestIdInput = document.querySelector("#request-id");

  let pendingRequestId = "";

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  window.addEventListener("message", (event) => {
    const result = event.data;
    if (!result || result.type !== "registration-result" || result.requestId !== pendingRequestId) return;

    pendingRequestId = "";
    button.disabled = false;
    button.querySelector("span:first-child").textContent = "送出報名";

    if (result.ok) {
      form.reset();
      showStatus("報名成功！期待和你一起出發。");
    } else {
      showStatus(result.message || "報名未完成，請稍後再試。", true);
    }
  });

  form.addEventListener("submit", (event) => {
    if (!SCRIPT_URL) {
      event.preventDefault();
      showStatus("報名服務尚未設定，請稍後再試。", true);
      return;
    }

    event.preventDefault();
    if (!form.reportValidity() || pendingRequestId) return;

    pendingRequestId = window.crypto.randomUUID();
    requestIdInput.value = pendingRequestId;

    form.action = SCRIPT_URL;
    button.disabled = true;
    button.querySelector("span:first-child").textContent = "送出中…";
    showStatus("正在送出報名資料…");
    form.submit();

    window.setTimeout(() => {
      if (!pendingRequestId) return;
      pendingRequestId = "";
      button.disabled = false;
      button.querySelector("span:first-child").textContent = "送出報名";
      showStatus("目前無法確認送出結果，請稍後再試或聯絡活動窗口。", true);
    }, 20000);
  });
})();
