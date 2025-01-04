// API adresini tek bir yerde tanımlayalım
const apiUrl = "http://127.0.0.1:5000";

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
        })
        .catch(error => console.error(`Error fetching ${textKey}s:`, error));
}

// Çakışmayı önleyen event listener
function preventDuplicateEventListener(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;
    if (!form.dataset.listenerAdded) {
        form.addEventListener("submit", callback);
        form.dataset.listenerAdded = "true";
    }
}
 document.addEventListener("DOMContentLoaded", () => {
    // localStorage'da "loggedIn" varsa kullanıcı login olmuş demektir
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    // Linkleri DOM'dan yakalayalım
    const manageLink = document.getElementById("manage-theses-link");
    const addLink = document.getElementById("add-entities-link");
    const deleteLink = document.getElementById("delete-entities-link");

    // Eğer login değilse bu linkleri pasif hale getir
    if (!isLoggedIn) {
    manageLink.classList.add("disabled");
    addLink.classList.add("disabled");
    deleteLink.classList.add("disabled");
}
    // Eğer login ise, bu üç link aktif kalsın (yani .disabled yok)
    else {
    manageLink.classList.remove("disabled");
    addLink.classList.remove("disabled");
    deleteLink.classList.remove("disabled");
}
});
