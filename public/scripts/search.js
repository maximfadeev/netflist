const listId = window.location.pathname.split("/")[3];
let listNetflixIds = [];
nameOfList = "";

function formatText(text) {
    return text.replace(/&#39;/g, "'");
}

document.addEventListener("DOMContentLoaded", function () {
    const listName = document.getElementById("list-name");
    listName.onclick = function (e) {
        this.contentEditable = true;
        // this.focus();
        listName.classList.remove("deactivated");
        listName.classList.add("activated");

        const saveBtn = document.getElementById("save-name");
        saveBtn.style.display = "inline-block";
        saveBtn.onclick = function (e) {
            saveBtn.style.display = "none";
            listName.classList.add("deactivated");
            listName.classList.remove("activated");
            changeName(listName.textContent);
        };
    };

    generateList(listId);
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", search);
});

function changeName(newName) {
    if (newName !== nameOfList) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newName }),
        };
        fetch(window.location.pathname + "/changeName", options)
            .then((response) => response.json())
            .then(function (data) {
                if (data.message === "complete") {
                    generateList(listId);
                }
            });
    }
}

function generateList(listId) {
    fetch(`/retrieve/list/${listId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then(function (data) {
            document.getElementById("list-name").textContent = data.name;

            if (data.titles.length === 0) {
                console.log("empty list");
            } else {
                nameOfList = data.name;
                if (document.getElementById("list-titles")) {
                    document.getElementById("list-titles").remove();
                }

                const listTitles = document.createElement("div");
                listTitles.setAttribute("id", "list-titles");
                listNetflixIds = [];
                for (let title of data.titles) {
                    listNetflixIds.push(title.netflixId);
                    console.log(title);

                    // div for list title
                    const listTitle = document.createElement("div");
                    listTitle.classList.add("list-title");

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
                    const titleTitle = document.createElement("h2");
                    titleTitle.textContent = formatText(title.title);
                    titleInfo.appendChild(titleTitle);

                    // title synopsis
                    const titleSyn = document.createElement("p");
                    titleSyn.textContent = formatText(title.synopsis);
                    titleInfo.appendChild(titleSyn);

                    titleEl.appendChild(titleInfo);
                    listTitle.appendChild(titleEl);

                    if (title.type === "series" && title.episodes.length > 0) {
                        for (const episode of title.episodes) {
                            // episode div
                            const episodeEl = document.createElement("div");
                            episodeEl.classList.add("list-episode");
                            episodeEl.appendChild(document.createElement("HR"));

                            // episode image
                            const episodeImg = document.createElement("img");
                            episodeImg.src = episode.image;
                            // no image
                            episodeImg.onerror = function (e) {
                                this.src = "/images/no_image.png";
                            };

                            episodeImg.classList.add("image");
                            episodeEl.appendChild(episodeImg);

                            // episode info
                            const episodeInfo = document.createElement("div");
                            episodeInfo.classList.add("title-info");

                            // episode title
                            const episodeTitle = document.createElement("h3");
                            episodeTitle.textContent = formatText(episode.title);
                            episodeInfo.appendChild(episodeTitle);

                            // episode number and season
                            const nums = document.createElement("p");
                            nums.textContent = "S" + episode.season + " E" + episode.episode;
                            nums.classList.add("nums");
                            episodeInfo.appendChild(nums);

                            episodeEl.appendChild(episodeInfo);
                            listTitle.appendChild(episodeEl);
                        }
                    }

                    listTitles.appendChild(listTitle);
                }
                document.getElementById("list-element").appendChild(listTitles);
                // document.getElementById("list-titles").scrollTop = document.getElementById(
                //     "list-titles"
                // ).scrollHeight;
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
                    (function (movie) {
                        return function (e) {
                            // movie.type = "movie/show";
                            addMovie(e, movie);
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
                                showEpisodes(e, id, result);
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

function showEpisodes(evt, id, show) {
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
                            (function (episode) {
                                return function (e) {
                                    addEpisode(e, episode, show);
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

function addMovie(evt, movieRaw) {
    evt.preventDefault();

    if (listNetflixIds.includes(movieRaw.nfid)) {
        alert("already in");
    } else {
        let movie = {
            title: movieRaw.title,
            netflixId: movieRaw.nfid,
            synopsis: movieRaw.synopsis,
            type: movieRaw.vtype,
            image: movieRaw.img,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ movie: movie }),
        };

        fetch(window.location.pathname + "/addMovie", options)
            .then((response) => response.json())
            .then(function (data) {
                if (data.message === "complete") {
                    generateList(listId);
                }
            });
        evt.path[0].disabled = true;
    }
}

function addEpisode(evt, episodeRaw, showRaw) {
    evt.preventDefault();

    if (listNetflixIds.includes(episodeRaw.nfid)) {
        alert("already in");
    } else {
        let episode = {
            title: episodeRaw.title,
            netflixId: episodeRaw.epid,
            synopsis: episodeRaw.synopsis,
            image: episodeRaw.img,
            season: episodeRaw.seasnum,
            episode: episodeRaw.epnum,
        };
        let show = {
            title: showRaw.title,
            netflixId: showRaw.nfid,
            synopsis: showRaw.synopsis,
            type: showRaw.vtype,
            image: showRaw.img,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ show, episode }),
        };

        fetch(window.location.pathname + "/addEpisode", options)
            .then((response) => response.json())
            .then(function (data) {
                if (data.message === "complete") {
                    generateList(listId);
                }
            });

        evt.path[0].disabled = true;
    }
}

// window.onbeforeunload = function (event, listId) {
//     fetch(`/list/${listId}`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     })
//         .then((res) => res.json())
//         .then(function (data) {
//             document.getElementById("text-line").value = data.name;

//             if (data.titles.length === 0) {
//                 console.log("empty list");
//             } else {

//             }
//         });
// };
