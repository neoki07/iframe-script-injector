"use strict";

var addElementToIframes = function addElementToIframes() {
  // メインページにも要素を追加
  var mainElement = document.createElement("div");
  mainElement.style.cssText = "\n    position: fixed;\n    top: 8px;\n    right: 8px;\n    background: #F8FAFC;\n    color: #475569;\n    padding: 3px 8px 3px 3px;\n    border-radius: 9999px;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    font-size: 11px;\n    font-weight: 500;\n    letter-spacing: -0.01em;\n    backdrop-filter: blur(8px);\n    -webkit-backdrop-filter: blur(8px);\n    box-shadow: \n      0 0 0 1px rgba(148, 163, 184, 0.1),\n      0 1px 2px rgba(15, 23, 42, 0.05);\n    z-index: 9999;\n    pointer-events: none;\n    display: inline-flex;\n    align-items: center;\n    gap: 5px;\n    transform: translateY(0) scale(1);\n    opacity: 1;\n    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  ";

  // ステータスドットの追加
  var statusDot = document.createElement("div");
  statusDot.style.cssText = "\n    width: 16px;\n    height: 16px;\n    border-radius: 9999px;\n    background: #F1F5F9;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    box-shadow: \n      0 0 0 1px rgba(148, 163, 184, 0.1),\n      0 1px 2px rgba(15, 23, 42, 0.05);\n  ";

  // チェックマークSVGの追加
  var checkIcon = document.createElement("div");
  checkIcon.style.cssText = "\n    width: 14px;\n    height: 14px;\n    background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);\n    border-radius: 9999px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    box-shadow: 0 1px 2px rgba(14, 165, 233, 0.15);\n  ";
  checkIcon.innerHTML = "\n    <svg width=\"8\" height=\"8\" viewBox=\"0 0 8 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M6.5 2.5L3.5 5.5L1.5 3.5\" stroke=\"white\" stroke-width=\"1.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    </svg>\n  ";
  statusDot.appendChild(checkIcon);
  var textSpan = document.createElement("span");
  textSpan.textContent = "Script Injected";
  textSpan.style.cssText = "\n    color: #334155;\n    line-height: 1;\n  ";
  mainElement.appendChild(statusDot);
  mainElement.appendChild(textSpan);
  var addStatusToDocument = function addStatusToDocument(doc) {
    if (!doc.querySelector('div[style*="Script Injected"]')) {
      var newElement = mainElement.cloneNode(true);
      newElement.style.transform = "translateY(-8px) scale(0.96)";
      newElement.style.opacity = "0";
      doc.body.appendChild(newElement);
      requestAnimationFrame(function () {
        newElement.style.transform = "translateY(0) scale(1)";
        newElement.style.opacity = "1";
      });
    }
  };
  var _processIframe = function processIframe(iframe) {
    var handleIframeContent = function handleIframeContent(iframeDoc) {
      if (!iframeDoc) return;

      // DOMContentLoadedイベントが発火した時点でバッジを表示
      var addBadgeOnLoad = function addBadgeOnLoad() {
        addStatusToDocument(iframeDoc);

        // iframe内の変更を監視
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
              if (node instanceof HTMLIFrameElement) {
                _processIframe(node);
              }
            });
          });
        });
        observer.observe(iframeDoc.documentElement, {
          childList: true,
          subtree: true
        });
      };

      // 子iframeを処理
      var processChildIframes = function processChildIframes() {
        var childIframes = iframeDoc.getElementsByTagName("iframe");
        Array.from(childIframes).forEach(_processIframe);
      };
      if (iframeDoc.readyState === "loading") {
        iframeDoc.addEventListener("DOMContentLoaded", function () {
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
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      handleIframeContent(iframeDoc);
    } catch (error) {
      console.warn("Cannot access iframe content:", error);
    }

    // 新しいコンテンツのロードを監視
    iframe.addEventListener("load", function () {
      try {
        var _iframeDoc = this.contentDocument || this.contentWindow.document;
        handleIframeContent(_iframeDoc);
      } catch (error) {
        console.warn("Cannot access iframe content:", error);
      }
    });
  };

  // メインドキュメントにステータスを追加
  addStatusToDocument(document);

  // 現在のiframeを処理
  var iframes = document.getElementsByTagName("iframe");
  Array.from(iframes).forEach(_processIframe);

  // 新しいiframeを監視
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node instanceof HTMLIFrameElement) {
          _processIframe(node);
        }
      });
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
};

// DOMの準備ができたら実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addElementToIframes);
} else {
  addElementToIframes();
}
