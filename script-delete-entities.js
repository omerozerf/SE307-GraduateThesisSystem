document.addEventListener("DOMContentLoaded", () => {
    // Silme menülerini doldur
    fetchDropdown(`${apiUrl}/authors`, "delete-author-dropdown", "authorid", "name");
    fetchDropdown(`${apiUrl}/universities`, "delete-university-dropdown", "universityid", "name");
    fetchDropdown(`${apiUrl}/institutes`, "delete-institute-dropdown", "instituteid", "name");

    // Silme butonlarını bağla
    setupDeleteButton("delete-university-button", "delete-university-dropdown", "university");
    setupDeleteButton("delete-institute-button", "delete-institute-dropdown", "institute");
    setupDeleteButton("delete-author-button", "delete-author-dropdown", "author");
});

function setupDeleteButton(buttonId, dropdownId, type) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener("click", () => {
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
                // Yeniden dropdownları güncelle
                fetchDropdown(`${apiUrl}/authors`, "delete-author-dropdown", "authorid", "name");
                fetchDropdown(`${apiUrl}/universities`, "delete-university-dropdown", "universityid", "name");
                fetchDropdown(`${apiUrl}/institutes`, "delete-institute-dropdown", "instituteid", "name");
            })
            .catch(error => console.error(`Error deleting ${type}:`, error));
    });
}