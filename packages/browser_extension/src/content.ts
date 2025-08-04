// function isAlreadyOtherTabUsed() {
//   console.log("Ahoj");
// }

import type { Message } from "./types";

let songNameElement: Element | null;
let songAuthorElement: Element | null;
let songCoverElement: HTMLImageElement | null;

const CHECK_INTERVAL_IN_MS = 3_000;

function init() {
  const interval = setInterval(() => {
    setHtmlElements();

    if (areAllElementsDefined()) {
      const songData: Message = {
        type: "SONG",
        data: {
          name: songNameElement!.textContent!,
          author: songAuthorElement!.textContent!,
          coverUrl: songCoverElement!.src!,
        },
      };

      chrome.runtime.sendMessage(songData);
    }
  }, CHECK_INTERVAL_IN_MS);

  window.addEventListener("beforeunload", () => {
    clearInterval(interval);
  });
}

init();

function setHtmlElements() {
  songNameElement = document.querySelector(
    '[slot="player-bar"] .title.style-scope.ytmusic-player-bar'
  );
  songAuthorElement = document.querySelector(
    '[slot="player-bar"] .byline.style-scope.ytmusic-player-bar.complex-string .yt-simple-endpoint.style-scope.yt-formatted-string'
  );
  songCoverElement = document.querySelector(
    '[slot="player-bar"] .image.style-scope.ytmusic-player-bar'
  );
}

function areAllElementsDefined(): boolean {
  return Boolean(songNameElement && songAuthorElement && songCoverElement);
}
