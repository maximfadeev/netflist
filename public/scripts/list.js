let shows = [];

function formatText(text) {
    return text.replace(/&#39;/g, "'");
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
            // document.getElementById("text-line").value = data.name;

            if (data.titles.length === 0) {
                console.log("empty list");
            } else {
                if (document.getElementById("list")) {
                    document.getElementById("list").remove();
                }

                // all encompassing div
                const listEl = document.createElement("div");
                listEl.setAttribute("id", "list");

                // list name
                const listName = document.createElement("h2");
                listName.setAttribute("id", "list-name");
                listName.textContent = data.name;
                listEl.appendChild(listName);

                // edit list link
                const editLink = document.createElement("a");
                editLink.textContent = "edit list";
                editLink.setAttribute("href", `/edit/list/${listId}`);
                listEl.appendChild(editLink);

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

                    //image link
                    const imgLink = document.createElement("a");
                    imgLink.setAttribute("href", `http://www.netflix.com/watch/${title.netflixId}`);
                    imgLink.setAttribute("target", "_blank");

                    // title image
                    const titleImg = document.createElement("img");
                    titleImg.src = title.image;
                    titleImg.onerror = function (e) {
                        this.src = "/images/no_image.png";
                    };
                    titleImg.classList.add("image");

                    imgLink.appendChild(titleImg);
                    titleEl.appendChild(imgLink);

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
                listEl.appendChild(listTitles);
                document.getElementById("right").appendChild(listEl);
                document.getElementById("list").scrollTop = document.getElementById(
                    "list-titles"
                ).scrollHeight;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
