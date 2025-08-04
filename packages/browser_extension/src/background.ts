import type { Message } from "./types";

let socket: WebSocket | null = null;

function connect() {
  socket = new WebSocket("ws://127.0.0.1:9001");

  socket.onopen = () => console.log("[WS] Připojeno");
  socket.onerror = (e) => console.error("[WS] Chyba:", e);
  socket.onclose = () => {
    console.warn("[WS] Odpojeno, pokusím se připojit znovu za 5s...");
    setTimeout(connect, 5000);
  };
}

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === "SONG") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message.data));
    }
  }
});

async function init() {
  connect();

  // const tabs = await chrome.tabs.query({ url: "https://music.youtube.com/watch*" });
  // if (tabs.length > 0) {
  //   const tab = tabs[0];
  //   chrome.scripting.executeScript({
  //     target: { tabId: tab.id! },
  //     files: ["./content.js"],
  //   });
  // }
}

init();

chrome.tabs.onCreated.addListener((tab) => {
  console.log(tab.url);
});
