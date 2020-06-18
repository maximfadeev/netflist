const listId = window.location.pathname.split("/")[3];
let listNetflixIds = [];
let shows = [];

function formatText(text) {
    return text.replace(/&#39;/g, "'");
}

document.addEventListener("DOMContentLoaded", function () {
    generateList(listId);
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", search);
});

function changeName(e) {
    e.preventDefault();
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: e.target[0].value }),
    };
    fetch(window.location.pathname + "/changeName", options)
        .then((response) => response.json())
        .then(function (data) {
            if (data.message === "complete") {
                generateList(listId);
            }
        });
}

function generateList(listId) {
    fetch(`/list/${listId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then(function (data) {
            document.getElementById("text-line").value = data.name;

            if (data.titles.length === 0) {
                console.log("empty list");
            } else {
                if (document.getElementById("list-titles")) {
                    document.getElementById("list-titles").remove();
                }

                const listTitles = document.createElement("div");
                // listTitles.classList.add("list-titles");
                listTitles.setAttribute("id", "list-titles");
                listNetflixIds = [];
                for (let title of data.titles) {
                    listNetflixIds.push(title.netflixId);

                    // div for title element
                    const titleEl = document.createElement("div");
                    titleEl.classList.add("list-el");
                    titleEl.appendChild(document.createElement("HR"));

                    // title image
                    const titleImg = document.createElement("img");
                    titleImg.src = title.image;
                    titleImg.onerror = function (e) {
                        this.src = "/images/no_image.png";
                    };
                    titleImg.classList.add("image");
                    titleEl.appendChild(titleImg);

                    // title info
                    const titleInfo = document.createElement("div");
                    titleInfo.classList.add("title-info");

                    // title title
                    const titleTitle = document.createElement("p");
                    titleTitle.textContent = formatText(title.title);
                    titleInfo.appendChild(titleTitle);

                    if (title.type === "episode") {
                        // season and episode nums for episodes
                        const nums = document.createElement("p");
                        nums.textContent = "S" + title.season + " E" + title.episode;
                        nums.classList.add("nums");
                        titleInfo.appendChild(nums);
                        titleEl.appendChild(titleInfo);

                        let inShows = false;
                        for (const [index, s] of shows.entries()) {
                            if (title.showId === s.id) {
                                shows[index].appendChild(titleEl);
                                inShows = true;
                                break;
                            }
                        }

                        if (!inShows) {
                            const show = document.createElement("div");
                            show.setAttribute("id", title.showId);
                            show.classList.add("show-els");
                            const showTitle = document.createElement("h3");
                            showTitle.textContent = title.show;
                            show.appendChild(showTitle);
                            show.appendChild(titleEl);
                            shows.push(show);
                            listTitles.appendChild(show);
                        }
                    } else {
                        titleEl.appendChild(titleInfo);
                        listTitles.appendChild(titleEl);
                    }
                }
                shows = [];
                document.getElementById("list-element").appendChild(listTitles);
                document.getElementById("list-titles").scrollTop = document.getElementById(
                    "list-titles"
                ).scrollHeight;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

function search(evt) {
    evt.preventDefault();
    const search = document.querySelector("#search").value;
    fetch(`https://unogsng.p.rapidapi.com/search?query=${search}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "unogsng.p.rapidapi.com",
            "x-rapidapi-key": "b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07",
        },
    })
        .then((response) => response.json())
        .then(function (data) {
            // all search results
            let searchResults = document.createElement("div");
            searchResults.setAttribute("id", "searchResults");
            // each result
            for (const result of data.results) {
                const { imdbrating, img, nfid, synopsis, title, vtype } = result;

                let searchResult = document.createElement("div");
                searchResult.classList.add("searchResult");

                // add hr
                searchResult.appendChild(document.createElement("HR"));

                // all title info
                const allTitle = document.createElement("div");
                allTitle.classList.add("all-title-info");

                // image
                let imageEl = document.createElement("img");
                imageEl.src = img;
                imageEl.classList.add("image");
                allTitle.appendChild(imageEl);

                // to the right of image
                let rightOfImage = document.createElement("div");
                rightOfImage.classList.add("right-of-img");

                // info
                let titleInfo = document.createElement("div");
                titleInfo.classList.add("title-info");

                // title
                let titleEl = document.createElement("h2");
                titleEl.textContent = formatText(title);
                titleInfo.appendChild(titleEl);

                // imdb rating
                let titleRating = document.createElement("h3");
                titleRating.textContent = imdbrating ? imdbrating : "N/A";
                titleInfo.appendChild(titleRating);

                // synopsis
                let titleSynopsis = document.createElement("p");
                titleSynopsis.textContent = formatText(synopsis);
                titleInfo.appendChild(titleSynopsis);

                // add title
                rightOfImage.appendChild(titleInfo);

                const buttons = document.createElement("div");
                buttons.classList.add("buttons");

                // add button
                let addBtn = document.createElement("input");
                addBtn.type = "button";
                addBtn.value = "add";
                addBtn.classList.add("btn", "addBtn");
                addBtn.addEventListener(
                    "click",
                    (function (titleObject) {
                        return function (e) {
                            titleObject.type = "movie/show";
                            addTitle(e, titleObject);
                        };
                    })(result)
                );
                buttons.appendChild(addBtn);

                // show episdoes button
                if (vtype === "series") {
                    let showBtn = document.createElement("input");
                    showBtn.type = "button";
                    showBtn.value = "show episodes";
                    showBtn.classList.add("btn", "showBtn");

                    // pass object into event listener
                    showBtn.addEventListener(
                        "click",
                        (function (id) {
                            return function (e) {
                                showEpisodes(e, id, title, nfid);
                            };
                        })(nfid)
                    );
                    buttons.appendChild(showBtn);
                }

                rightOfImage.appendChild(buttons);
                allTitle.appendChild(rightOfImage);
                searchResult.appendChild(allTitle);

                // add to all searches
                searchResults.appendChild(searchResult);
            }

            // add search results to document. if one already exists, remove it
            if (document.getElementById("searchResults")) {
                document.getElementById("searchResults").remove();
            }
            document.querySelector("#search-list").appendChild(searchResults);
        })
        .catch((err) => {
            console.log(err);
        });
}

function showEpisodes(evt, id, showName, showId) {
    const parentEl = evt.path[4];
    evt.preventDefault();
    if (parentEl.querySelector("#seasons") == null) {
        evt.path[0].disabled = true;
        fetch(`https://unogsng.p.rapidapi.com/episodes?netflixid=${id}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "unogsng.p.rapidapi.com",
                "x-rapidapi-key": "b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07",
            },
        })
            .then((response) => response.json())
            .then(function (data) {
                let allSeasonsEl = document.createElement("div");
                allSeasonsEl.classList.add("seasons");
                allSeasonsEl.setAttribute("id", "seasons");
                const seasonSelector = document.createElement("select");

                seasonSelector.addEventListener("focus", function () {
                    // Store the previous value on focus
                    let previousSeason = this.selectedIndex;
                    // change both previous and the new value on change
                    this.addEventListener("change", function (evt) {
                        const currentSeason = this.selectedIndex;
                        const allSeasons = evt.path[1].childNodes;
                        allSeasons[1 + previousSeason].classList.add("hide-season");
                        allSeasons[1 + currentSeason].classList.remove("hide-season");
                        // store current value in previous in case user changes selector without calling focus
                        previousSeason = currentSeason;
                    });
                });

                allSeasonsEl.appendChild(seasonSelector);

                for (const [seasonNumber, season] of data.entries()) {
                    // add season to selector
                    seasonSelector.add(new Option("Season " + season.season));

                    // add season number
                    let seasonScrollEl = document.createElement("div");
                    seasonScrollEl.classList.add("season");

                    if (seasonNumber !== 0) {
                        seasonScrollEl.classList.add("hide-season");
                    }

                    // add epsiodes
                    for (const [episodeNum, episode] of season.episodes.entries()) {
                        let episodeEl = document.createElement("div");
                        episodeEl.classList.add("episode");

                        // add episode number
                        let episodeNumber = document.createElement("h3");
                        episodeNumber.textContent = "Episode " + (episodeNum + 1);
                        episodeEl.appendChild(episodeNumber);

                        // add episode image
                        let episodeImage = document.createElement("img");
                        episodeImage.src = episode.img;
                        episodeImage.classList.add("image");
                        episodeImage.onerror = function (e) {
                            this.src = "/images/no_image.png";
                        };
                        episodeEl.appendChild(episodeImage);

                        // add episode title
                        let episodeTitle = document.createElement("h4");
                        episodeTitle.textContent = formatText(episode.title);
                        episodeEl.appendChild(episodeTitle);

                        // add episode synopsis
                        let episodeSynposis = document.createElement("p");
                        episodeSynposis.textContent = formatText(episode.synopsis);
                        episodeEl.appendChild(episodeSynposis);

                        // add button
                        let addBtn = document.createElement("input");
                        addBtn.type = "button";
                        addBtn.value = "add";
                        addBtn.addEventListener(
                            "click",
                            (function (titleObject) {
                                return function (e) {
                                    titleObject.type = "episode";
                                    titleObject.show = showName;
                                    titleObject.showId = showId;
                                    addTitle(e, titleObject);
                                };
                            })(episode)
                        );
                        episodeEl.appendChild(addBtn);
                        seasonScrollEl.appendChild(episodeEl);
                    }
                    allSeasonsEl.appendChild(seasonScrollEl);
                }
                parentEl.appendChild(allSeasonsEl);
                evt.path[0].disabled = false;
                evt.path[0].value = "hide episodes";
            })
            .catch((err) => {
                console.log(err);
            });
    } else if (parentEl.querySelector("#seasons").style.display === "none") {
        parentEl.querySelector("#seasons").style.display = "block";
        evt.path[0].value = "hide episodes";
    } else {
        parentEl.querySelector("#seasons").style.display = "none";
        evt.path[0].value = "show episodes";
    }
}

function addTitle(evt, titleObject) {
    evt.preventDefault();
    let nItem = {};

    if (titleObject.type === "episode") {
        nItem = {
            title: titleObject.title,
            netflixId: titleObject.epid,
            synopsis: titleObject.synopsis,
            image: titleObject.img,
            season: titleObject.seasnum,
            episode: titleObject.epnum,
            show: titleObject.show,
            showId: titleObject.showId,
            type: titleObject.type,
        };
    } else {
        nItem = {
            title: titleObject.title,
            netflixId: titleObject.nfid,
            synopsis: titleObject.synopsis,
            image: titleObject.img,
            type: titleObject.type,
        };
    }

    if (listNetflixIds.includes(nItem.netflixId)) {
        alert("already in");
    }

    evt.path[0].disabled = true;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nItem),
    };
    fetch(window.location.pathname + "/addTitle", options)
        .then((response) => response.json())
        .then(function (data) {
            if (data.message === "complete") {
                generateList(listId);
            }
        });
}
