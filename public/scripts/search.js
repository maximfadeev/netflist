const listId = window.location.pathname.split("/")[3];
let listNetflixIds = [];

document.addEventListener("DOMContentLoaded", function () {
    generateList(listId);
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", search);
});

function generateList(listId) {
    fetch(`/list/${listId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then(function (data) {
            if (data.titles.length === 0) {
                console.log("empty list");
            } else {
                const listTitles = document.createElement("div");
                // listTitles.classList.add("list-titles");
                listTitles.setAttribute("id", "list-titles");
                listNetflixIds = [];
                for (let title of data.titles) {
                    listNetflixIds.push(title.netflixId);

                    const titleEl = document.createElement("div");

                    const titleTitle = document.createElement("h3");
                    titleTitle.textContent = title.title;
                    titleEl.appendChild(titleTitle);

                    const titleImg = document.createElement("img");
                    titleImg.src = title.image;
                    titleEl.appendChild(titleImg);

                    listTitles.appendChild(titleEl);
                }
                if (document.getElementById("list-titles")) {
                    document.getElementById("list-titles").remove();
                }
                document.getElementById("list-element").appendChild(listTitles);
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
                // const image = result.img;
                // const title = result.title;
                // const type = result.vtype;
                // const netflixId = result.nfid;
                // const imdbRate = result.imdbrating;

                const { clist, imdbrating, img, nfid, synopsis, title, vtype } = result;

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
                allTitle.appendChild(imageEl);

                // to the right of image
                let rightOfImage = document.createElement("div");
                rightOfImage.classList.add("right-of-img");

                // info
                let titleInfo = document.createElement("div");
                titleInfo.classList.add("title-info");

                // title
                let titleEl = document.createElement("h2");
                titleEl.textContent = title;
                titleInfo.appendChild(titleEl);

                // imdb rating
                let titleRating = document.createElement("h3");
                titleRating.textContent = imdbrating;
                titleInfo.appendChild(titleRating);

                // synopsis
                let titleSynopsis = document.createElement("p");
                titleSynopsis.textContent = synopsis;
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
                                showEpisodes(e, id);
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

function showEpisodes(evt, id) {
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
                console.log(evt.path);
                let allSeasonsEl = document.createElement("div");
                allSeasonsEl.classList.add("seasons");
                allSeasonsEl.setAttribute("id", "seasons");
                for (const season of data) {
                    // add season number
                    let seasonEl = document.createElement("div");
                    seasonEl.classList.add("season");
                    let seasonTitle = document.createElement("h2");
                    seasonTitle.textContent = "Season " + season.season;
                    allSeasonsEl.appendChild(seasonTitle);
                    // add epsiodes
                    for (const episode of season.episodes) {
                        let episodeEl = document.createElement("div");
                        episodeEl.classList.add("episode");

                        // add episode title
                        let episodeTitle = document.createElement("h3");
                        episodeTitle.textContent = episode.title;
                        episodeEl.appendChild(episodeTitle);

                        // add episode image
                        let episodeImage = document.createElement("img");
                        episodeImage.src = episode.img;
                        episodeEl.appendChild(episodeImage);

                        // add button
                        let addBtn = document.createElement("input");
                        addBtn.type = "button";
                        addBtn.value = "add";
                        addBtn.addEventListener(
                            "click",
                            (function (titleObject) {
                                return function (e) {
                                    // titleObject.show =
                                    addTitle(e, titleObject);
                                };
                            })(episode)
                        );
                        episodeEl.appendChild(addBtn);

                        seasonEl.appendChild(episodeEl);
                    }
                    allSeasonsEl.appendChild(seasonEl);
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
    // console.log("addTitle -> titleObject", titleObject.keys.length);

    let nItem = {};

    if (Object.keys(titleObject).length <= 7) {
        console.log("episode");
        nItem = {
            title: titleObject.title,
            netflixId: titleObject.epid,
            synopsis: titleObject.synopsis,
            image: titleObject.img,
            season: titleObject.seasnum,
            episode: titleObject.epnum,
        };
    } else {
        console.log("movie");
        nItem = {
            title: titleObject.title,
            netflixId: titleObject.nfid,
            synopsis: titleObject.synopsis,
            image: titleObject.img,
        };
    }

    console.log("nitem", nItem);

    if (listNetflixIds.includes(nItem.netflixId)) {
        alert("already in");
    }

    evt.path[0].disabled = true;
    const options = {
        method: "POST",
        // mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nItem),
    };
    fetch(window.location.pathname, options).then(generateList(listId));
}
