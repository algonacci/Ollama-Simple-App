async function sendMessage() {
  const userInput = document.getElementById("userInput").value;
  const requestBody = {
    model: "phi3",
    messages: [{ role: "user", content: userInput }],
  };

  // Clear previous response and show the response container
  document.getElementById("response").textContent = "";
  document.getElementById("response-container").style.display = "block";

  try {
    const response = await fetch("https://2ee4-180-244-128-79.ngrok-free.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let jsonString = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      jsonString += decoder.decode(value, { stream: true });

      // Process complete JSON objects
      let boundary = jsonString.lastIndexOf("}\n");
      if (boundary !== -1) {
        let validJSON = jsonString.substring(0, boundary + 1);
        jsonString = jsonString.substring(boundary + 1);

        validJSON.split("\n").forEach((json) => {
          if (json.trim().length > 0) {
            try {
              const parsedData = JSON.parse(json);
              document.getElementById("response").textContent += parsedData.message.content;
            } catch (e) {
              console.error("Error parsing JSON: ", e);
            }
          }
        });
      }
    }

    // Handle any remaining data
    if (jsonString.trim().length > 0) {
      try {
        const parsedData = JSON.parse(jsonString);
        document.getElementById("response").textContent += parsedData.message.content;
      } catch (e) {
        console.error("Error parsing JSON: ", e);
      }
    }
  } catch (error) {
    document.getElementById("response").textContent = "Error: " + error.message;
  }
}
