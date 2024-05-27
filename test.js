document.getElementById('doneButton').addEventListener('click', async () => {
  // ... existing code for checkbox checks ...

  // Start the countdown
  let countdownTime = 300; // 5 minutes
  const countdownElement = document.getElementById('countdown');
  countdownElement.style.display = 'block';
  updateCountdown(countdownElement, countdownTime);

  const countdownInterval = setInterval(() => {
    countdownTime -= 1;
    updateCountdown(countdownElement, countdownTime);

    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Time is up!';
    }
  }, 1000);

  // ... existing code for tab checks ...

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: checkLinks,
      args: [checkAllLinks, checkBrokenLinks, checkLocalLanguageLinks, checkAllDetails]
    });

    // ... existing code for handling results ...

  } catch (error) {
    // ... existing error handling code ...
  }
});

// Function to update the countdown display
function updateCountdown(element, time) {
  // ... existing code for countdown display ...
}

// Event listener for the preview button
document.getElementById('previewButton').addEventListener('click', () => {
  // ... existing code for previewing results ...
});

// Event listener for the download PDF button
document.getElementById('downloadPdfButton').addEventListener('click', () => {
  // ... existing code for downloading PDF ...
});

// Event listener for the download Excel button
document.getElementById('downloadExcelButton').addEventListener('click', () => {
  // ... existing code for downloading Excel ...
});

// Functions to display link results
function displayAllLinks(links) {
  // ... existing code for displaying all links ...
}

function displayBrokenLinks(links) {
  // ... existing code for displaying broken links ...
}

function displayLocalLanguageLinks(links) {
  // ... existing code for displaying local language links ...
}

// Helper functions
function getLocalLanguageString(url) {
  // ... existing code for getting local language string ...
}

function highlightPercent20(url) {
  // ... existing code for highlighting %20 ...
}

// Optimized checkLinks function with parallel fetching
async function checkLinks(checkAllLinks, checkBrokenLinks, checkLocalLanguageLinks, checkAllDetails) {
  const allLinks = [];
  const brokenLinks = [];
  const localLanguageLinks = [];
  const links = Array.from(document.querySelectorAll('a')).map(link => link.href);

  const fetchPromises = links.map(url => 
    fetch(url)
      .then(response => ({ url, status: response.status }))
      .catch(error => ({ url, status: 'error', error }))
  );

  const results = await Promise.all(fetchPromises);

  results.forEach(({ url, status, error }) => {
    if (checkAllLinks || checkAllDetails) allLinks.push({ url, status });

    if ((checkBrokenLinks || checkAllDetails) && (status >= 400 && status < 600)) {
      brokenLinks.push({ url, status });
    }

    if (checkLocalLanguageLinks || checkAllDetails) {
      const languageString = getLocalLanguageString(url);
      if (languageString !== 'unknown') {
        localLanguageLinks.push({ url, languageString });
      }
    }
  });

  return {
    allLinks,
    brokenLinks,
    localLanguageLinks
  };
}
