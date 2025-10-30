//back end connetiong thing
const BACKEND_URL = "http://localhost:8080";

// API CALL FUNCTIONS


// Get representatives 5calls
async function getRepresentatives(address) {
  try {
    console.log("Sending address to backend:", address);
    
    const response = await fetch(`${BACKEND_URL}/api/lookup_reps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: address })
    });
    
    const data = await response.json();
    console.log("Backend response status:", response.status);
    console.log("Backend response data:", data);
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch representatives",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching representatives:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}

// Get representatives from google
async function getGoogleRepresentatives(address) {
  try {
    console.log("Getting Google representatives for:", address);
    
    const response = await fetch(`${BACKEND_URL}/api/google_reps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: address })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch representatives from Google",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching Google representatives:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}

// Get voter information another api
async function getVoterInfo(address) {
  try {
    console.log("Getting voter info for:", address);
    
    const response = await fetch(`${BACKEND_URL}/api/voter_info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: address })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch voter info",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching voter info:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}

// Get upcoming elections
async function getElections() {
  try {
    console.log("Getting upcoming elections");
    
    const response = await fetch(`${BACKEND_URL}/api/elections`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch elections",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching elections:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}

// Get recent Congressional bills
async function getBills() {
  try {
    console.log("Getting recent bills");
    
    const response = await fetch(`${BACKEND_URL}/api/bills`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch bills",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching bills:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}

// Get Congress members
async function getCongressMembers() {
  try {
    console.log("Getting Congress members");
    
    const response = await fetch(`${BACKEND_URL}/api/members`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: true,
        message: data.error || "Failed to fetch Congress members",
        details: data
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error fetching Congress members:", error);
    return {
      error: true,
      message: error.message,
      details: error
    };
  }
}


// DISPLAY FUNCTIONS


// Display representatives on the page
function displayRepresentatives(data) {
  let resultsContainer = document.getElementById("results");
  
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = "results";
    resultsContainer.className = "centerPage";
    
    const finalText = document.getElementById("finalText");
    if (finalText && finalText.parentNode) {
      finalText.parentNode.insertBefore(resultsContainer, finalText.nextSibling);
    } else {
      document.body.appendChild(resultsContainer);
    }
  }
  
  resultsContainer.innerHTML = "";
  
  // Handle errors
  if (data.error) {
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "red";
    errorDiv.style.padding = "20px";
    errorDiv.style.border = "2px solid red";
    errorDiv.style.borderRadius = "8px";
    errorDiv.style.margin = "20px auto";
    errorDiv.style.maxWidth = "700px";
    errorDiv.style.backgroundColor = "#fff5f5";
    
    let errorHtml = `
      <h3> Error</h3>
      <p><strong>Message:</strong> ${data.message}</p>
    `;
    
    if (data.details) {
      errorHtml += `
        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; font-weight: bold;"> Error Details</summary>
          <pre style="text-align: left; background: #f9f9f9; padding: 10px; overflow: auto; margin-top: 10px;">${JSON.stringify(data.details, null, 2)}</pre>
        </details>
      `;
    }
    
    errorDiv.innerHTML = errorHtml;
    resultsContainer.appendChild(errorDiv);
    return;
  }
  
  // Create header
  const header = document.createElement("h2");
  header.textContent = "Your Representatives:";
  header.style.color = "#c8c8c8";
  resultsContainer.appendChild(header);
  
  // Handle Google Civic API format
  if (data.offices && data.officials) {
    displayGoogleCivicReps(data, resultsContainer);
    return;
  }
  
  // Handle 5 Calls API format
  let reps = data.representatives || data.reps || data;
  
  if (reps && typeof reps === 'object' && !Array.isArray(reps)) {
    if (reps.data) reps = reps.data;
    if (reps.representatives) reps = reps.representatives;
  }
  
  if (Array.isArray(reps) && reps.length > 0) {
    reps.forEach(rep => {
      const repDiv = document.createElement("div");
      repDiv.style.border = "1px solid #ccc";
      repDiv.style.padding = "15px";
      repDiv.style.margin = "15px auto";
      repDiv.style.borderRadius = "8px";
      repDiv.style.backgroundColor = "#f9f9f9";
      repDiv.style.maxWidth = "600px";
      repDiv.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      
      repDiv.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">${rep.name || rep.displayName || 'Unknown'}</h3>
        ${rep.office || rep.role ? `<p><strong>Office:</strong> ${rep.office || rep.role}</p>` : ''}
        ${rep.party ? `<p><strong>Party:</strong> ${rep.party}</p>` : ''}
        ${rep.phone || rep.phoneNumber ? `<p><strong>Phone:</strong> <a href="tel:${rep.phone || rep.phoneNumber}">${rep.phone || rep.phoneNumber}</a></p>` : ''}
        ${rep.photoURL || rep.photo ? `<img src="${rep.photoURL || rep.photo}" alt="${rep.name}" style="max-width: 100px; border-radius: 50%; margin-top: 10px;">` : ''}
      `;
      
      resultsContainer.appendChild(repDiv);
    });
  } else {
    // Display raw JSON for debugging
    const debugDiv = document.createElement("div");
    debugDiv.innerHTML = `
      <p>Raw API Response (for debugging):</p>
      <pre style="text-align: left; background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; max-width: 800px; margin: 0 auto; border: 1px solid #ddd;">${JSON.stringify(data, null, 2)}</pre>
    `;
    resultsContainer.appendChild(debugDiv);
  }
}

// Display Google Civic representatives google civic blows ass
function displayGoogleCivicReps(data, container) {
  if (!data.offices || !data.officials) {
    container.innerHTML += "<p>No representative data found.</p>";
    return;
  }
  
  data.offices.forEach(office => {
    const officeName = office.name;
    const officialIndices = office.officialIndices || [];
    
    officialIndices.forEach(index => {
      const official = data.officials[index];
      if (!official) return;
      
      const repDiv = document.createElement("div");
      repDiv.style.border = "1px solid #ccc";
      repDiv.style.padding = "15px";
      repDiv.style.margin = "15px auto";
      repDiv.style.borderRadius = "8px";
      repDiv.style.backgroundColor = "#f9f9f9";
      repDiv.style.maxWidth = "600px";
      repDiv.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      
      let html = `
        <h3 style="margin-top: 0; color: #333;">${official.name}</h3>
        <p><strong>Office:</strong> ${officeName}</p>
        ${official.party ? `<p><strong>Party:</strong> ${official.party}</p>` : ''}
      `;
      
      // Add phone numbers
      if (official.phones && official.phones.length > 0) {
        html += `<p><strong>Phone:</strong> ${official.phones.map(p => `<a href="tel:${p}">${p}</a>`).join(', ')}</p>`;
      }
      
      // Add emails
      if (official.emails && official.emails.length > 0) {
        html += `<p><strong>Email:</strong> ${official.emails.map(e => `<a href="mailto:${e}">${e}</a>`).join(', ')}</p>`;
      }
      
      // Add URLs
      if (official.urls && official.urls.length > 0) {
        html += `<p><strong>Website:</strong> ${official.urls.map(u => `<a href="${u}" target="_blank">${u}</a>`).join(', ')}</p>`;
      }
      
      // Add photo
      if (official.photoUrl) {
        html += `<img src="${official.photoUrl}" alt="${official.name}" style="max-width: 100px; border-radius: 50%; margin-top: 10px;">`;
      }
      
      repDiv.innerHTML = html;
      container.appendChild(repDiv);
    });
  });
}

// Display voter info 
function displayVoterInfo(data) {
  let resultsContainer = document.getElementById("results");
  
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = "results";
    resultsContainer.className = "centerPage";
    
    const finalText = document.getElementById("finalText");
    if (finalText && finalText.parentNode) {
      finalText.parentNode.insertBefore(resultsContainer, finalText.nextSibling);
    }
  }
  
  resultsContainer.innerHTML = "";
  
  if (data.error) {
    resultsContainer.innerHTML = `<div style="color: red; padding: 20px;"><h3> Error</h3><p>${data.message}</p></div>`;
    return;
  }
  
  const header = document.createElement("h2");
  header.textContent = "Voter Information";
  header.style.color = "#333";
  resultsContainer.appendChild(header);
  
  // Election info
  if (data.election) {
    const electionDiv = document.createElement("div");
    electionDiv.style.padding = "15px";
    electionDiv.style.margin = "15px auto";
    electionDiv.style.maxWidth = "700px";
    electionDiv.style.backgroundColor = "#e8f5e9";
    electionDiv.style.borderRadius = "8px";
    electionDiv.innerHTML = `
      <h3>📅 ${data.election.name}</h3>
      <p><strong>Date:</strong> ${data.election.electionDay}</p>
    `;
    resultsContainer.appendChild(electionDiv);
  }
  
  // polling locatiosn
  if (data.pollingLocations && data.pollingLocations.length > 0) {
    const pollingHeader = document.createElement("h3");
    pollingHeader.textContent = " Polling Locations";
    pollingHeader.style.marginTop = "20px";
    resultsContainer.appendChild(pollingHeader);
    
    data.pollingLocations.forEach(location => {
      const locDiv = document.createElement("div");
      locDiv.style.border = "1px solid #ddd";
      locDiv.style.padding = "15px";
      locDiv.style.margin = "10px auto";
      locDiv.style.maxWidth = "700px";
      locDiv.style.borderRadius = "8px";
      locDiv.style.backgroundColor = "#fff";
      
      const address = location.address;
      const fullAddress = `${address.line1 || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`;
      
      locDiv.innerHTML = `
        <p><strong>Address:</strong> ${fullAddress}</p>
        ${location.pollingHours ? `<p><strong>Hours:</strong> ${location.pollingHours}</p>` : ''}
        ${location.notes ? `<p><strong>Notes:</strong> ${location.notes}</p>` : ''}
      `;
      resultsContainer.appendChild(locDiv);
    });
  }
  
  // Display raw data for debugging (thank mr internet)
  const debugDiv = document.createElement("details");
  debugDiv.style.marginTop = "20px";
  debugDiv.innerHTML = `
    <summary style="cursor: pointer; font-weight: bold;"> View Full Data</summary>
    <pre style="text-align: left; background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; max-width: 800px; margin: 10px auto;">${JSON.stringify(data, null, 2)}</pre>
  `;
  resultsContainer.appendChild(debugDiv);
}

// Display elections
function displayElections(data) {
  let resultsContainer = document.getElementById("results");
  
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = "results";
    resultsContainer.className = "centerPage";
    document.body.appendChild(resultsContainer);
  }
  
  resultsContainer.innerHTML = "";
  
  if (data.error) {
    resultsContainer.innerHTML = `<div style="color: red; padding: 20px;"><h3> Error</h3><p>${data.message}</p></div>`;
    return;
  }
  
  const header = document.createElement("h2");
  header.textContent = "🗳️ Upcoming Elections";
  header.style.color = "#333";
  resultsContainer.appendChild(header);
  
  if (data.elections && data.elections.length > 0) {
    data.elections.forEach(election => {
      const electionDiv = document.createElement("div");
      electionDiv.style.border = "1px solid #ccc";
      electionDiv.style.padding = "15px";
      electionDiv.style.margin = "15px auto";
      electionDiv.style.borderRadius = "8px";
      electionDiv.style.backgroundColor = "#f9f9f9";
      electionDiv.style.maxWidth = "600px";
      
      electionDiv.innerHTML = `
        <h3 style="margin-top: 0;">${election.name}</h3>
        <p><strong>Date:</strong> ${election.electionDay}</p>
        <p><strong>ID:</strong> ${election.id}</p>
      `;
      resultsContainer.appendChild(electionDiv);
    });
  } else {
    resultsContainer.innerHTML += "<p>No upcoming elections found.</p>";
  }
}

// checking backend health
async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("Backend health:", data);
    
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = data.ok ? " yay" : " Backend Down";
      statusEl.style.color = data.ok ? "green" : "red";
      statusEl.style.fontWeight = "bold";
    }
    
    return data.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = "oh no";
      statusEl.style.color = "red";
      statusEl.style.fontWeight = "bold";
    }
    return false;
  }
}

// scrolling (logan)  function
function scrollDown() {
  const section2 = document.getElementById("section2");
  if (section2) {
    section2.scrollIntoView({ behavior: "smooth" });
  }
}


// main dom


document.addEventListener("DOMContentLoaded", () => {
  
  checkBackendHealth();

  const inputs = {
    add: document.getElementById("addInput"),
    state: document.getElementById("stateInput"),
    city: document.getElementById("cityInput"),
    zip: document.getElementById("zipInput")
  };

  const buttons = {
    add: document.getElementById("addButton"),
    state: document.getElementById("stateButton"),
    city: document.getElementById("cityButton"),
    zip: document.getElementById("zipButton"),
    final: document.getElementById("final")
  };

  function updateTextContent(inputKey, targetId) {
    const value = inputs[inputKey].value;
    console.log(`${inputKey} input:`, value);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.textContent = value;
    }
  }

  const mapping = {
    add: "addy",
    state: "state",
    city: "city",
    zip: "zip"
  };

  Object.entries(mapping).forEach(([key, targetId]) => {
    if (inputs[key]) {
      inputs[key].addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          updateTextContent(key, targetId);
        }
      });
    }
  });

  Object.entries(mapping).forEach(([key, targetId]) => {
    if (buttons[key]) {
      buttons[key].addEventListener("click", () => {
        updateTextContent(key, targetId);
      });
    }
  });

  // Main lookup button
  if (buttons.final) {
    buttons.final.addEventListener("click", async () => {
      const address = inputs.add.value.trim();
      const city = inputs.city.value.trim();
      const state = inputs.state.value.trim();
      const zip = inputs.zip.value.trim();

      if (!address || !city || !state || !zip) {
        alert("Please fill in all fields:\n- Street Address\n- City\n- State\n- ZIP Code");
        return;
      }

      const fullAddress = `${address}, ${city}, ${state} ${zip}`;
      
      document.getElementById("addy").textContent = address;
      document.getElementById("city").textContent = city;
      document.getElementById("state").textContent = state;
      document.getElementById("zip").textContent = zip;
      
      const finalEl = document.getElementById("finalText");
      if (finalEl) {
        finalEl.textContent = `Looking up civic information for: ${fullAddress}`;
      }
      
      console.log("=== CIVIC INFO LOOKUP ===");
      console.log("Full address:", fullAddress);

      let resultsContainer = document.getElementById("results");
      if (!resultsContainer) {
        resultsContainer = document.createElement("div");
        resultsContainer.id = "results";
        resultsContainer.className = "centerPage";
        const finalText = document.getElementById("finalText");
        if (finalText && finalText.parentNode) {
          finalText.parentNode.insertBefore(resultsContainer, finalText.nextSibling);
        }
      }
      resultsContainer.innerHTML = "<p style='font-size: 18px;'> Loading civic information...</p>";

      // PLEASE GOOGLE BRING THIS BACK
      console.log("Trying Google Civic API...");
      let repsData = await getGoogleRepresentatives(fullAddress);
      
      // google will fail but they might bring it back
      if (repsData.error) {
        console.log("Google API failed, trying 5 Calls API...");
        repsData = await getRepresentatives(fullAddress);
      }
      
      // double chgeck sh
      const voterInfoPromise = getVoterInfo(fullAddress);
      const electionsPromise = getElections();
      
      if (finalEl && !repsData.error) {
        finalEl.textContent = `Representatives for: ${fullAddress}`;
        finalEl.style.color = "green";
      } else if (finalEl && repsData.error) {
        finalEl.textContent = "Error looking up representatives";
        finalEl.style.color = "red";
      }
      
      displayRepresentatives(repsData);
      
      // Add voter info section
      const voterInfo = await voterInfoPromise;
      if (!voterInfo.error && voterInfo.pollingLocations) {
        const voterSection = document.createElement("div");
        voterSection.style.marginTop = "30px";
        voterSection.style.borderTop = "2px solid #ddd";
        voterSection.style.paddingTop = "20px";
        resultsContainer.appendChild(voterSection);
        displayVoterInfo(voterInfo);
      }
    });
  }
  

  window.testElections = async function() {
    const data = await getElections();
    displayElections(data);
  };
  
  window.testBills = async function() {
    const data = await getBills();
    console.log("Bills:", data);
    alert("Check console for bills data");
  };
  
  window.testMembers = async function() {
    const data = await getCongressMembers();
    console.log("Congress Members:", data);
    alert("Check console for Congress members data");
  };
});