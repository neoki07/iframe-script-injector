const addElementToIframes = () => {
  // メインページにも要素を追加
  const mainElement = document.createElement("div");
  mainElement.style.cssText = `
    position: fixed;
    top: 8px;
    right: 8px;
    background: #F8FAFC;
    color: #475569;
    padding: 3px 8px 3px 3px;
    border-radius: 9999px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: -0.01em;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 
      0 0 0 1px rgba(148, 163, 184, 0.1),
      0 1px 2px rgba(15, 23, 42, 0.05);
    z-index: 9999;
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transform: translateY(0) scale(1);
    opacity: 1;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  // ステータスドットの追加
  const statusDot = document.createElement("div");
  statusDot.style.cssText = `
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 0 0 1px rgba(148, 163, 184, 0.1),
      0 1px 2px rgba(15, 23, 42, 0.05);
  `;

  // チェックマークSVGの追加
  const checkIcon = document.createElement("div");
  checkIcon.style.cssText = `
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(14, 165, 233, 0.15);
  `;

  checkIcon.innerHTML = `
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 2.5L3.5 5.5L1.5 3.5" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  statusDot.appendChild(checkIcon);

  const textSpan = document.createElement("span");
  textSpan.textContent = "Script Injected";
  textSpan.style.cssText = `
    color: #334155;
    line-height: 1;
  `;

  mainElement.appendChild(statusDot);
  mainElement.appendChild(textSpan);

  const addStatusToDocument = (doc) => {
    if (!doc.querySelector('div[style*="Script Injected"]')) {
      const newElement = mainElement.cloneNode(true);
      newElement.style.transform = "translateY(-8px) scale(0.96)";
      newElement.style.opacity = "0";
      doc.body.appendChild(newElement);

      requestAnimationFrame(() => {
        newElement.style.transform = "translateY(0) scale(1)";
        newElement.style.opacity = "1";
      });
    }
  };

  const processIframe = (iframe) => {
    const handleIframeContent = (iframeDoc) => {
      if (!iframeDoc) return;

      // DOMContentLoadedイベントが発火した時点でバッジを表示
      const addBadgeOnLoad = () => {
        addStatusToDocument(iframeDoc);

        // iframe内の変更を監視
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLIFrameElement) {
                processIframe(node);
              }
            });
          });
        });

        observer.observe(iframeDoc.documentElement, {
          childList: true,
          subtree: true,
        });
      };

      // 子iframeを処理
      const processChildIframes = () => {
        const childIframes = iframeDoc.getElementsByTagName("iframe");
        Array.from(childIframes).forEach(processIframe);
      };

      if (iframeDoc.readyState === "loading") {
        iframeDoc.addEventListener("DOMContentLoaded", () => {
          addBadgeOnLoad();
          // DOMContentLoaded後に子iframeを処理
          processChildIframes();
        });
      } else {
        addBadgeOnLoad();
        processChildIframes();
      }
    };

    // 既存のコンテンツを処理
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      handleIframeContent(iframeDoc);
    } catch (error) {
      console.warn("Cannot access iframe content:", error);
    }

    // 新しいコンテンツのロードを監視
    iframe.addEventListener("load", function () {
      try {
        const iframeDoc = this.contentDocument || this.contentWindow.document;
        handleIframeContent(iframeDoc);
      } catch (error) {
        console.warn("Cannot access iframe content:", error);
      }
    });
  };

  // メインドキュメントにステータスを追加
  addStatusToDocument(document);

  // 現在のiframeを処理
  const iframes = document.getElementsByTagName("iframe");
  Array.from(iframes).forEach(processIframe);

  // 新しいiframeを監視
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLIFrameElement) {
          processIframe(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};

// DOMの準備ができたら実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addElementToIframes);
} else {
  addElementToIframes();
}
