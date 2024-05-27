document.getElementById('doneButton').addEventListener('click', async () => {
  // ... existing code for checkbox checks ...
  const checkAllLinks = document.getElementById('checkAllLinks').checked;
  const checkBrokenLinks = document.getElementById('checkBrokenLinks').checked;
  const checkLocalLanguageLinks = document.getElementById('checkLocalLanguageLinks').checked;
  const checkAllDetails = document.getElementById('checkAllDetails').checked;

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
        console.log('Link check result:', result); // Debugging

    if (result) {
      localStorage.setItem('linkResults', JSON.stringify(result));
      clearInterval(countdownInterval);
      countdownElement.textContent= 'Loading compeleted now you can download your files'
      alert('Completed');
    } else {
      alert('No result returned from the link check.');
    }

  } catch (error) {
    // ... existing error handling code ...
       //console.error('Error checking links:', error); // Debugging
    clearInterval(countdownInterval);
    countdownElement.textContent='';
    console.error(error);
    alert('An error occurred while checking links.');
  }
});

// Function to update the countdown display
function updateCountdown(element, time) {
  // ... existing code for countdown display ...
    const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `Time remaining: ${minutes}m ${seconds}s`;
}

// Event listener for the preview button
document.getElementById('previewButton').addEventListener('click', () => {
  // ... existing code for previewing results ...
    const results = JSON.parse(localStorage.getItem('linkResults'));
  if (results) {
    document.getElementById('result').style.display = 'block';
    displayAllLinks(results.allLinks);
    displayBrokenLinks(results.brokenLinks);
    displayLocalLanguageLinks(results.localLanguageLinks);
  } else {
    alert('No data to preview. Please click "Done" first.');
  }
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
  let html = '<table><tr><th>Link</th><th>Status</th></tr>';
  links.forEach(link => {
    //for aka.ms
    const highlightedUrl = link.url.includes('aka.ms') ? `<span class="highlighted-link">${link.url}</span>` : link.url;
    html += `<tr><td>${link.url}</td><td>${link.status}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('allLinksTable').innerHTML = html;
}

function displayBrokenLinks(links) {
  // ... existing code for displaying broken links ...
   let html = '<table><tr><th>Link</th><th>Status</th></tr>';
  links.forEach(link => {
    html += `<tr><td>${highlightPercent20(link.url)}</td><td>${link.status}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('brokenLinksTable').innerHTML = html;
}

function displayLocalLanguageLinks(links) {
  // ... existing code for displaying local language links ...
  let html = '<table><tr><th>Link</th><th>Language string</th></tr>';
  links.forEach(link => {
    html += `<tr><td>${link.url}</td><td>${getLocalLanguageString(link.url)}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('localLanguageLinksTable').innerHTML = html;
  
}

// Helper functions
function getLocalLanguageString(url) {
  const localLanguageList = [
    'en-us', 'en-au', 'en-ca', 'en-gb', 'en-hk', 'en-ie', 'en-in', 'en-my', 'en-nz', 'en-ph', 'en-sg', 'en-za', 'es-es',
    'es-mx', 'fr-be', 'fr-ca', 'fr-fr', 'it-it', 'ko-kr', 'pt-br', 'de-de', 'ar-sa', 'da-dk', 'fi-fi', 'ja-jp', 'nb-no',
    'nl-be', 'nl-nl', 'zh-cn'
  ];
  for (const language of localLanguageList) {
    if (url.includes(language)) {
      return language;
    }
  }
  return 'unknown';
}

function highlightPercent20(url) {
  // ... existing code for highlighting %20 ...
    return url.replace(/%20/g, '<span style="color: red;">%20</span>');

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
