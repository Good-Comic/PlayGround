// Node用最小瀏覽器全域；先於靜態Renderer匯入建立，不替換任何Game／規則實作。
globalThis.document ??= { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window ??= { innerWidth: 1440, innerHeight: 900 };
