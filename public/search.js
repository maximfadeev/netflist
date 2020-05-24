document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchBtn");
    searchButton.addEventListener("click", function (evt) {
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
                let searchResults = document.createElement("div");
                searchResults.setAttribute("id", "searchResults");
                for (result of data.results) {
                    let searchResult = document.createElement("div");
                    searchResult.classList.add("searchResult");
                    let image = document.createElement("img");
                    image.src = result.img;
                    searchResult.appendChild(image);
                    searchResults.appendChild(searchResult);
                }
                if (document.getElementById("searchResults")) {
                    document.getElementById("searchResults").remove();
                }
                document.body.appendChild(searchResults);
            })
            .catch((err) => {
                console.log(err);
            });
    });
});
