document.addEventListener("DOMContentLoaded", function () {
    // document.getElementById("edit-lists").addEventListener("click", editLists);
    const delBtns = document.getElementsByClassName("delete-btn");
    // Array.prototype.forEach.call(delBtns, function (btn) {
    //     console.log("ya");
    //     btn.addEventListener("click", deleteButton);
    // });
});

function deleteButton(listId) {
    console.log("clicked");
    console.log(listId);
    fetch(`/delete/list/${listId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
}

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
            if (data.titles.length === 0) {
                console.log("empty list");
            } else {
                if (document.getElementById("list-titles")) {
                    document.getElementById("list-titles").remove();
                }

                // all encompassing element
                const listTitles = document.createElement("div");
                listTitles.setAttribute("id", "list-titles");

                // list name wrapper
                const listNameWrap = document.createElement("div");
                listNameWrap.setAttribute("id", "list-name-wrap");

                // list name
                const listName = document.createElement("p");
                listName.textContent = data.name;

                listNameWrap.appendChild(listName);
                listTitles.appendChild(listNameWrap);

                // edit button
                const editBtnLink = document.createElement("a");
                editBtnLink.setAttribute("href", `/edit/list/${data._id}`);
                const editBtn = document.createElement("input");
                editBtn.setAttribute("type", "button");
                editBtn.value = "edit list";
                editBtnLink.appendChild(editBtn);
                listTitles.appendChild(editBtnLink);

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
                document.getElementById("right").appendChild(listTitles);
                // document.getElementById("list-titles").scrollTop = document.getElementById(
                //     "list-titles"
                // ).scrollHeight;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
