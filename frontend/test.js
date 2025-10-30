async function checkServer() {

  word = document.createElement("p");
  word.setAttribute("class", "serverCenter");

  try {
    const response = await fetch("http://localhost:8080");
    const text = await response.text();
    console.log("Server response:", text);
    console.log("Server is up! ");
    word.textContent = "Server good: response: " + Text;
  } catch (error) {
    console.error("Server is down ", error);
    word.textContent = "Server good: response: " + error;
  }

  document.body.appendChild(word);

}

checkServer();