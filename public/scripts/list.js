document.addEventListener('DOMContentLoaded', function () {});

function deleteButton(listId) {
  fetch(`/delete/list/${listId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
}

function formatText(text) {
  return text.replace(/&#39;/g, "'");
}

function generateList(listId) {
  document.getElementById('placeholder-text').style.display = 'none';
  fetch(`/retrieve/list/${listId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then(function (data) {
      if (data.titles.length === 0) {
        console.log('empty list');
      } else {
        if (document.getElementById('list-titles')) {
          document.getElementById('list-titles').remove();
        }

        // all encompassing element
        const listTitles = document.createElement('div');
        listTitles.setAttribute('id', 'list-titles');

        // list name wrapper
        const listNameWrap = document.createElement('div');
        listNameWrap.setAttribute('id', 'list-name-wrap');

        // list name
        const listName = document.createElement('p');
        listName.textContent = data.name;

        listNameWrap.appendChild(listName);
        listTitles.appendChild(listNameWrap);

        // buttons wrap
        const listButtons = document.createElement('div');
        listButtons.setAttribute('id', 'buttons-wrap');

        // edit button
        const editBtnLink = document.createElement('a');
        editBtnLink.setAttribute('href', `/edit/list/${data._id}`);
        const editBtn = document.createElement('input');
        editBtn.setAttribute('type', 'button');
        editBtn.value = 'edit list';
        editBtn.classList.add('list-button');
        editBtnLink.appendChild(editBtn);
        listButtons.appendChild(editBtnLink);

        // list page button
        const listPageLink = document.createElement('a');
        listPageLink.setAttribute('href', `/list/${data._id}`);
        const listPage = document.createElement('input');
        listPage.setAttribute('type', 'button');
        listPage.value = 'list page';
        listPage.classList.add('list-button');
        listPageLink.appendChild(listPage);
        listButtons.appendChild(listPageLink);

        listTitles.appendChild(listButtons);

        data.titles.forEach((title) => {
          // for (let title of data.titles) {
          // div for list title
          const listTitle = document.createElement('div');
          listTitle.classList.add('list-title');
          listTitle.appendChild(document.createElement('HR'));

          // div for title element
          const titleEl = document.createElement('div');
          titleEl.classList.add('list-el');

          // title image
          const titleImg = document.createElement('img');
          titleImg.src = title.image;
          titleImg.onerror = function () {
            this.src = '/images/no_image.png';
          };
          titleImg.classList.add('image');
          titleEl.appendChild(titleImg);

          // title info
          const titleInfo = document.createElement('div');
          titleInfo.classList.add('title-info');

          // title title
          const titleLink = document.createElement('a');
          titleLink.href = `http://www.netflix.com/title/${title.netflixId}`;
          titleLink.target = '_blank';

          const titleTitle = document.createElement('h2');
          titleTitle.textContent = formatText(title.title);
          titleLink.appendChild(titleTitle);

          titleInfo.appendChild(titleLink);

          // title synopsis
          const titleSyn = document.createElement('p');
          titleSyn.textContent = formatText(title.synopsis);
          titleInfo.appendChild(titleSyn);

          titleEl.appendChild(titleInfo);
          listTitle.appendChild(titleEl);

          if (title.type === 'series' && title.episodes.length > 0) {
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

            titleEl.appendChild(showEpsBtn);

            const episodesWrap = document.createElement('div');
            episodesWrap.classList.add('episodes-wrap');

            title.episodes.forEach((episode) => {
              // for (const episode of title.episodes) {
              // episode div
              const episodeEl = document.createElement('div');
              episodeEl.classList.add('list-episode');
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
              const episodeInfo = document.createElement('div');
              episodeInfo.classList.add('title-info');

              // episode title

              const episodeLink = document.createElement('a');
              episodeLink.href = `http://www.netflix.com/watch/${episode.netflixId}`;
              episodeLink.target = '_blank';

              const episodeTitle = document.createElement('h3');
              episodeTitle.textContent = formatText(episode.title);
              episodeLink.appendChild(episodeTitle);

              episodeInfo.appendChild(episodeLink);

              // episode number and season
              const nums = document.createElement('p');
              nums.textContent = `S${episode.season} E${episode.episode}`;
              nums.classList.add('nums');
              episodeInfo.appendChild(nums);

              episodeEl.appendChild(episodeInfo);
              episodesWrap.appendChild(episodeEl);
            });
            listTitle.appendChild(episodesWrap);
          }

          listTitles.appendChild(listTitle);
        });
        document.getElementById('edit-list').appendChild(listTitles);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
