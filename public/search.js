document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", search);
});

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
                const image = result.img;
                const title = result.title;
                const type = result.vtype;
                const netflixId = result.nfid;

                let searchResult = document.createElement("div");
                searchResult.classList.add("searchResult");

                // add hr
                searchResult.appendChild(document.createElement("HR"));

                // title
                let titleEl = document.createElement("h2");
                titleEl.textContent = title;
                searchResult.appendChild(titleEl);

                // image
                let imageEl = document.createElement("img");
                imageEl.src = image;
                searchResult.appendChild(imageEl);

                // add buttons
                let addBtn = document.createElement("input");
                addBtn.type = "button";
                addBtn.value = "add";
                addBtn.addEventListener(
                    "click",
                    (function (titleObject) {
                        return function (e) {
                            addTitle(e, titleObject);
                        };
                    })(result)
                );

                let showBtn = document.createElement("input");
                showBtn.type = "button";
                showBtn.value = "show episodes";
                // pass object into event listener
                showBtn.addEventListener(
                    "click",
                    (function (id) {
                        return function (e) {
                            showEpisodes(e, id);
                        };
                    })(netflixId)
                );

                searchResult.appendChild(addBtn);
                searchResult.appendChild(showBtn);

                // add to all searches
                searchResults.appendChild(searchResult);
            }

            // add search results to document. if one already exists, remove it
            if (document.getElementById("searchResults")) {
                document.getElementById("searchResults").remove();
            }
            document.body.appendChild(searchResults);
        })
        .catch((err) => {
            console.log(err);
        });
}

function showEpisodes(evt, id) {
    evt.preventDefault();
    fetch(`https://unogsng.p.rapidapi.com/episodes?netflixid=${id}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "unogsng.p.rapidapi.com",
            "x-rapidapi-key": "b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07",
        },
    })
        .then((response) => response.json())
        .then(function (data) {
            console.log(data);
            const parentEl = evt.path[1];
            let allSeasonsEl = document.createElement("div");
            allSeasonsEl.classList.add("seasons");
            for (const season of data) {
                // add season number
                let seasonEl = document.createElement("div");
                seasonEl.classList.add("season");
                let seasonTitle = document.createElement("h2");
                seasonTitle.textContent = "Season " + season.season;
                seasonEl.appendChild(seasonTitle);
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

                    seasonEl.appendChild(episodeEl);
                }
                allSeasonsEl.appendChild(seasonEl);
            }
            parentEl.appendChild(allSeasonsEl);
            evt.path[0].disabled = true;
        })
        .catch((err) => {
            console.log(err);
        });
}

function addTitle(evt, titleObject) {
    evt.preventDefault();
    console.log(titleObject);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(titleObject),
    };
    fetch(window.location.pathname, options);
}
