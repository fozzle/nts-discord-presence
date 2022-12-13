console.log("NTS Presence Loaded...");

interface ListeningActivity {
  programName: string;
  channel: string;
  startedAt: number;
}

let currentlyListeningLive: ListeningActivity | null = null;
let currentlyListeningArchive: ListeningActivity | null = null;

function subscribeToLiveShows() {
  const liveShowBanner = document
    .getElementsByClassName("live-header__channels")
    .item(0);
  if (liveShowBanner == null) {
    throw new Error("Unable to find live show banner!");
  }

  const liveShowObserver = new MutationObserver((mutationList, observer) => {
    console.log("Live show classes changed!");
    const playingChannel = document
      .getElementsByClassName("live-channel--playing")
      .item(0);
    if (!playingChannel) {
      currentlyListeningLive = null;
      // TODO: Send over websocket here, or send to background script, whatever.
    } else {
      const channelNumber = playingChannel.querySelector(
        ":scope > .channel-icon"
      )?.textContent;
      const programName =
        playingChannel.querySelector(":scope h3")?.textContent;
      if (channelNumber && programName) {
        currentlyListeningLive = {
          startedAt: Date.now(),
          ...currentlyListeningLive,
          channel: channelNumber,
          programName: programName,
        };
      }
    }

    console.log("LIVE", currentlyListeningLive);
  });

  liveShowObserver.observe(liveShowBanner, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

function subscribeToArchives() {
  const archiveFooter = document
    .getElementsByClassName("footer-player")
    .item(0);
  if (archiveFooter == null) {
    throw new Error("Unable to find footer player!");
  }

  const archiveShowObserver = new MutationObserver((mutationList, observer) => {
    console.log("ARCHIVE OBSERVE!");
    const programName = archiveFooter.querySelector(
      ":scope .soundcloud-player__episode-title-container.visuallyhidden h4"
    )?.textContent;
    const programDate = archiveFooter.querySelector(
      ":scope .soundcloud-player__episode-title-container.visuallyhidden span.body-s"
    )?.textContent;
    if (programName && programDate) {
      currentlyListeningArchive = {
        startedAt: Date.now(),
        ...currentlyListeningArchive,
        programName,
        channel: programDate,
      };
    } else {
      currentlyListeningArchive = null;
    }

    console.log("ARCHIVE", currentlyListeningArchive);
  });

  archiveShowObserver.observe(archiveFooter, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });
}

try {
  subscribeToLiveShows();
} catch (e) {
  console.error("Failed to subscribe to live shows");
}

try {
  subscribeToArchives();
} catch (e) {
  console.error("Failed to subscribe to archives");
}
