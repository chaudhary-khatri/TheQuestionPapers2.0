
  function toggleSection(event, sectionId) {
    event.preventDefault(); // Prevent default anchor click behavior

    // Get all document sections
    const sections = document.querySelectorAll('.doc-section');

    // Hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the clicked section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.style.display = 'block';
}



