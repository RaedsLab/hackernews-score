'use strict';

console.log('\'Allo \'Allo! Popup');

let differences = localStorage['differences'];
differences = JSON.parse(differences);

const display = document.querySelector('#progress');

let html = '';
console.log('Laoding..');
let i = 0;
differences.forEach(element => {

  fetch(`https://hacker-news.firebaseio.com/v0/item/${element.thread}.json`)
    .then(res => res.json())
    .then(response => {

      let text = '';
      if (response.type === 'story') {
        text = response.title;
      } else {
        if (text.startsWith('<a')) {
          text = '[Link]' + response.text;
        } else {
          text = response.text.substr(0, 37);
          text = text.replace(/(<br>|\r\n|\n|\r)/gm, ''); // remove breakline
          text += '...';
        }
      }

      if (element.variation > 0) {
        display.innerHTML += `<li data-thread="${element.thread}"><span class="up">+${element.variation}</span><span>${text}</span></li>`;
      } else if (element.variation <= 0) {
        display.innerHTML += `<li data-thread="${element.thread}"><span class="down">${element.variation}</span><span>${text}</span></li>`;
      }
      console.log(++i);
      console.log('Loaded ' + i);
    });
});
console.log('finished loading');
display.innerHTML = html;
const list = document.querySelectorAll('li');
list.forEach(element => {
  element.addEventListener('click', e => {
    console.debug(e.currentTarget);
    //const newURL = `https://news.ycombinator.com/item?id=${e.currentTarget.dataset.thread}`;
    // chrome.tabs.create({url: newURL});
  });
});

localStorage['scores'] = localStorage['newScores'];