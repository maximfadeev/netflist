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
