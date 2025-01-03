document.addEventListener("DOMContentLoaded", () => {
    // Dropdownları doldur (yazar için)
    fetchDropdown(`${apiUrl}/authors`, "search-author", "authorid", "name");

    // Arama formu
    preventDuplicateEventListener("search-theses-form", event => {
        event.preventDefault();

        const author = document.getElementById("search-author").value;
        const keywords = document.getElementById("search-keywords").value.trim();
        const year = document.getElementById("search-year").value;
        const type = document.getElementById("search-type").value;

        fetch(`${apiUrl}/search-theses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ author, keywords, year, type })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to search theses");
                return response.json();
            })
            .then(data => {
                const tbody = document.querySelector("#thesis-list tbody");
                tbody.innerHTML = "";
                data.forEach(thesis => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
            <td>${thesis.thesisid}</td>
            <td>${thesis.title}</td>
            <td>${thesis.abstract}</td>
            <td>${thesis.authorname || "Unknown Author"}</td>
            <td>${thesis.year}</td>
            <td>${thesis.type}</td>
            <td>${thesis.universityname || "Unknown University"}</td>
            <td>${thesis.institutename || "Unknown Institute"}</td>
            <td>${thesis.numberofpages || ""}</td>
            <td>${thesis.language}</td>
            <td>${thesis.submissiondate}</td>
            <td>
              <button onclick="editThesis(${thesis.thesisid})">Edit</button>
              <button onclick="deleteThesis(${thesis.thesisid})">Delete</button>
            </td>
          `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => console.error("Error searching theses:", error));
    });
});

// Tez düzenleme ve silme için fonksiyonlar burada olabilir.
// Şimdilik place-holder olarak bırakıyoruz:
function editThesis(id) {
    alert(`Edit Thesis with ID: ${id}`);
}

function deleteThesis(id) {
    alert(`Delete Thesis with ID: ${id}`);
}