const listId = window.location.pathname.split('/')[3];
let nameOfList = '';

function formatText(text) {
  return text.replace(/&#39;/g, "'");
}

function changeName(newName) {
  if (newName !== nameOfList) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    };
    fetch(`${window.location.pathname}/changeName`, options)
      .then((response) => response.json())
      .then(function (data) {
        if (data.message === 'complete') {
          document.getElementById('list-name').textContent = newName;
        }
      });
  }
}

function createDiv(id = '', classes = []) {
  const div = document.createElement('div');
  if (id) div.setAttribute('id', id);
  if (classes) classes.forEach((classToAdd) => div.classList.add(classToAdd));
  return div;
}

function createDeleteButton() {
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '&times;';
  deleteBtn.classList = 'delete-title-button';
  return deleteBtn;
}

function checkIfListEmpty() {
  const listElements = document.getElementById('list-titles');
  if (listElements.childElementCount === 0) {
    document.getElementById('placeholder-text').style.display = 'block';
  } else {
    document.getElementById('placeholder-text').style.display = 'none';
  }
}

function removeFromList(id) {
  document.getElementById(id).remove();
  checkIfListEmpty();
}

function deleteTitle(evt, titleId) {
  fetch(`/delete/${listId}/${titleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json().then(removeFromList(titleId)));
}

// create element for a title
function createListElement(title) {
  const listTitle = createDiv(title.netflixId, ['list-title']);
  listTitle.appendChild(document.createElement('HR'));

  // div for title element
  const titleEl = createDiv('', ['list-el']);

  // title image
  const titleImg = document.createElement('img');
  titleImg.src = title.image;
  titleImg.onerror = function () {
    this.src = '/images/no_image.png';
  };
  titleImg.classList.add('image');
  titleEl.appendChild(titleImg);

  // title info
  const titleInfo = createDiv('', ['title-info']);

  // title title
  const titleName = document.createElement('h2');
  titleName.textContent = formatText(title.title);
  titleInfo.appendChild(titleName);

  // title year
  const titleYear = document.createElement('p');
  titleYear.textContent = title.year;
  titleInfo.appendChild(titleYear);

  titleEl.appendChild(titleInfo);

  // title delete button
  const deleteFlex = createDiv('', ['delete-title-flex']);

  const deleteBtn = createDeleteButton();
  deleteBtn.addEventListener(
    'click',
    (function (titleId) {
      return function (e) {
        deleteTitle(e, titleId);
      };
    })(title.netflixId)
  );
  deleteFlex.appendChild(deleteBtn);
  titleEl.appendChild(deleteFlex);
  listTitle.appendChild(titleEl);

  return listTitle;
}

// create show episodes button
function createShowEpisodesButton() {
  const showEpsBtn = document.createElement('button');
  showEpsBtn.type = 'submit';
  showEpsBtn.innerHTML += '<span class="icon-chevron"></span>';
  showEpsBtn.classList.add('show-episodes-btn');

  showEpsBtn.addEventListener('click', function (e) {
    const epsWrap = e.path[2].nextSibling;
    if (epsWrap.style.display === 'none') {
      e.path[0].style.transform = 'rotate(180deg)';
      epsWrap.style.display = 'block';
    } else {
      e.path[0].style.transform = 'rotate(0deg)';
      epsWrap.style.display = 'none';
    }
  });
  return showEpsBtn;
}

function deleteEpisode(evt, titleId, episodeId) {
  fetch(`/delete/${listId}/${titleId}/${episodeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json().then(removeFromList(episodeId)));
}

function createEpisodeElement(episode, titleId) {
  // episode div
  const episodeEl = createDiv(episode.netflixId, ['list-episode']);
  episodeEl.appendChild(document.createElement('HR'));

  // episode image
  const episodeImg = document.createElement('img');
  episodeImg.src = episode.image;

  // no image
  episodeImg.onerror = function () {
    this.src = '/images/no_image.png';
  };
  episodeImg.classList.add('image');
  episodeEl.appendChild(episodeImg);

  // episode info
  const episodeInfo = createDiv('', ['title-info']);

  // episode title
  const episodeTitle = document.createElement('h3');
  episodeTitle.textContent = formatText(episode.title);
  episodeInfo.appendChild(episodeTitle);

  // episode number and season
  const nums = document.createElement('p');
  nums.textContent = `S${episode.season} E${episode.episode}`;
  nums.classList.add('nums');

  // append to parent element
  episodeInfo.appendChild(nums);
  episodeEl.appendChild(episodeInfo);

  // delete button
  const deleteEpBtn = createDeleteButton(episode);
  deleteEpBtn.addEventListener(
    'click',
    (function (titleID, episodeId) {
      return function (e) {
        deleteEpisode(e, titleID, episodeId);
      };
    })(titleId, episode.netflixId)
  );
  episodeEl.appendChild(deleteEpBtn);
  return episodeEl;
}

function checkIfTitleInList(titleId) {
  if (document.getElementById(titleId)) return true;
  return false;
}

function addMovieToList(movie) {
  const newListElement = createListElement(movie);
  document.getElementById('list-titles').appendChild(newListElement);
  checkIfListEmpty();
}

function addMovieToDb(movieRaw) {
  const movie = {
    title: formatText(movieRaw.title),
    netflixId: movieRaw.nfid,
    synopsis: formatText(movieRaw.synopsis),
    type: movieRaw.vtype,
    image: movieRaw.img,
    year: movieRaw.year,
    imdbId: movieRaw.imdbid,
    imdbRating: movieRaw.imdbrating,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movie: movie }),
  };

  fetch(`${window.location.pathname}/addMovie`, options)
    .then((response) => response.json())
    .then(function (data) {
      if (data.message === 'complete') {
        addMovieToList(movie);
      }
    });
}

function getShowEpisodesButton(showId) {
  const listElement = document.getElementById(showId);
  const showEpisodesButton = listElement.childNodes[1].childNodes[3];
  return showEpisodesButton;
}

function addEpisodeToList(show, episode) {
  const newEpisodeElement = createEpisodeElement(episode, show.netflixId);
  let episodesWrap;
  if (checkIfTitleInList(show.netflixId)) {
    const showElement = document.getElementById(show.netflixId);
    [, , episodesWrap] = showElement.childNodes;
    // if show title is in list but has no episodes in it
    if (episodesWrap === undefined) {
      const showEpisodesButton = createShowEpisodesButton();
      showElement.childNodes[1].appendChild(showEpisodesButton);
      episodesWrap = createDiv('', ['episodes-wrap']);
      showElement.appendChild(episodesWrap);
    }
    episodesWrap.appendChild(newEpisodeElement);
  } else {
    const showElement = createListElement(show);
    const showEpisodesButton = createShowEpisodesButton();
    showElement.childNodes[1].appendChild(showEpisodesButton);
    episodesWrap = createDiv('', ['episodes-wrap']);
    showElement.appendChild(episodesWrap);
    episodesWrap.appendChild(newEpisodeElement);
    document.getElementById('list-titles').appendChild(showElement);
  }

  // open hidden episodes if hidden
  if (episodesWrap.style.display === 'none') {
    const showEpisodesButton = getShowEpisodesButton(show.netflixId);
    showEpisodesButton.childNodes[0].style.transform = 'rotate(180deg)';
    episodesWrap.style.display = 'block';
  }
  checkIfListEmpty();
}

function addEpisodeToDb(episodeRaw, showRaw) {
  const episode = {
    title: formatText(episodeRaw.title),
    netflixId: episodeRaw.epid,
    synopsis: formatText(episodeRaw.synopsis),
    image: episodeRaw.img,
    season: episodeRaw.seasnum,
    episode: episodeRaw.epnum,
  };
  const show = {
    title: formatText(showRaw.title),
    netflixId: showRaw.nfid,
    synopsis: formatText(showRaw.synopsis),
    type: showRaw.vtype,
    image: showRaw.img,
    year: showRaw.year,
    imdbId: showRaw.imdbid,
    imdbRating: showRaw.imdbrating,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ show, episode }),
  };

  fetch(`${window.location.pathname}/addEpisode`, options)
    .then((response) => response.json())
    .then(function (data) {
      if (data.message === 'complete') {
        addEpisodeToList(show, episode);
      }
    });
}

function generateListContent(titles) {
  const listTitles = createDiv('list-titles');

  titles.forEach(function (title) {
    // for (const title of titles) {
    const listTitle = createListElement(title);
    if (title.type === 'series' && title.episodes.length > 0) {
      const showEpisodesButton = createShowEpisodesButton();
      listTitle.childNodes[1].appendChild(showEpisodesButton);

      const episodesWrap = createDiv('', ['episodes-wrap']);

      title.episodes.forEach(function (episode) {
        const episodeElement = createEpisodeElement(episode, title.netflixId);
        episodesWrap.appendChild(episodeElement);
      });
      listTitle.appendChild(episodesWrap);
    }
    listTitles.appendChild(listTitle);
  });
  document.getElementById('edit-list').appendChild(listTitles);
}

// for loading the list for the very first time
function generateList(list) {
  document.getElementById('list-name').textContent = list.name;
  nameOfList = list.name;
  generateListContent(list.titles);
  checkIfListEmpty();
}

function retrieveAndGenerateList() {
  fetch(`/retrieve/list/${listId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((list) => {
      generateList(list);
    })
    .catch((err) => {
      console.log(err);
    });
}

function chevronHideEpisodes(evt) {
  const chevronPrompt = evt.path[1].childNodes[0];
  chevronPrompt.textContent = 'hide episodes';
  const chevronIcon = evt.path[0];
  chevronIcon.style.transform = 'rotate(180deg)';
}

function chevronShowEpisodes(evt) {
  const chevronPrompt = evt.path[1].childNodes[0];
  chevronPrompt.textContent = 'show episodes';
  const chevronIcon = evt.path[0];
  chevronIcon.style.transform = 'rotate(0deg)';
}

function toggleDisplaySeasons(searchResult, evt) {
  const parentEl = searchResult;
  if (parentEl.querySelector('#seasons').style.display === 'none') {
    parentEl.querySelector('#seasons').style.display = 'block';
    chevronHideEpisodes(evt);
  } else {
    parentEl.querySelector('#seasons').style.display = 'none';
    chevronShowEpisodes(evt);
  }
}

function createSeasonsSelector() {
  const seasonSelector = document.createElement('select');
  seasonSelector.addEventListener('focus', function () {
    // Store the previous value on focus
    let previousSeason = this.selectedIndex;
    // change both previous and the new value on change
    this.addEventListener('change', function (event) {
      const currentSeason = this.selectedIndex;
      const allSeasons = event.path[1].childNodes;
      allSeasons[1 + previousSeason].classList.add('hide-season');
      allSeasons[1 + currentSeason].classList.remove('hide-season');
      // store current value in previous in case user changes selector without calling focus
      previousSeason = currentSeason;
    });
  });
  return seasonSelector;
}

function createEpisode(episodeNum, episode, show) {
  const episodeEl = createDiv('', ['episode']);

  // add episode number
  const episodeNumber = document.createElement('h3');
  episodeNumber.textContent = `Episode ${parseInt(episodeNum, 10) + 1}`;
  episodeEl.appendChild(episodeNumber);

  // add episode image
  const episodeImage = document.createElement('img');
  episodeImage.src = episode.img;
  episodeImage.classList.add('image-search');
  episodeImage.onerror = function () {
    this.src = '/images/no_image.png';
  };
  episodeEl.appendChild(episodeImage);

  // add episode title
  const episodeTitle = document.createElement('h4');
  episodeTitle.textContent = formatText(episode.title);
  episodeEl.appendChild(episodeTitle);

  // add episode synopsis
  const episodeSynposis = document.createElement('p');
  episodeSynposis.textContent = formatText(episode.synopsis);
  episodeEl.appendChild(episodeSynposis);

  // add button
  const addBtn = document.createElement('input');
  addBtn.type = 'button';
  addBtn.value = 'add';
  addBtn.classList.add('btn', 'addBtn');
  addBtn.addEventListener(
    'click',
    (function (ep) {
      return function () {
        addEpisodeToDb(ep, show);
      };
    })(episode)
  );
  episodeEl.appendChild(addBtn);
  return episodeEl;
}

function createSeasons(data, show) {
  const allSeasonsEl = createDiv('seasons', ['seasons']);
  const seasonSelector = createSeasonsSelector();
  allSeasonsEl.appendChild(seasonSelector);

  Object.entries(data).forEach(function ([seasonNumber, season]) {
    // add season number to selector
    seasonSelector.add(new Option(`Season ${season.season}`));
    const seasonScrollEl = createDiv('', ['season']);
    if (seasonNumber > 0) {
      seasonScrollEl.classList.add('hide-season');
    }
    // add epsiodes
    Object.entries(season.episodes).forEach(([episodeNum, episode]) => {
      const episodeEl = createEpisode(episodeNum, episode, show);
      seasonScrollEl.appendChild(episodeEl);
    });
    allSeasonsEl.appendChild(seasonScrollEl);
  });
  return allSeasonsEl;
}

function createSeasonsDisplay(searchResult, evt, id, show) {
  // hide button and show loader
  const button = evt.path[1];
  button.style.display = 'none';
  const episodeLoader = createDiv('episode-load');
  evt.path[2].appendChild(episodeLoader);

  fetch(`https://unogsng.p.rapidapi.com/episodes?netflixid=${id}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'unogsng.p.rapidapi.com',
      'x-rapidapi-key': 'b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // hide loader and show button
      evt.path[2].removeChild(episodeLoader);
      button.style.display = 'block';
      chevronHideEpisodes(evt);

      const allSeasonsEl = createSeasons(data, show);
      searchResult.appendChild(allSeasonsEl);
    })
    .catch((err) => {
      console.log(err);
    });
}

function showEpisodes(evt, id, show) {
  evt.preventDefault();
  const searchResult = evt.path[3];
  if (searchResult.querySelector('#seasons') == null) {
    createSeasonsDisplay(searchResult, evt, id, show);
  } else {
    toggleDisplaySeasons(searchResult, evt);
  }
}

function clearPreviousSearch() {
  if (document.getElementById('searchResults')) {
    document.getElementById('searchResults').remove();
  }
}

function toggleSearchLoaderWheel() {
  const searchLoader = document.getElementById('search-load');
  if (searchLoader.style.display === 'block') {
    searchLoader.style.display = 'none';
  } else {
    searchLoader.style.display = 'block';
  }
}

function createSearchResult(result) {
  const { imdbrating, img, nfid, synopsis, title, vtype, year, imdbid } = result;

  const searchResult = createDiv('', ['searchResult']);
  // add hr
  searchResult.appendChild(document.createElement('HR'));

  // all title info
  const allTitle = createDiv('', ['all-title-info']);

  // image
  const imageEl = document.createElement('img');
  imageEl.src = img;
  imageEl.classList.add('image-search');
  allTitle.appendChild(imageEl);

  // wrap for elements to the right of image
  const rightOfImage = createDiv('', ['right-of-img']);

  // info wrap
  const titleInfo = createDiv('', ['title-info']);

  // title
  const titleEl = document.createElement('p');
  const titleName = document.createElement('span');
  titleName.classList.add('name-el');
  titleName.appendChild(document.createTextNode(formatText(title)));
  titleEl.appendChild(titleName);

  // year
  const titleYear = document.createElement('span');
  titleYear.classList.add('year-el');
  titleYear.appendChild(document.createTextNode(` ${year}`));

  // append to parent
  titleEl.appendChild(titleYear);
  titleInfo.appendChild(titleEl);

  // imdb rating
  const titleRating = document.createElement('a');
  titleRating.classList.add('rating-el');
  titleRating.href = `http://www.imdb.com/title/${imdbid}`;
  titleRating.target = '_blank';
  titleRating.innerHTML = `<i class='fas fa-star'></i> ${imdbrating || 'N/A'}`;
  titleInfo.appendChild(titleRating);

  // synopsis
  const titleSynopsis = document.createElement('p');
  titleSynopsis.textContent = formatText(synopsis);
  titleSynopsis.classList.add('synopsis');
  titleInfo.appendChild(titleSynopsis);

  // add title
  rightOfImage.appendChild(titleInfo);
  allTitle.appendChild(rightOfImage);

  // button element
  const addButtonFlex = createDiv('', ['add-button-flex']);

  // add button
  const addBtn = document.createElement('input');
  addBtn.type = 'button';
  addBtn.value = 'add';
  addBtn.classList.add('btn', 'add-movie-btn');
  addBtn.addEventListener(
    'click',
    (function (movie) {
      return function () {
        if (checkIfTitleInList(movie.nfid)) {
          alert('Title already in list');
        } else {
          addMovieToDb(movie);
        }
      };
    })(result)
  );
  addButtonFlex.appendChild(addBtn);
  allTitle.appendChild(addButtonFlex);

  // show episdoes button
  if (vtype === 'series') {
    const showBtn = document.createElement('button');
    showBtn.type = 'submit';
    const showText = document.createElement('p');
    showText.textContent = 'show episodes';
    showBtn.appendChild(showText);
    showBtn.innerHTML += '<span class="icon-chevron-thin"></span>';
    showBtn.classList.add('show-episodes');

    // pass object into event listener
    showBtn.addEventListener(
      'click',
      (function (id) {
        return function (e) {
          showEpisodes(e, id, result);
        };
      })(nfid)
    );

    allTitle.appendChild(showBtn);
  }

  searchResult.appendChild(allTitle);
  return searchResult;
}

function generateSearchResults(data) {
  const searchResults = createDiv('searchResults', []);
  data.results.forEach((result) => searchResults.appendChild(createSearchResult(result)));
  toggleSearchLoaderWheel();
  document.querySelector('#left-search').appendChild(searchResults);
}

function search(evt) {
  evt.preventDefault();
  clearPreviousSearch();
  toggleSearchLoaderWheel();
  const searchValue = document.querySelector('#search').value;
  fetch(`https://unogsng.p.rapidapi.com/search?query=${searchValue}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'unogsng.p.rapidapi.com',
      'x-rapidapi-key': 'b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07',
    },
  })
    .then((response) => response.json())
    .then((data) => generateSearchResults(data))
    .catch((err) => {
      console.log(err);
    });
}

function setMaxLength(event) {
  const settings = {
    maxLen: 80,
  };

  const keys = {
    backspace: 8,
    shift: 16,
    ctrl: 17,
    alt: 18,
    delete: 46,
    leftArrow: 37,
    upArrow: 38,
    rightArrow: 39,
    downArrow: 40,
  };

  const utils = {
    special: {},
    navigational: {},
    isSpecial(e) {
      return typeof this.special[e.keyCode] !== 'undefined';
    },
    isNavigational(e) {
      return typeof this.navigational[e.keyCode] !== 'undefined';
    },
  };

  utils.special[keys.backspace] = true;
  utils.special[keys.shift] = true;
  utils.special[keys.ctrl] = true;
  utils.special[keys.alt] = true;
  utils.special[keys.delete] = true;

  utils.navigational[keys.upArrow] = true;
  utils.navigational[keys.downArrow] = true;
  utils.navigational[keys.leftArrow] = true;
  utils.navigational[keys.rightArrow] = true;

  const len = event.target.innerText.trim().length;
  let hasSelection = false;
  const selection = window.getSelection();
  const isSpecial = utils.isSpecial(event);
  const isNavigational = utils.isNavigational(event);

  if (selection) {
    hasSelection = !!selection.toString();
  }

  if (isSpecial || isNavigational) {
    return true;
  }

  if (len >= settings.maxLen && !hasSelection) {
    event.preventDefault();
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const listName = document.getElementById('list-name');
  listName.onclick = function () {
    this.contentEditable = true;
    this.onfocus = document.execCommand('selectAll', false, null);
    this.focus();
    listName.classList.remove('deactivated');
    listName.classList.add('activated');

    const saveBtn = document.getElementById('save-name');
    saveBtn.style.display = 'inline-block';
    saveBtn.onclick = function () {
      saveBtn.style.display = 'none';
      listName.classList.add('deactivated');
      listName.classList.remove('activated');
      listName.textContent = listName.textContent.trim();
      changeName(listName.textContent);
      listName.contentEditable = false;
    };
    listName.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        saveBtn.style.display = 'none';
        listName.classList.add('deactivated');
        listName.classList.remove('activated');
        listName.textContent = listName.textContent.trim();
        changeName(listName.textContent);
        listName.contentEditable = false;
      }
    });
  };

  // set max length to listName div. C&P
  listName.addEventListener('keydown', (event) => setMaxLength(event));
  retrieveAndGenerateList();
  const searchButton = document.getElementById('searchBtn');
  searchButton.addEventListener('click', search);
  document.getElementById('search').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      search(e);
    }
  });
});
