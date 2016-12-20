'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'HN'});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  if (tab.url.startsWith('https://news.ycombinator.com/threads?id=')) {
    onWindowLoad();
  }
});

function onWindowLoad() {
  chrome.tabs.executeScript(null, {
    file: 'scripts/getPagesSource.js'
  }, function () {
    if (chrome.extension.lastError) {
      const htmlcontent = 'ERROR';
    }
  });
}


function updateBadgeScore(differences) {
  let score = 0;
  differences.forEach(element => {
    score += element.variation;
  });

  chrome.browserAction.setBadgeText({text: score.toString()});
}

/**
 *
 * @param {String} html
 * @returns {Array} {thread, score}
 */
function extractScoreFromHTML(html) {
  const scores = [];
  const text = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const scoresHN = doc.querySelectorAll('.score');

  scoresHN.forEach(score => {
    const thread = score.id.split('_')[1];
    const value = parseInt(score.innerHTML.split(' ')[0]);

    scores.push({
      thread: thread,
      score: value,
    });
  });

  return scores;
}

/**
 *
 * @param {Array} newScores
 * @returns {Array} {variation, thread}
 */
function compareScores(newScores) {

  const differences = [];
  let oldScores = localStorage['scores'];
  if (oldScores == undefined) {
    localStorage['scores'] = JSON.stringify(newScores);
    return [];
  }

  oldScores = JSON.parse(oldScores);

  newScores.forEach(newScore => {
    oldScores.forEach(oldScore => {
      if (oldScore.thread === newScore.thread) {
        differences.push({
          variation: oldScore.score - newScore.score,
          thread: oldScore.thread
        });
      }
    });
  });

  localStorage['newScores'] = JSON.stringify(newScores);
  return differences;
}

function formatForDisplay(differences) {
  localStorage['differences'] = JSON.stringify(differences);
}


chrome.extension.onMessage.addListener(function (request, sender) {

  if (request.action === 'getSource') {
    const htmlcontent = request.source;
    const pageScores = extractScoreFromHTML(htmlcontent);

    const differences = compareScores(pageScores);
    updateBadgeScore(differences);
    formatForDisplay(differences);
  }
});