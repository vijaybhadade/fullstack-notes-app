const form = document.querySelector('#loginForm');

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  if (!email || !password) {
    alert("all fields required");
    return;
  }

  fetch("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      console.log("Login response status:", res.status); 
      if (!res.ok) {
        throw new Error("login failed");
      }
      return res.json();
    })
    .then(data => {
      console.log("Login data:", data); 

      localStorage.setItem("token", data.token);

      //  redirect and STOP
      window.location.href = "./DashBoard.html";
    })
    .catch(err => {
      console.log("Error:", err.message);
      alert("Login failed");
    });
});