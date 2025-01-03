document.addEventListener("DOMContentLoaded", () => {
    // Üniversite ekleme
    preventDuplicateEventListener("add-university-form", function (event) {
        event.preventDefault();
        const universityName = document.getElementById("university-name").value.trim();
        if (!universityName) {
            alert("University name cannot be empty!");
            return;
        }

        fetch(`${apiUrl}/add-university`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: universityName })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add university");
                return response.json();
            })
            .then(data => {
                alert(data.message);
                document.getElementById("add-university-form").reset();
            })
            .catch(error => console.error("Error adding university:", error));
    });

    // Enstitü ekleme
    preventDuplicateEventListener("add-institute-form", function (event) {
        event.preventDefault();
        const instituteName = document.getElementById("institute-name").value.trim();
        if (!instituteName) {
            alert("Institute name cannot be empty!");
            return;
        }

        fetch(`${apiUrl}/add-institute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: instituteName })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add institute");
                return response.json();
            })
            .then(data => {
                alert(data.message);
                document.getElementById("add-institute-form").reset();
            })
            .catch(error => console.error("Error adding institute:", error));
    });

    // Yazar ekleme
    preventDuplicateEventListener("add-author-form", function (event) {
        event.preventDefault();
        const authorName = document.getElementById("author-name").value.trim();
        if (!authorName) {
            alert("Author name cannot be empty!");
            return;
        }

        fetch(`${apiUrl}/add-author`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: authorName })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add author");
                return response.json();
            })
            .then(data => {
                alert(data.message);
                document.getElementById("add-author-form").reset();
            })
            .catch(error => console.error("Error adding author:", error));
    });
});