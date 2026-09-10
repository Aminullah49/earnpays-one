import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PreferenceProvider } from './context/PreferenceContext.tsx';

// --- iFrame & Sandboxed Environment Safeguards ---
try {
  const originalAlert = window.alert;
  window.alert = function(msg) {
    try {
      originalAlert(msg);
    } catch (e) {
      console.warn("window.alert blocked or failed in sandbox iframe. Message:", msg);
    }
  };
} catch (e) {
  console.warn("Could not wrap window.alert", e);
}

try {
  const originalConfirm = window.confirm;
  window.confirm = function(msg) {
    try {
      return originalConfirm(msg);
    } catch (e) {
      console.warn("window.confirm blocked or failed in sandbox iframe. Returning true fallback. Message:", msg);
      return true;
    }
  };
} catch (e) {
  console.warn("Could not wrap window.confirm", e);
}

// Safely handle clipboards
try {
  if (typeof navigator !== "undefined" && !navigator.clipboard) {
    (navigator as any).clipboard = {
      writeText: async (text: string) => {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-99999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          console.log("Copied text via legacy sandbox fallback successfully");
        } catch (err) {
          console.warn("Fallback clipboard copy failed:", err);
        }
      }
    };
  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = async function(text: string) {
      try {
        return await originalWriteText.call(navigator.clipboard, text);
      } catch (e) {
        console.warn("Clipboard writeText blocked or failed, using sandbox fallback:", e);
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-99999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch (err) {
          console.warn("Fallback clipboard copy failed:", err);
        }
      }
    };
  }
} catch (e) {
  console.warn("Could not safeguard clipboard API", e);
}
// --------------------------------------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferenceProvider>
      <App />
    </PreferenceProvider>
  </StrictMode>,
);


