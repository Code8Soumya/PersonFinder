document.addEventListener("DOMContentLoaded", () => {
    // Main initialization function after the DOM is fully loaded.
    console.log("[index.js] DOMContentLoaded event fired.");
    const photoInput = document.getElementById("photoInput");
    const photoPreviewContainer = document.getElementById("photoPreviewContainer");
    const photoPreview = document.getElementById("photoPreview");
    const loadingIndicator = document.getElementById("loadingIndicator");

    if (photoInput && photoPreviewContainer && photoPreview) {
        // Handles photo preview when a file is selected.
        photoInput.addEventListener("change", function (event) {
            console.log("[index.js] Photo input changed.");
            const file = event.target.files[0];
            if (file) {
                console.log("[index.js] File selected for preview.");
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreview.setAttribute("src", e.target.result);
                    photoPreviewContainer.classList.remove("hidden");
                    console.log("[index.js] Photo preview updated.");
                };
                reader.onerror = function (e) {
                    console.error(
                        "[index.js] Error reading file for preview:",
                        e.target.error
                    );
                    photoPreview.setAttribute("src", "#");
                    photoPreviewContainer.classList.add("hidden");
                };
                reader.readAsDataURL(file);
            } else {
                console.log("[index.js] No file selected, clearing preview.");
                photoPreview.setAttribute("src", "#");
                photoPreviewContainer.classList.add("hidden");
            }
        });
    }

    const addPersonForm = document.getElementById("addPersonForm");
    if (addPersonForm) {
        // Handles the submission of the 'Add Person' form.
        addPersonForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("[index.js] Add Person form submission started.");
            const formData = new FormData(addPersonForm);

            if (loadingIndicator) loadingIndicator.classList.remove("hidden");
            console.log("[index.js] Loading indicator shown for add person.");

            // Basic client-side validation
            const name = formData.get("name");
            const email = formData.get("email");
            const gender = formData.get("gender");
            const age = formData.get("age");
            const photo = formData.get("photo");

            if (!name || !email || !gender || !age || !photo || photo.size === 0) {
                alert("Please fill in all fields and select a photo.");
                if (loadingIndicator) loadingIndicator.classList.add("hidden");
                console.log("[index.js] Add Person form validation failed.");
                return;
            }
            console.log("[index.js] Add Person form validation passed.");

            try {
                console.log("[index.js] Attempting to add person via API.");
                const response = await fetch("/person/add", {
                    method: "POST",
                    body: formData,
                });
                console.log("[index.js] Received response from add person API.");

                const result = await response.json();
                console.log("[index.js] Parsed JSON response from add person API.");

                if (response.ok) {
                    alert("Person added successfully!");
                    addPersonForm.reset();
                    if (photoPreview && photoPreviewContainer) {
                        photoPreview.setAttribute("src", "#");
                        photoPreviewContainer.classList.add("hidden");
                    }
                    console.log("[index.js] Person added successfully, form reset.");
                } else {
                    alert(`Error: ${result.message || "Failed to add person"}`);
                    console.error(
                        "[index.js] Error response from add person API:",
                        result.message || "Failed to add person"
                    );
                }
            } catch (error) {
                console.error("[index.js] Error in addPersonForm submit:", error.message);
                alert("An error occurred. Please try again.");
            } finally {
                if (loadingIndicator) loadingIndicator.classList.add("hidden");
                console.log("[index.js] Loading indicator hidden for add person.");
            }
        });
    }

    const findPersonForm = document.getElementById("findPersonForm");
    const resultsDiv = document.getElementById("results");
    const resultsList = document.getElementById("resultsList");

    if (findPersonForm && resultsDiv && resultsList) {
        // Handles the submission of the 'Find Person' form.
        findPersonForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("[index.js] Find Person form submission started.");
            const formData = new FormData(findPersonForm);
            const photo = formData.get("photo");

            if (!photo || photo.size === 0) {
                alert("Please upload a photo to find a person.");
                console.log(
                    "[index.js] Find Person form validation failed: No photo uploaded."
                );
                return;
            }
            console.log("[index.js] Find Person form validation passed.");

            if (loadingIndicator) loadingIndicator.classList.remove("hidden");
            console.log("[index.js] Loading indicator shown for find person.");

            try {
                console.log("[index.js] Attempting to find person via API.");
                const response = await fetch("/person/find", {
                    method: "POST",
                    body: formData,
                });
                console.log("[index.js] Received response from find person API.");

                const result = await response.json();
                console.log("[index.js] Parsed JSON response from find person API.");
                resultsList.innerHTML = "";

                if (response.ok) {
                    console.log("[index.js] Find person API call successful.");
                    if (result.results && result.results.length > 0) {
                        console.log(
                            `[index.js] Found ${result.results.length} similar person(s).`
                        );
                        result.results.forEach((data) => {
                            const personDiv = document.createElement("div");
                            personDiv.className = "person-card";

                            const imgSrc = `data:image/jpeg;base64,${data.photoData}`;

                            personDiv.innerHTML = `
                                <h4 class="font-semibold text-lg">${data.person.name}</h4>
                                <img src="${imgSrc}" alt="Matched Photo for ${
                                data.person.name
                            }" class="mt-2 w-32 h-32 object-cover rounded-md">
                                <p class="text-sm text-gray-600">Email: ${
                                    data.person.email
                                }</p>
                                <p class="text-sm text-gray-600">Gender: ${
                                    data.person.gender
                                }</p>
                                <p class="text-sm text-gray-600">Age: ${
                                    data.person.age
                                }</p>
                                <p class="text-sm text-gray-600">Similarity Score: ${
                                    data.similarity ? data.similarity.toFixed(4) : "N/A"
                                }</p>
                            `;
                            resultsList.appendChild(personDiv);
                        });
                    } else {
                        console.log("[index.js] No similar persons found.");
                        resultsList.innerHTML =
                            '<p class="text-slate-600 p-4 text-center">No similar persons found.</p>';
                    }
                    resultsDiv.classList.remove("hidden");
                } else {
                    console.error(
                        "[index.js] Error response from find person API:",
                        result.message || "Failed to find person"
                    );
                    resultsList.innerHTML = `<p class="text-red-600 p-4 text-center">Error: ${
                        result.message || "Failed to find person"
                    }</p>`;
                    resultsDiv.classList.remove("hidden");
                }
            } catch (error) {
                console.error(
                    "[index.js] Error in findPersonForm submit:",
                    error.message
                );
                resultsList.innerHTML =
                    '<p class="text-red-600 p-4 text-center">An error occurred. Please try again.</p>';
                resultsDiv.classList.remove("hidden");
            } finally {
                if (loadingIndicator) loadingIndicator.classList.add("hidden");
                console.log("[index.js] Loading indicator hidden for find person.");
            }
        });
    }
});
