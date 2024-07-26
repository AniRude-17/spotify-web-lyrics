document.addEventListener('DOMContentLoaded', function() {
  const artistInput = document.getElementById('artistInput');
  const songInput = document.getElementById('songInput');
  const submitButton = document.getElementById('submitButton');
  const statusDiv = document.getElementById('status');

  submitButton.addEventListener('click', function() {
    const artist = artistInput.value;
    const song = songInput.value;

    if (!artist || !song) {
      statusDiv.textContent = 'Please fill both fields';
      return;
    }

    statusDiv.textContent = 'Fetching lyrics...';

    chrome.runtime.sendMessage({action: "getLyrics", artist: artist, song: song}, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
      } else if (response && response.status) {
        statusDiv.textContent = response.status;
      } else {
        statusDiv.textContent = 'Debug, you got some another error, reload, close dev tools';
      }
    });
  });
});