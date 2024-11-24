// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, Timestamp, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Firebase Config Object
const firebaseConfig = {
    apiKey: "AIzaSyCOGIfnmr_hkf85h6-7wngePIvCPDKEb8k",
    authDomain: "thequestionpaper-409f0.firebaseapp.com",
    projectId: "thequestionpaper-409f0",
    storageBucket: "thequestionpaper-409f0.appspot.com",
    messagingSenderId: "798858195313",
    appId: "1:798858195313:web:65f7dd64b82f6e7f4ac6d0"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestore database instance
const storage = getStorage(app);  // Firebase storage instance

// ========================== ADD UNIVERSITY ============================
const addUniversityForm = document.getElementById("addUniversityForm");

// Event listener to handle university form submission
// Add university form submission
addUniversityForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Log to check if the submit event is triggered
    console.log("Add button clicked");

    const universityName = document.getElementById("universityName");
    if (universityName) {
        const universityNameValue = universityName.value;
        console.log("University name: ", universityNameValue);

        if (universityNameValue) {
            try {
                // Add the university to Firestore
                await addDocumentToFirestore('universities', {
                    name: universityNameValue,
                    createdAt: Timestamp.now()
                });

                // Log success message
                console.log("University added successfully!");

                // Feedback after successful addition
                const feedback = document.getElementById("addUniversityFeedback");
                feedback.style.display = "block";
                feedback.textContent = "University added successfully!";
                feedback.style.color = "green";
                addUniversityForm.reset(); // Reset form fields

            } catch (error) {
                console.error("Error adding university:", error);
                const feedback = document.getElementById("addUniversityFeedback");
                feedback.style.display = "block";
                feedback.textContent = "Failed to add university.";
                feedback.style.color = "red";
            }
        } else {
            console.error("University name is empty.");
        }
    } else {
        console.error("Element with ID 'universityName' not found.");
    }
});


// Utility function to fetch collection data from Firestore
async function getFirestoreCollection(collectionPath) {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Utility function to add a document to a Firestore collection
async function addDocumentToFirestore(collectionPath, data) {
    const docRef = await addDoc(collection(db, collectionPath), data);
    return docRef;
}

// ========================== ADD COURSE ============================
document.addEventListener("DOMContentLoaded", () => {
    const courseUniversity = document.getElementById("courseUniversity");
    const addCourseForm = document.getElementById("addCourseForm");
    const feedback = document.getElementById("addCourseFeedback");

    // Fetch universities for course dropdown
    async function fetchUniversities() {
        try {
            const universities = await getFirestoreCollection('universities');
            universities.forEach(university => {
                const option = document.createElement("option");
                option.value = university.id;
                option.textContent = university.name;
                courseUniversity.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        }
    }

    // Handle course addition form submission
    addCourseForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const universityId = courseUniversity.value;
        const courseName = document.getElementById("newCourse").value;

        if (universityId && courseName) {
            try {
                // Add course to Firestore under the selected university
                await addDocumentToFirestore(`universities/${universityId}/courses`, {
                    name: courseName,
                    createdAt: Timestamp.now()
                });

                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Course added successfully!";
                feedback.style.color = "green";
                addCourseForm.reset();
            } catch (error) {
                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Failed to add course.";
                feedback.style.color = "red";
            }
        }
    });

    fetchUniversities();  // Initialize universities dropdown
});



// ========================== ADD SEMESTER ============================
document.addEventListener("DOMContentLoaded", () => {
    const semesterUniversity = document.getElementById("semesterUniversity");
    const semesterCourse = document.getElementById("semesterCourse");
    const addSemesterForm = document.getElementById("addSemesterForm");
    const feedback = document.getElementById("addSemesterFeedback");

    // Fetch universities and populate dropdown options
    async function fetchUniversities() {
        const universities = await getFirestoreCollection('universities');
        universities.forEach(university => {
            const option = document.createElement("option");
            option.value = university.id;
            option.textContent = university.name;
            semesterUniversity.appendChild(option);
        });
    }

    // Fetch courses when university is selected
    semesterUniversity.addEventListener("change", async (event) => {
        semesterCourse.innerHTML = '<option value="">Select Course</option>';  // Reset course options
        const universityId = event.target.value;
        if (universityId) {
            const courses = await getFirestoreCollection(`universities/${universityId}/courses`);
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.name;
                semesterCourse.appendChild(option);
            });
        }
    });

    // Handle semester addition form submission
    addSemesterForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const universityId = semesterUniversity.value;
        const courseId = semesterCourse.value;
        const semesterName = document.getElementById("newSemester").value;

        if (universityId && courseId && semesterName) {
            try {
                // Add semester to Firestore
                await addDocumentToFirestore(`universities/${universityId}/courses/${courseId}/semester`, {
                    semester: semesterName,
                    createdAt: Timestamp.now()
                });
                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Semester added successfully!";
                feedback.style.color = "green";
            } catch (error) {
                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Failed to add semester.";
                feedback.style.color = "red";
            }
        }
    });

    fetchUniversities();  // Initialize universities dropdown
});

// ========================== ADD SUBJECT ============================
document.addEventListener("DOMContentLoaded", () => {
    const subjectUniversity = document.getElementById("subjectUniversity");
    const subjectCourse = document.getElementById("subjectCourse");
    const subjectSemester = document.getElementById("subjectSemester");
    const addSubjectForm = document.getElementById("addSubjectForm");
    const feedback = document.getElementById("addSubjectFeedback");

    // Fetch universities for subjects dropdown
    async function fetchUniversities() {
        try {
            const universities = await getFirestoreCollection('universities');
            universities.forEach(university => {
                const option = document.createElement("option");
                option.value = university.id;
                option.textContent = university.name;
                subjectUniversity.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        }
    }

    // Fetch courses based on selected university
    subjectUniversity.addEventListener("change", async (event) => {
        subjectCourse.innerHTML = '<option value="">Select Course</option>';
        subjectSemester.innerHTML = '<option value="">Select Semester</option>';
        const universityId = event.target.value;
        if (universityId) {
            try {
                const courses = await getFirestoreCollection(`universities/${universityId}/courses`);
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.id;
                    option.textContent = course.name;
                    subjectCourse.appendChild(option);
                });
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        }
    });

    // Fetch semesters based on selected course
    subjectCourse.addEventListener("change", async (event) => {
        subjectSemester.innerHTML = '<option value="">Select Semester</option>';
        const universityId = subjectUniversity.value;
        const courseId = event.target.value;
        if (universityId && courseId) {
            try {
                const semesters = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester`);
                semesters.forEach(semester => {
                    const option = document.createElement("option");
                    option.value = semester.id;
                    option.textContent = semester.semester;
                    subjectSemester.appendChild(option);
                });
            } catch (error) {
                console.error("Failed to fetch semesters:", error);
            }
        }
    });

    // Handle subject addition form submission
    addSubjectForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const universityId = subjectUniversity.value;
        const courseId = subjectCourse.value;
        const semesterId = subjectSemester.value;
        const subjectName = document.getElementById("newSubject").value;

        if (universityId && courseId && semesterId && subjectName) {
            try {
                // Add subject to Firestore
                await addDocumentToFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`, {
                    name: subjectName,
                    createdAt: Timestamp.now()
                });
                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Subject added successfully!";
                feedback.style.color = "green";
                addSubjectForm.reset();
                subjectCourse.innerHTML = '<option value="">Select Course</option>';
                subjectSemester.innerHTML = '<option value="">Select Semester</option>';
            } catch (error) {
                feedback.style.display = "block";
                feedback.querySelector(".feedback-message").textContent = "Failed to add subject.";
                feedback.style.color = "red";
            }
        }
    });

    fetchUniversities();  // Initialize dropdowns
});

// ========================== QUESTION PAPER UPLOAD ============================
document.addEventListener("DOMContentLoaded", () => {
    const uploadUniversity = document.getElementById("uploadUniversity");
    const uploadCourse = document.getElementById("uploadCourse");
    const uploadSemester = document.getElementById("uploadSemester");
    const uploadSubject = document.getElementById("uploadSubject");
    const uploadQuestionPapersForm = document.getElementById("uploadQuestionPapersForm");
    const uploadFeedback = document.getElementById("uploadFeedback");

    // Fetch universities for question paper upload
    async function fetchUniversities() {
        try {
            const universities = await getFirestoreCollection('universities');
            universities.forEach(university => {
                const option = document.createElement("option");
                option.value = university.id;
                option.textContent = university.name;
                uploadUniversity.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        }
    }

    // Fetch courses based on selected university
    uploadUniversity.addEventListener("change", async (event) => {
        uploadCourse.innerHTML = '<option value="">Select Course</option>';
        uploadSemester.innerHTML = '<option value="">Select Semester</option>';
        uploadSubject.innerHTML = '<option value="">Select Subject</option>';
        const universityId = event.target.value;
        if (universityId) {
            try {
                const courses = await getFirestoreCollection(`universities/${universityId}/courses`);
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.id;
                    option.textContent = course.name;
                    uploadCourse.appendChild(option);
                });
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        }
    });

    // Fetch semesters based on selected course
    uploadCourse.addEventListener("change", async (event) => {
        uploadSemester.innerHTML = '<option value="">Select Semester</option>';
        uploadSubject.innerHTML = '<option value="">Select Subject</option>';
        const universityId = uploadUniversity.value;
        const courseId = event.target.value;
        if (universityId && courseId) {
            try {
                const semesters = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester`);
                semesters.forEach(semester => {
                    const option = document.createElement("option");
                    option.value = semester.id;
                    option.textContent = semester.semester;
                    uploadSemester.appendChild(option);
                });
            } catch (error) {
                console.error("Failed to fetch semesters:", error);
            }
        }
    });

    // Fetch subjects based on selected semester
    uploadSemester.addEventListener("change", async (event) => {
        uploadSubject.innerHTML = '<option value="">Select Subject</option>';
        const universityId = uploadUniversity.value;
        const courseId = uploadCourse.value;
        const semesterId = event.target.value;
        if (universityId && courseId && semesterId) {
            try {
                const subjects = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`);
                subjects.forEach(subject => {
                    const option = document.createElement("option");
                    option.value = subject.id;
                    option.textContent = subject.name;
                    uploadSubject.appendChild(option);
                });
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
            }
        }
    });

    // Handle question paper upload form submission
    uploadQuestionPapersForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const universityId = uploadUniversity.value;
        const courseId = uploadCourse.value;
        const semesterId = uploadSemester.value;
        const subjectId = uploadSubject.value;
        const questionFiles = document.getElementById("uploadFiles").files;
        const tagsInput = document.getElementById("tags").value;  // Get tags input
        const descriptionInput = document.getElementById("description").value;  // Get description input

        if (universityId && courseId && semesterId && subjectId && questionFiles.length > 0) {
            try {
                // Process the tags input
                const tags = tagsInput.split(',').map(tag => tag.trim());  // Create tags array

                // Loop through the selected files
                for (let i = 0; i < questionFiles.length; i++) {
                    const file = questionFiles[i];
                    console.log("Uploading file:", file.name);  // Debugging log

                    // Upload the question paper to Firebase Storage
                    const fileRef = ref(storage, `questionPapers/${file.name}`);
                    await uploadBytes(fileRef, file);
                    const fileUrl = await getDownloadURL(fileRef);
                    console.log("File uploaded successfully. URL:", fileUrl);  // Debugging log

                    // Add question paper metadata to Firestore
                    await addDocumentToFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`, {
                        name: file.name,
                        pdfUrl: fileUrl,
                        createdAt: Timestamp.now(),
                        description: descriptionInput,  // Add description
                        tags: tags  // Add tags array
                    });
                }

                // Show success feedback
                uploadFeedback.style.display = "block";
                uploadFeedback.querySelector(".feedback-message").textContent = "Question papers uploaded successfully!";
                uploadFeedback.style.color = "green";
                uploadQuestionPapersForm.reset();

            } catch (error) {
                // Show error feedback
                uploadFeedback.style.display = "block";
                uploadFeedback.querySelector(".feedback-message").textContent = "Failed to upload question papers.";
                uploadFeedback.style.color = "red";
            }
        } else {
            // Handle validation error if fields are missing
            uploadFeedback.style.display = "block";
            uploadFeedback.querySelector(".feedback-message").textContent = "Please fill all fields and select at least one file.";
            uploadFeedback.style.color = "red";
        }
    });


    fetchUniversities();  // Initialize dropdowns

});



document.addEventListener("DOMContentLoaded", async () => {
    const deleteUniversity = document.getElementById("deleteUniversity");
    const deleteCourse = document.getElementById("deleteCourse");
    const deleteSemester = document.getElementById("deleteSemester");
    const deleteSubject = document.getElementById("deleteSubject");
    const deleteQuestionPaper = document.getElementById("deleteQuestionPaper");

    // Feedback elements
    const deleteUniversityFeedback = document.getElementById("deleteUniversityFeedback");
    const deleteCourseFeedback = document.getElementById("deleteCourseFeedback");
    const deleteSemesterFeedback = document.getElementById("deleteSemesterFeedback");
    const deleteSubjectFeedback = document.getElementById("deleteSubjectFeedback");
    const deleteQuestionPaperFeedback = document.getElementById("deleteQuestionPaperFeedback");

    // Populate Universities Dropdown
    await populateUniversities();

    // Populate Courses based on selected University
    deleteUniversity.addEventListener("change", async () => {
        await populateCourses(deleteUniversity.value);
    });

    // Populate Semesters based on selected Course
    deleteCourse.addEventListener("change", async () => {
        await populateSemesters(deleteUniversity.value, deleteCourse.value);
    });

    // Populate Subjects based on selected Semester
    deleteSemester.addEventListener("change", async () => {
        await populateSubjects(deleteUniversity.value, deleteCourse.value, deleteSemester.value);
    });

    // Populate Question Papers based on selected Subject
    deleteSubject.addEventListener("change", async () => {
        await populateQuestionPapers(deleteUniversity.value, deleteCourse.value, deleteSemester.value, deleteSubject.value);
    });

    // Function to populate universities
    async function populateUniversities() {
        const universities = await getFirestoreCollection("universities");
        deleteUniversity.innerHTML = `<option value="">Select University</option>`;
        universities.forEach(university => {
            const option = document.createElement("option");
            option.value = university.id;
            option.textContent = university.name;
            deleteUniversity.appendChild(option);
        });
    }

    // Function to populate courses
    async function populateCourses(universityId) {
        if (!universityId) return;
        const courses = await getFirestoreCollection(`universities/${universityId}/courses`);
        deleteCourse.innerHTML = `<option value="">Select Course</option>`;
        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.name;
            deleteCourse.appendChild(option);
        });
    }

    // Function to populate semesters
    async function populateSemesters(universityId, courseId) {
        if (!universityId || !courseId) return;
        const semesters = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester`);
        deleteSemester.innerHTML = `<option value="">Select Semester</option>`;
        semesters.forEach(semester => {
            const option = document.createElement("option");
            option.value = semester.id;
            option.textContent = semester.semester;
            deleteSemester.appendChild(option);
        });
    }

    // Function to populate subjects
    async function populateSubjects(universityId, courseId, semesterId) {
        if (!universityId || !courseId || !semesterId) return;
        const subjects = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`);
        deleteSubject.innerHTML = `<option value="">Select Subject</option>`;
        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            deleteSubject.appendChild(option);
        });
    }

    // Function to populate question papers
    async function populateQuestionPapers(universityId, courseId, semesterId, subjectId) {
        if (!universityId || !courseId || !semesterId || !subjectId) return;
        const questionPapers = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`);
        deleteQuestionPaper.innerHTML = `<option value="">Select Question Paper</option>`;
        questionPapers.forEach(paper => {
            const option = document.createElement("option");
            option.value = paper.id;
            option.textContent = paper.name;
            deleteQuestionPaper.appendChild(option);
        });
    }

    // Function to show feedback
    function showFeedback(feedbackElement, message, isSuccess) {
        feedbackElement.style.display = "block";
        feedbackElement.textContent = message;
        feedbackElement.style.color = isSuccess ? "green" : "red";
    }

    // Delete University
    document.getElementById("deleteUniversityButton").addEventListener("click", async () => {
        const universityId = deleteUniversity.value;
        if (universityId && window.confirm("Are you sure you want to delete this university and all its data? This action cannot be undone.")) {
            try {
                await deleteUniversityData(universityId);
                showFeedback(deleteUniversityFeedback, "University and all its data deleted successfully.", true);
            } catch (error) {
                showFeedback(deleteUniversityFeedback, "Failed to delete the university and its data.", false);
            }
        }
    });

    // Delete Course
    document.getElementById("deleteCourseButton").addEventListener("click", async () => {
        const universityId = deleteUniversity.value;
        const courseId = deleteCourse.value;
        if (universityId && courseId && window.confirm("Are you sure you want to delete this course and all its data? This action cannot be undone.")) {
            try {
                await deleteCourseData(universityId, courseId);
                showFeedback(deleteCourseFeedback, "Course and all its data deleted successfully.", true);
            } catch (error) {
                showFeedback(deleteCourseFeedback, "Failed to delete the course and its data.", false);
            }
        }
    });

    // Delete Semester
    document.getElementById("deleteSemesterButton").addEventListener("click", async () => {
        const universityId = deleteUniversity.value;
        const courseId = deleteCourse.value;
        const semesterId = deleteSemester.value;
        if (universityId && courseId && semesterId && window.confirm("Are you sure you want to delete this semester and all its data? This action cannot be undone.")) {
            try {
                await deleteSemesterData(universityId, courseId, semesterId);
                showFeedback(deleteSemesterFeedback, "Semester and all its data deleted successfully.", true);
            } catch (error) {
                showFeedback(deleteSemesterFeedback, "Failed to delete the semester and its data.", false);
            }
        }
    });

    // Delete Subject
    document.getElementById("deleteSubjectButton").addEventListener("click", async () => {
        const universityId = deleteUniversity.value;
        const courseId = deleteCourse.value;
        const semesterId = deleteSemester.value;
        const subjectId = deleteSubject.value;
        if (universityId && courseId && semesterId && subjectId && window.confirm("Are you sure you want to delete this subject and all its data? This action cannot be undone.")) {
            try {
                await deleteSubjectData(universityId, courseId, semesterId, subjectId);
                showFeedback(deleteSubjectFeedback, "Subject and all its data deleted successfully.", true);
            } catch (error) {
                showFeedback(deleteSubjectFeedback, "Failed to delete the subject and its data.", false);
            }
        }
    });

    // Delete Question Paper
    document.getElementById("deleteQuestionPaperButton").addEventListener("click", async () => {
        const universityId = deleteUniversity.value;
        const courseId = deleteCourse.value;
        const semesterId = deleteSemester.value;
        const subjectId = deleteSubject.value;
        const questionPaperId = deleteQuestionPaper.value;
        if (universityId && courseId && semesterId && subjectId && questionPaperId && window.confirm("Are you sure you want to delete this question paper? This action cannot be undone.")) {
            try {
                await deleteQuestionPaperData(universityId, courseId, semesterId, subjectId, questionPaperId);
                showFeedback(deleteQuestionPaperFeedback, "Question paper deleted successfully.", true);
            } catch (error) {
                showFeedback(deleteQuestionPaperFeedback, "Failed to delete the question paper.", false);
            }
        }
    });

    // Utility functions for Firestore operations
    async function getFirestoreCollection(path) {
        const snapshot = await getDocs(collection(db, path));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async function deleteDocumentFromFirestore(path) {
        const docRef = doc(db, path);
        await deleteDoc(docRef);
    }

    // Deleting a university and its data recursively
    async function deleteUniversityData(universityId) {
        const courses = await getFirestoreCollection(`universities/${universityId}/courses`);
        for (const course of courses) {
            const courseId = course.id;
            const semesters = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester`);
            for (const semester of semesters) {
                const semesterId = semester.id;
                const subjects = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`);
                for (const subject of subjects) {
                    const subjectId = subject.id;
                    const questionPapers = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`);
                    for (const questionPaper of questionPapers) {
                        await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers/${questionPaper.id}`);
                    }
                    await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}`);
                }
                await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}`);
            }
            await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}`);
        }
        await deleteDocumentFromFirestore(`universities/${universityId}`);
    }

    // Deleting a Course and its data recursively
    async function deleteCourseData(universityId, courseId) {
        try {
            // Fetch semesters for the course
            const semesters = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester`);
            for (const semester of semesters) {
                const semesterId = semester.id;
                // Fetch subjects for each semester
                const subjects = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`);
                for (const subject of subjects) {
                    const subjectId = subject.id;
                    // Fetch question papers for each subject
                    const questionPapers = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`);
                    for (const questionPaper of questionPapers) {
                        await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers/${questionPaper.id}`);
                    }
                    await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}`);
                }
                await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}`);
            }
            // Now delete the course itself
            await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}`);
            console.log("Course deleted successfully.");
        } catch (error) {
            console.error("Failed to delete course data:", error);
        }
    }


    // Deleting a Semester and its data recursively
    async function deleteSemesterData(universityId, courseId, semesterId) {
        try {
            // Fetch subjects for the semester
            const subjects = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects`);
            for (const subject of subjects) {
                const subjectId = subject.id;
                // Fetch question papers for each subject
                const questionPapers = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`);
                for (const questionPaper of questionPapers) {
                    await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers/${questionPaper.id}`);
                }
                await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}`);
            }
            // Now delete the semester itself
            await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}`);
            console.log("Semester deleted successfully.");
        } catch (error) {
            console.error("Failed to delete semester data:", error);
        }
    }



    // Deleting a Subject and its data recursively
    async function deleteSubjectData(universityId, courseId, semesterId, subjectId) {
        try {
            // Fetch question papers for the subject
            const questionPapers = await getFirestoreCollection(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers`);
            for (const questionPaper of questionPapers) {
                await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers/${questionPaper.id}`);
            }
            // Now delete the subject itself
            await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}`);
            console.log("Subject deleted successfully.");
        } catch (error) {
            console.error("Failed to delete subject data:", error);
        }
    }


    // Deleting a quesstion papers and its data recursively
    async function deleteQuestionPaperData(universityId, courseId, semesterId, subjectId, questionPaperId) {
        try {
            // Delete the specific question paper
            await deleteDocumentFromFirestore(`universities/${universityId}/courses/${courseId}/semester/${semesterId}/subjects/${subjectId}/questionPapers/${questionPaperId}`);
            console.log("Question paper deleted successfully.");
        } catch (error) {
            console.error("Failed to delete question paper data:", error);
        }
    }


});
