async function sendMessage() {
  const userInput = document.getElementById("userInput").value;
  const payload = {
    model: "phi3",
    messages: [{ role: "user", content: userInput }],
  };

  // Clear previous response and show the response container
  document.getElementById("response").textContent = "";
  document.getElementById("response-container").style.display = "block";

  const response = await fetch("https://80f9-180-244-128-79.ngrok-free.app/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    document.getElementById("response").textContent = result;
  }
}
