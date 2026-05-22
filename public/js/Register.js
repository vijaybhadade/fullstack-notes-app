const form = document.querySelector('#Form');
const login = document.querySelector('#Login');

login.addEventListener('click', () => {
    window.location.href = "Login.html";
});

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.querySelector('#Username').value.trim();
    const email = document.querySelector('#Email').value.trim();
    const age = Number(document.querySelector('#Age').value);
    const password = document.querySelector('#Password').value;
    const confirmPassword = document.querySelector('#Confirm-Password').value;

    if (!username || !email || !password || !age || !confirmPassword) {
        alert("All fields are required");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    

    try {
        const response = await fetch("http://localhost:3000/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, age, password })
        });


        if (response.ok) {
            const data = await response.json();
            console.log(data);
            alert("User registered successfully");
            form.reset();
        }
        else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }

    } catch (error) {
        console.log(error.message);
        alert("server Error");
    }
});