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
        this.onfocus = (e) => document.execCommand("selectAll", false, null);
        this.focus();

        // this.style.userSelect = "all";
        // this.focus();
        listName.classList.remove("deactivated");
        listName.classList.add("activated");

        const saveBtn = document.getElementById("save-name");
        saveBtn.style.display = "inline-block";
        saveBtn.onclick = function (e) {
            saveBtn.style.display = "none";
            listName.classList.add("deactivated");
            listName.classList.remove("activated");
            listName.textContent = listName.textContent.trim();
            changeName(listName.textContent);
        };
    };

    // set max length to listName div. C&P

    settings = {
        maxLen: 80,
    };

    keys = {
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

    utils = {
        special: {},
        navigational: {},
        isSpecial(e) {
            return typeof this.special[e.keyCode] !== "undefined";
        },
        isNavigational(e) {
            return typeof this.navigational[e.keyCode] !== "undefined";
        },
    };

    utils.special[keys["backspace"]] = true;
    utils.special[keys["shift"]] = true;
    utils.special[keys["ctrl"]] = true;
    utils.special[keys["alt"]] = true;
    utils.special[keys["delete"]] = true;

    utils.navigational[keys["upArrow"]] = true;
    utils.navigational[keys["downArrow"]] = true;
    utils.navigational[keys["leftArrow"]] = true;
    utils.navigational[keys["rightArrow"]] = true;

    listName.addEventListener("keydown", function (event) {
        let len = event.target.innerText.trim().length;
        hasSelection = false;
        selection = window.getSelection();
        isSpecial = utils.isSpecial(event);
        isNavigational = utils.isNavigational(event);

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
    });

    generateList(listId);
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", search);
    document.getElementById("search").addEventListener("keyup", function (e) {
        if (e.keyCode === 13) {
            event.preventDefault();
            search(e);
        }
    });
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
            if (document.getElementById("list-titles")) {
                document.getElementById("list-titles").remove();
            }
            if (data.titles.length === 0) {
                // console.log("empty list");
                document.getElementById("placeholder-text").style.display = "block";
            } else {
                document.getElementById("placeholder-text").style.display = "none";

                nameOfList = data.name;
                const listTitles = document.createElement("div");
                listTitles.setAttribute("id", "list-titles");
                listNetflixIds = [];
                for (let title of data.titles) {
                    listNetflixIds.push(title.netflixId);
                    console.log(title);

                    // div for list title
                    const listTitle = document.createElement("div");
                    listTitle.classList.add("list-title");
                    listTitle.appendChild(document.createElement("HR"));

                    // div for title element
                    const titleEl = document.createElement("div");
                    titleEl.classList.add("list-el");

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

                    //title year
                    const titleYear = document.createElement("p");
                    titleYear.textContent = title.year;
                    titleInfo.appendChild(titleYear);

                    // title synopsis
                    // const titleSyn = document.createElement("p");
                    // titleSyn.textContent = formatText(title.synopsis);
                    // titleInfo.appendChild(titleSyn);

                    titleEl.appendChild(titleInfo);

                    //title delete
                    const deleteFlex = document.createElement("div");
                    deleteFlex.classList.add("delete-title-flex");
                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML = "&times;";
                    deleteBtn.classList = "delete-title-button";

                    deleteBtn.addEventListener(
                        "click",
                        (function (movie) {
                            return function (e) {
                                deleteTitle(e, movie);
                            };
                        })(title)
                    );

                    deleteFlex.appendChild(deleteBtn);
                    titleEl.appendChild(deleteFlex);

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

                            //episode delete
                            const deleteEpBtn = document.createElement("button");
                            deleteEpBtn.innerHTML = "&times;";
                            deleteEpBtn.classList = "delete-title-button";

                            deleteEpBtn.addEventListener(
                                "click",
                                (function (ep) {
                                    return function (e) {
                                        deleteEpisode(e, ep, title);
                                    };
                                })(episode, title)
                            );

                            episodeEl.appendChild(deleteEpBtn);
                            listTitle.appendChild(episodeEl);
                        }
                    }

                    listTitles.appendChild(listTitle);
                }
                document.getElementById("edit-list").appendChild(listTitles);
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
    //if search already on page then clear it
    if (document.getElementById("searchResults")) {
        document.getElementById("searchResults").remove();
    }
    const searchLoader = document.getElementById("search-load");
    searchLoader.style.display = "block";
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
                const { imdbrating, img, nfid, synopsis, title, vtype, year, imdbid } = result;

                let searchResult = document.createElement("div");
                searchResult.classList.add("searchResult");

                // add hr
                searchResult.appendChild(document.createElement("HR"));

                // all title info
                const allTitle = document.createElement("div");
                allTitle.classList.add("all-title-info");

                //

                // image
                let imageEl = document.createElement("img");
                imageEl.src = img;
                imageEl.classList.add("image");
                imageEl.addEventListener(
                    "click",
                    (function (movie) {
                        return function (e) {
                            imageEl.classList.add("clicked");
                            addMovie(e, movie);
                        };
                    })(result)
                );
                allTitle.appendChild(imageEl);

                // to the right of image
                let rightOfImage = document.createElement("div");
                rightOfImage.classList.add("right-of-img");

                // info
                let titleInfo = document.createElement("div");
                titleInfo.classList.add("title-info");

                // title
                let titleEl = document.createElement("p");

                let titleName = document.createElement("span");
                titleName.classList.add("name-el");
                // titleName.textContent = formatText(title);
                titleName.appendChild(document.createTextNode(formatText(title)));
                titleEl.appendChild(titleName);

                let titleYear = document.createElement("span");
                titleYear.classList.add("year-el");
                titleYear.appendChild(document.createTextNode(" " + year));

                titleEl.appendChild(titleYear);

                // titleEl.textContent = formatText(title);
                titleInfo.appendChild(titleEl);

                // year
                // let titleYear = document.createElement("p");
                // titleYear.textContent = year;

                // titleInfo.appendChild(titleYear);

                // imdb rating
                let titleRating = document.createElement("a");
                titleRating.classList.add("rating-el");
                titleRating.href = `http://www.imdb.com/title/${imdbid}`;
                titleRating.target = "_blank";
                titleRating.innerHTML = `<i class='fas fa-star'></i> ${
                    imdbrating ? imdbrating : "N/A"
                }`;
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

                rightOfImage.appendChild(buttons);
                allTitle.appendChild(rightOfImage);

                // show episdoes button
                if (vtype === "series") {
                    const showBtn = document.createElement("button");
                    showBtn.type = "submit";
                    const showText = document.createElement("p");
                    showText.textContent = "show episodes";
                    showBtn.appendChild(showText);
                    showBtn.innerHTML = showBtn.innerHTML + '<span class="icon-chevron"></span>';
                    showBtn.classList.add("show-episodes");

                    // pass object into event listener
                    showBtn.addEventListener(
                        "click",
                        (function (id) {
                            return function (e) {
                                showEpisodes(e, id, result);
                            };
                        })(nfid)
                    );
                    // buttons.appendChild(showBtn);

                    // chevron button
                    // showEpisodesEl.appendChild(showBtn);
                    allTitle.appendChild(showBtn);
                }

                searchResult.appendChild(allTitle);

                // add to all searches
                searchResults.appendChild(searchResult);
            }

            // add search results to document. if one already exists, remove it

            searchLoader.style.display = "none";
            document.querySelector("#left-search").appendChild(searchResults);
        })
        .catch((err) => {
            console.log(err);
        });
}

function showEpisodes(evt, id, show) {
    evt.preventDefault();
    const parentEl = evt.path[3];

    if (parentEl.querySelector("#seasons") == null) {
        //hide button
        evt.path[1].style.display = "none";

        //add loader
        const episodeLoader = document.createElement("div");
        episodeLoader.setAttribute("id", "episode-load");
        evt.path[2].appendChild(episodeLoader);

        // evt.path[0].disabled = true;
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
                evt.path[2].removeChild(episodeLoader);
                evt.path[1].style.display = "block";
                parentEl.appendChild(allSeasonsEl);
                evt.path[1].childNodes[0].textContent = "hide episodes";
                evt.path[0].style.transform = "rotate(180deg)";
            })
            .catch((err) => {
                console.log(err);
            });
    } else if (parentEl.querySelector("#seasons").style.display === "none") {
        parentEl.querySelector("#seasons").style.display = "block";
        evt.path[1].childNodes[0].textContent = "hide episodes";
        console.log(evt.path);
        evt.path[0].style.transform = "rotate(180deg)";
    } else {
        parentEl.querySelector("#seasons").style.display = "none";
        evt.path[1].childNodes[0].textContent = "show episodes";
        evt.path[0].style.transform = "rotate(0deg)";
    }
}

function deleteTitle(evt, title) {
    const delTitle = title.netflixId;
    fetch(`/delete/${listId}/${delTitle}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json().then(generateList(listId)));
}

function deleteEpisode(evt, episode, title) {
    console.log(title);
    const delTitle = title.netflixId;
    const delEpisode = episode.netflixId;
    fetch(`/delete/${listId}/${delTitle}/${delEpisode}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json().then(generateList(listId)));
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
            year: movieRaw.year,
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
