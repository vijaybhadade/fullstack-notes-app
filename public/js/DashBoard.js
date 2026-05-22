let allNotes = [];
const token = localStorage.getItem("token");
const search = document.querySelector('.search-input');


search.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    let result = allNotes.filter(data =>
        data.title.toLowerCase().includes(query) || data.content.toLowerCase().includes(query)
    );
   
    renderNotes(result);
});


function renderNotes(notesArray) {
    const list = document.getElementById("listOfNotes");
    list.innerHTML = ""; // Clear old UI first

    if (!Array.isArray(notesArray)) {
        console.log("Invalid data passed to renderer:", notesArray);
        list.innerHTML = "<p>Error loading notes</p>";
        return;
    }

    if (notesArray.length === 0) {
        list.innerHTML = "<p>No notes found</p>";
        return;
    }

    notesArray.forEach(note => {
        const card = document.createElement("div");
        card.classList.add("note-card");

        // Title
        const title = document.createElement("h2");
        title.textContent = note.title;

        // Content
        const content = document.createElement("p");
        content.textContent = note.content;

        // Date
        const date = document.createElement("small");
        date.classList.add("date");
        const formattedDate = note.created_at ? new Date(note.created_at).toLocaleString() : "N/A";
        date.textContent = "Created At: " + formattedDate;

        // Edit button 
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editNotes(note.id, note.title, note.content);

        // Delete button 
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteNotes(note.id);

        // Group buttons
        const btnGroup = document.createElement("div");
        btnGroup.classList.add("btn-group");
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);

        // Append everything to card
        card.appendChild(title);
        card.appendChild(content);
        card.appendChild(date);
        card.appendChild(btnGroup);
        
        // Append card to list
        list.appendChild(card);
    });
}

// Protect dashboard
if (!token) {
    window.location.href = "/Form.html";
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "/Form.html";
}

// Add or Update Notes
function addNote() {
    const title = document.getElementById("title-input").value;
    const content = document.getElementById("content-input").value;
    const btn = document.getElementById("Add-btn");

    if (!title || !content) {
        alert("All fields required");
        return;
    }

    // UPDATE NOTES
    if (window.editingId) {
        btn.disabled = true;
        btn.textContent = "Saving...";

        fetch(`/notes/${window.editingId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                return res.json();
            })
            .then(() => {
                showMessage("Note updated");
                cancelEdit();
                loadNotes();
            })
            .catch(err => {
                console.log(err);
                showMessage("Update failed", "red");
                btn.disabled = false;
                btn.textContent = "Update Note";
            });
    }
    // ADD NOTES
    else {
        btn.disabled = true;
        btn.textContent = "Saving...";

        fetch("/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to add note");
                return res.json();
            })
            .then(() => {
                showMessage("Note added");
                btn.disabled = false;
                btn.textContent = "Add Note";
                document.getElementById("title-input").value = "";
                document.getElementById("content-input").value = "";
                loadNotes();
            })
            .catch(err => {
                console.log(err);
                showMessage("Error adding note", "red");
                btn.disabled = false;
                btn.textContent = "Add Note";
            });
    }
}

// Function to populate inputs for editing
function editNotes(id, title, content) {
    document.getElementById("title-input").value = title;
    document.getElementById("content-input").value = content;

    const btn = document.getElementById("Add-btn");
    btn.textContent = "Update Note";
    const cancelBtn = document.getElementById("Cancel-btn");
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    window.editingId = id;
}

// Function to delete notes
function deleteNotes(id) {
    if (!confirm("Are you sure want to delete this note?")) return;
    fetch(`/notes/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("Delete Failed");
            showMessage("Note deleted");
            loadNotes();
        })
        .catch(err => showMessage("Error deleting note", "red"));
}

// Load dashboard notes initially
window.onload = loadNotes;

// 🎯 DATA FETCHING LAYER (Does not touch DOM generation anymore)
function loadNotes() {
    const list = document.getElementById("listOfNotes");
    list.innerHTML = "<p>Loading...</p>";

    fetch("/notes", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        allNotes = data;           // Store globally for search filtering
        renderNotes(allNotes);     // Hand off rendering to the dedicated function
    })
    .catch(err => {
        console.log(err);
        list.innerHTML = "<p>Error loading notes</p>";
    });
}

// Show feedback message
function showMessage(msg, color = "green") {
    const message = document.createElement("p");
    message.textContent = msg;
    message.style.color = color;
    document.body.prepend(message);
    setTimeout(() => message.remove(), 2000);
}

// Cancel editing and clear fields
function cancelEdit() {
    document.getElementById("title-input").value = "";
    document.getElementById("content-input").value = "";
    window.editingId = null;

    const cancelBtn = document.getElementById("Cancel-btn");
    const btn = document.getElementById("Add-btn");
    btn.textContent = "Add Note";
    if (cancelBtn) cancelBtn.classList.add('hidden');
}