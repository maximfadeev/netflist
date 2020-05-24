document.addEventListener("DOMContentLoaded", function () {
    const btnList = document.getElementsByTagName("input");
    for (let btn of btnList) {
        btn.addEventListener("click", function (evt) {
            evt.preventDefault();
            // console.log(JSON.parse(btn.nextSibling.nextSibling.textContent));
            btn.disabled = true;
            btn.value = "added";
        });
    }
});
