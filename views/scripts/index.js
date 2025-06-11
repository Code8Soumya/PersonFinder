// Show photo preview when a file is selected
document.getElementById('photoInput').addEventListener('change', function (e) {
    const [file] = this.files;
    if (file) {
        const preview = document.getElementById('photoPreview');
        preview.src = URL.createObjectURL(file);
        console.log(preview.src);
        document.getElementById('photoPreviewContainer').classList.remove('hidden');
    }
});

// Add Person Form Handler
// document.getElementById('addPersonForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);

//     try {
//         const response = await fetch('/persons/add', {
//             method: 'POST',
//             body: formData
//         });

//         const data = await response.json();
//         if (response.ok) {
//             alert('Person added successfully!');
//             e.target.reset();
//         } else {
//             alert(data.error || 'Error adding person');
//         }
//     } catch (error) {
//         alert('Error adding person');
//     }
// });

// // Find Person Form Handler
// document.getElementById('findPersonForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);

//     try {
//         const response = await fetch('/persons/find', {
//             method: 'POST',
//             body: formData
//         });

//         const data = await response.json();
//         const resultsDiv = document.getElementById('results');
//         const resultsList = document.getElementById('resultsList');

//         if (response.ok && data.length > 0) {
//             resultsDiv.classList.remove('hidden');
//             resultsList.innerHTML = data.map(person => `
//                     <div class="bg-gray-50 p-4 rounded-md">
//                         <h4 class="font-semibold">${person.name}</h4>
//                         <img src="${person.photo_path}" alt="${person.name}" class="mt-2 w-32 h-32 object-cover rounded-md">
//                         ${person.additional_data ? `<p class="mt-2 text-sm text-gray-600">${person.additional_data}</p>` : ''}
//                     </div>
//                 `).join('');
//         } else {
//             resultsDiv.classList.remove('hidden');
//             resultsList.innerHTML = '<p class="text-gray-600">No matches found</p>';
//         }
//     } catch (error) {
//         alert('Error finding person');
//     }
// });