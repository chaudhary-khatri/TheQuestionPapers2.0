import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOGIfnmr_hkf85h6-7wngePIvCPDKEb8k",
    authDomain: "thequestionpaper-409f0.firebaseapp.com",
    projectId: "thequestionpaper-409f0",
    storageBucket: "thequestionpaper-409f0.appspot.com",
    messagingSenderId: "798858195313",
    appId: "1:798858195313:web:65f7dd64b82f6e7f4ac6d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the container where the data will be displayed
const questionPapersDiv = document.getElementById('question-papers');

// Fetch and display data in the hierarchy
async function fetchQuestionPapers() {
    try {
        // Get all universities
        const universitiesSnapshot = await getDocs(collection(db, "universities"));

        universitiesSnapshot.forEach(async (universityDoc) => {
            const universityId = universityDoc.id;
            const universityName = universityDoc.data().name || "Unnamed University";

            // Create a section for each university
            const universityDiv = document.createElement('div');
            universityDiv.classList.add('university-section');
            universityDiv.innerHTML = `<h1>${universityName}</h1>`;
            questionPapersDiv.appendChild(universityDiv);

            // Get all courses in the university
            const coursesSnapshot = await getDocs(collection(db, `universities/${universityId}/courses`));

            coursesSnapshot.forEach(async (courseDoc) => {
                const courseId = courseDoc.id;
                const courseName = courseDoc.data().name || "Unnamed Course";

                // Create a section for each course
                const courseDiv = document.createElement('div');
                courseDiv.classList.add('course-section');
                courseDiv.innerHTML = `<h2>${courseName}</h2>`;
                universityDiv.appendChild(courseDiv);

                // Get all semesters in the course
                const semestersSnapshot = await getDocs(collection(db, `universities/${universityId}/courses/${courseId}/semester`));

                semestersSnapshot.forEach(async (semesterDoc) => {
                    const semesterId = semesterDoc.id;
                    const semesterName = semesterDoc.data().semester || "Unknown Semester";

                    // Create a section for each semester
                    const semesterDiv = document.createElement('div');
                    semesterDiv.classList.add('semester-section');
                    semesterDiv.innerHTML = `<h3>${semesterName}</h3>`;
                    courseDiv.appendChild(semesterDiv);

                    // Get all subjects in the semester
                    const subjectsSnapshot = await getDocs(collection(db, `universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`));

                    subjectsSnapshot.forEach(async (subjectDoc) => {
                        const subjectId = subjectDoc.id;
                        const subjectName = subjectDoc.data().name || "Unnamed Subject";

                        // Create a section for each subject
                        const subjectDiv = document.createElement('div');
                        subjectDiv.classList.add('subject-section');
                        subjectDiv.innerHTML = `<h4>${subjectName}</h4>`;
                        semesterDiv.appendChild(subjectDiv);

                        // Get all question papers in the subject
                        const questionPapersSnapshot = await getDocs(collection(db, `universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`));

                        questionPapersSnapshot.forEach((paperDoc) => {
                            const paperName = paperDoc.data().name || "Untitled Question Paper";
                            const pdfUrl = paperDoc.data().pdfUrl;
                            const description = paperDoc.data().description || "No description available";

                            // Add each question paper as a download link
                            const paperDiv = document.createElement('div');
                            paperDiv.classList.add('paper');
                            paperDiv.innerHTML = `
                                <a href="${pdfUrl}" target="_blank">${paperName}</a>
                                <p class="description">${description}</p>`;
                            subjectDiv.appendChild(paperDiv);
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error fetching question papers: ", error);
        questionPapersDiv.innerHTML = `<p style="color: red;">Failed to load question papers. Please try again later.</p>`;
    }
}

// Call the function to fetch and display question papers
fetchQuestionPapers();
