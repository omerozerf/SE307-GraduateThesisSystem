const apiUrl = "http://127.0.0.1:5000";

// Sayfa yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", function () {
    loadDropdownsForDeletion();
    setupDeleteButtons();
    getTheses();
    loadDropdowns();
});

// Arama formu için event listener
preventDuplicateEventListener("search-theses-form", function (event) {
    event.preventDefault();

    // Form verilerini alın
    const author = document.getElementById("search-author").value;
    const keywords = document.getElementById("search-keywords").value.trim();
    const year = document.getElementById("search-year").value;
    const type = document.getElementById("search-type").value;

    // Arama kriterlerini API'ye gönder
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
            tbody.innerHTML = ""; // Önceki içeriği temizle
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

// Tezleri getir ve listele
function getTheses() {
    fetch(`${apiUrl}/theses`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch theses");
            return response.json();
        })
        .then(data => {
            const tbody = document.querySelector("#thesis-list tbody");
            tbody.innerHTML = ""; // Önceki içeriği temizle
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
        .catch(error => console.error("Error fetching theses:", error));
}

// Dropdown menüleri doldur
function loadDropdowns() {
    fetchDropdown(`${apiUrl}/authors`, "authorid", "authorid", "name");
    fetchDropdown(`${apiUrl}/universities`, "universityid", "universityid", "name");
    fetchDropdown(`${apiUrl}/institutes`, "instituteid", "instituteid", "name");

    // Search Author dropdown doldurma
    fetchDropdown(`${apiUrl}/authors`, "search-author", "authorid", "name");
}

// Silme işlemleri için dropdownları doldur
function loadDropdownsForDeletion() {
    fetchDropdown(`${apiUrl}/authors`, "delete-author-dropdown", "authorid", "name");
    fetchDropdown(`${apiUrl}/universities`, "delete-university-dropdown", "universityid", "name");
    fetchDropdown(`${apiUrl}/institutes`, "delete-institute-dropdown", "instituteid", "name");
}

// Dropdown doldurucu
function fetchDropdown(url, elementId, valueKey, textKey) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return response.json();
        })
        .then(data => {
            const dropdown = document.getElementById(elementId);
            if (!dropdown) {
                console.error(`Dropdown with ID '${elementId}' not found.`);
                return;
            }
            dropdown.innerHTML = `<option value="">Select ${textKey}</option>`;
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item[valueKey];
                option.textContent = item[textKey];
                dropdown.appendChild(option);
            });
            console.log(`Dropdown '${elementId}' populated successfully.`);
        })
        .catch(error => console.error(`Error fetching ${textKey}s:`, error));
}

// Yeni yazar ekleme
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
            loadDropdowns();
        })
        .catch(error => console.error("Error adding author:", error));
});

// Silme butonlarını ayarla
function setupDeleteButtons() {
    setupDeleteButton("delete-university-button", "delete-university-dropdown", "university");
    setupDeleteButton("delete-institute-button", "delete-institute-dropdown", "institute");
    setupDeleteButton("delete-author-button", "delete-author-dropdown", "author");
}

function setupDeleteButton(buttonId, dropdownId, type) {
    document.getElementById(buttonId).addEventListener("click", function () {
        const id = document.getElementById(dropdownId).value;
        if (!id) {
            alert(`Please select a ${type} to delete.`);
            return;
        }

        fetch(`${apiUrl}/delete-${type}/${id}`, { method: "DELETE" })
            .then(response => {
                if (!response.ok) throw new Error(`Failed to delete ${type}`);
                return response.json();
            })
            .then(data => {
                alert(data.message);
                loadDropdownsForDeletion();
            })
            .catch(error => console.error(`Error deleting ${type}:`, error));
    });
}

// Çakışmayı önleyen event listener
function preventDuplicateEventListener(formId, callback) {
    const form = document.getElementById(formId);
    if (!form.dataset.listenerAdded) {
        form.addEventListener("submit", callback);
        form.dataset.listenerAdded = "true";
    }
}