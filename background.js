chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getLyrics") {
    fetchLyrics(request.artist, request.song)
      .then(lyrics => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs.length > 0) {
            chrome.scripting.executeScript({
              target: {tabId: tabs[0].id},
              function: fetchAndInsert,
              args: [lyrics]
            }, (results) => {
              if (chrome.runtime.lastError) {
                sendResponse({status: "Error: " + chrome.runtime.lastError.message});
              } else {
                sendResponse({status: results[0].result || "Fetched and Added"});
              }
            });
          } else {
            sendResponse({status: "Error: No active tab found"});
          }
        });
      })
      .catch(error => {
        sendResponse({status: "Error fetching lyrics: " + error.message});
      });
    return true; 
  }
});

function fetchLyrics(artist, song) {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.lyrics) {
        return data.lyrics;
      } else {
        return "Lyrics not found";
      }
    })
    .catch(error => {
      console.error('Error:', error);
      return "Error fetching lyrics";
    });
}

function fetchAndInsert(lyrics) {
  function findLyricsDiv() {
    const allHTML = document.getElementsByTagName('div');
    for (let div of allHTML) {
      const style = div.getAttribute('style');
      if (style && 
          style.includes('--lyrics-color-active') &&
          style.includes('--lyrics-color-inactive') &&
          style.includes('--lyrics-color-passed') &&
          style.includes('--lyrics-color-background') &&
          style.includes('--lyrics-color-messaging')) {
        console.log("Lyrics div found with class:", div.className);
        return div;
      }
    }
    console.log("Lyrics div not found");
    return null;
  }

  function insertLyrics(lyrics) {
    let lyricsDiv = findLyricsDiv();
    if (lyricsDiv) {
      lyricsDiv.innerHTML = lyrics.replace(/\n/g, '<br>');
      return "Lyrics updated successfully";
    } else {
      return "Lyrics div not found, cannot update";
    }
  }

  return insertLyrics(lyrics);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url === 'https://open.spotify.com/lyrics') {
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      function: fetchAndInsert,
      args:["\n\n\n\n---- TEMPORARY LYRICS ---"]
    });
  }
});
