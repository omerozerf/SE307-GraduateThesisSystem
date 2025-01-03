document.addEventListener("DOMContentLoaded", () => {
    // dropdown’ları doldur
    fetchDropdown(`${apiUrl}/authors`, "authorid", "authorid", "name");
    fetchDropdown(`${apiUrl}/universities`, "universityid", "universityid", "name");
    fetchDropdown(`${apiUrl}/institutes`, "instituteid", "instituteid", "name");

    // Tüm tezleri listele
    getTheses();

    // Yeni tez eklerken mi düzenlerken mi olduğumuzu tutacak değişken
    let editingThesisId = null;

    // Form referansları
    const addThesisForm = document.getElementById("add-thesis-form");
    const formTitle = document.getElementById("form-title");
    const submitButton = document.getElementById("submit-button");

    // Tez ekleme / güncelleme form submit
    preventDuplicateEventListener("add-thesis-form", event => {
        event.preventDefault();

        const thesisData = {
            title: document.getElementById("title").value,
            abstract: document.getElementById("abstract").value,
            authorid: document.getElementById("authorid").value,
            year: document.getElementById("year").value,
            type: document.getElementById("type").value,
            universityid: document.getElementById("universityid").value,
            instituteid: document.getElementById("instituteid").value,
            numberofpages: document.getElementById("numberofpages").value,
            language: document.getElementById("language").value,
            submissiondate: document.getElementById("submissiondate").value
        };

        // Eğer edit modundaysak (editingThesisId null değil)
        if (editingThesisId) {
            fetch(`${apiUrl}/update-thesis/${editingThesisId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(thesisData)
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to update thesis");
                    return response.json();
                })
                .then(data => {
                    alert(data.message);
                    // Formu sıfırla
                    addThesisForm.reset();
                    editingThesisId = null; // Artık edit modundan çıkıyoruz
                    formTitle.textContent = "Add New Thesis";
                    submitButton.textContent = "Add Thesis";
                    // Listeyi güncelle
                    getTheses();
                })
                .catch(error => console.error("Error updating thesis:", error));
        } else {
            // Yeni tez ekle
            fetch(`${apiUrl}/add-thesis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(thesisData)
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to add thesis");
                    return response.json();
                })
                .then(data => {
                    alert(data.message);
                    addThesisForm.reset();
                    getTheses();
                })
                .catch(error => console.error("Error adding thesis:", error));
        }
    });

    // Tüm tezleri listeleme fonksiyonu
    function getTheses() {
        fetch(`${apiUrl}/theses`)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch theses");
                return response.json();
            })
            .then(data => {
                const tbody = document.querySelector("#thesis-list tbody");
                if (!tbody) return;
                tbody.innerHTML = ""; // tabloyu sıfırla

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

    // editThesis ve deleteThesis fonksiyonlarını global scope’a atıyoruz ki HTML içinden çağrılabilsin
    window.editThesis = function(id) {
        // Şu an senin backend’inde GET /theses/<id> şeklinde tekil tez çeken endpoint yok.
        // O yüzden placeholder olarak, “düzenle moduna” manuel geçiyoruz:
        editingThesisId = id;
        formTitle.textContent = "Edit Thesis (ID: " + id + ")";
        submitButton.textContent = "Update Thesis";

        alert(
            "Şu an single-thesis endpoint yok. Formu manual doldurup Update diyebilirsin.\n" +
            "İstersen /theses/<id> (GET) endpoint'ini ekleyerek buraya tez verisini çekebilirsin."
        );
    };

    window.deleteThesis = function(id) {
        if (!confirm("Are you sure you want to delete this thesis?")) return;

        fetch(`${apiUrl}/delete-thesis/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to delete thesis");
                return response.json();
            })
            .then(data => {
                alert(data.message);
                getTheses();
            })
            .catch(error => console.error("Error deleting thesis:", error));
    };
});