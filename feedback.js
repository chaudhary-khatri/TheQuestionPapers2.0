// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOGIfnmr_hkf85h6-7wngePIvCPDKEb8k",
    authDomain: "thequestionpaper-409f0.firebaseapp.com",
    databaseURL: "https://thequestionpaper-409f0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thequestionpaper-409f0",
    storageBucket: "thequestionpaper-409f0.appspot.com",
    messagingSenderId: "798858195313",
    appId: "1:798858195313:web:65f7dd64b82f6e7f4ac6d0",
    measurementId: "G-3R5D88WF9Q",
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cached user role to minimize Firestore reads
let cachedUserRole = null;

// Utility function to sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Feedback section elements
const feedbackHeader = document.getElementById('feedback-header');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name'); // Added name input
const categorySelect = document.getElementById('category'); // Category select element

// Feedback filter elements
const filterCategorySelect = document.getElementById('filter-category');

// Initialize stars for rating
const stars = document.querySelectorAll('.star');
let selectedRating = 0;

// Event listeners for rating stars
stars.forEach((star) => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'), 10);
        updateStars();
    });

    star.addEventListener('mouseover', () => {
        highlightStars(parseInt(star.getAttribute('data-value'), 10));
    });

    star.addEventListener('mouseout', () => {
        updateStars();
    });
});

// Function to highlight stars on hover
function highlightStars(rating) {
    stars.forEach((star) => {
        if (parseInt(star.getAttribute('data-value'), 10) <= rating) {
            star.classList.add('highlight');
        } else {
            star.classList.remove('highlight');
        }
    });
}

// Function to update stars based on selected rating
function updateStars() {
    stars.forEach((star) => {
        if (parseInt(star.getAttribute('data-value'), 10) <= selectedRating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Function to get user role with caching
async function getUserRole(uid) {
    if (cachedUserRole) return cachedUserRole;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        cachedUserRole = userDoc.data().role; // Assuming 'role' is the field name
        return cachedUserRole;
    }
    return null; // Role not found
}

// Function to display feedback options based on role
function displayFeedbackOptions(role) {
    // Example: Show/hide admin features based on role
    // This can be expanded based on specific requirements
    if (role === 'admin') {
        // Show admin-specific UI elements if any
    } else {
        // Hide admin-specific UI elements if any
    }
}

// Authentication state management
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        emailInput.value = user.email; // Auto-fill email input
        nameInput.value = user.displayName || ''; // Auto-fill name input if available

        try {
            const userRole = await getUserRole(user.uid);
            displayFeedbackOptions(userRole); // Show/hide reply options based on role
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    } else {
        // User is not signed in
        feedbackHeader.innerText = 'Please log in for feedback and rating';
        nameInput.value = ''; // Clear the name input
        emailInput.value = ''; // Clear the email input
    }
});

// Feedback form submission handling
document.getElementById('feedback-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in/log in to submit feedback and ratings.');
        feedbackHeader.innerText = 'Please log in for feedback and rating';
        return;
    }

    const name = user.displayName || 'Anonymous';
    const email = user.email;
    const message = document.getElementById('feedback-text').value.trim();
    const category = categorySelect.value;

    // Client-side validation
    if (!message) {
        alert('Please enter your feedback.');
        return;
    }
    if (selectedRating === 0) {
        alert('Please select a rating.');
        return;
    }
    if (!category) {
        alert('Please select a category.');
        return;
    }

    try {
        const feedbackDoc = await addDoc(collection(db, 'feedback'), {
            name: name,
            email: email,
            message: message,
            rating: selectedRating,
            category: category,
            createdAt: serverTimestamp(),
            reply: '', // Initialize with an empty string for replies
            userId: user.uid, // Link feedback to user ID
        });

        // Reset the form and stars
        document.getElementById('feedback-response').innerText = 'Thank you for your feedback!';
        document.getElementById('feedback-form').reset();
        selectedRating = 0;
        updateStars();

        // Note: Feedback will be displayed via real-time listener
    } catch (error) {
        document.getElementById('feedback-response').innerText = 'Error submitting feedback. Please try again.';
        console.error('Error adding feedback: ', error);
    }
});

// Function to handle replies and update Firestore
async function handleReply(docId, replyMessage) {
    const feedbackRef = doc(db, 'feedback', docId);
    try {
        await updateDoc(feedbackRef, {
            reply: replyMessage, // Update the reply field
        });
        // No need to manually fetch feedback due to real-time listener
    } catch (error) {
        console.error('Error replying to feedback: ', error);
    }
}

// Function to display feedback
async function displayFeedback(docId, name, message, selectedRating, reply, category) {
    const feedbackDisplay = document.getElementById('feedback-display');
    const feedbackItem = document.createElement('div');
    feedbackItem.classList.add('feedback-item');
    feedbackItem.innerHTML = `
        <strong>${sanitizeHTML(name)}</strong>
        <span class="category-tag">${sanitizeHTML(category)}</span>
        <div class="rating-display">${'★'.repeat(selectedRating)}${'☆'.repeat(5 - selectedRating)}</div>
        <p>${sanitizeHTML(message)}</p>
        <div class="reply-section">
            <strong>TheQuestionPaper:</strong>
            <p id="reply-${docId}">${sanitizeHTML(reply) || 'No reply yet.'}</p>
            <input type="text" class="reply-input" placeholder="Type your reply here..." style="display:none;" />
            <button class="reply-button" data-doc-id="${docId}" style="display:none;">Reply</button>
        </div>
    `;

    // Append feedback item to display
    feedbackDisplay.appendChild(feedbackItem);

    // Check if user is an admin
    const user = auth.currentUser;
    if (user) {
        let userRole = cachedUserRole;
        if (!userRole) {
            userRole = await getUserRole(user.uid);
        }

        if (userRole === 'admin') {
            // Show reply option only for admin
            const replyInput = feedbackItem.querySelector('.reply-input');
            const replyButton = feedbackItem.querySelector('.reply-button');
            replyInput.style.display = 'inline'; // Show reply input for admin
            replyButton.style.display = 'inline'; // Show reply button for admin

            // Add event listener to reply button
            replyButton.addEventListener('click', async () => {
                const replyMessage = replyInput.value.trim();
                if (replyMessage) {
                    await handleReply(docId, replyMessage); // Register the reply
                    replyInput.value = ''; // Clear the input field after reply
                } else {
                    alert('Please enter a reply before submitting.');
                }
            });
        }
    }
}

// Fetch feedback based on selected category
function fetchFeedback(category = 'All') {
    const feedbackCollection = collection(db, 'feedback');
    let q;

    if (category === 'All') {
        q = query(feedbackCollection, orderBy('createdAt', 'desc'), limit(100));
    } else {
        q = query(feedbackCollection, where('category', '==', category), orderBy('createdAt', 'desc'), limit(100));
    }

    // Real-time listener for Firestore
    onSnapshot(q, (snapshot) => {
        const feedbackDisplay = document.getElementById('feedback-display');
        feedbackDisplay.innerHTML = ''; // Clear existing feedback

        if (snapshot.empty) {
            feedbackDisplay.innerHTML = 'No feedback available for this category.';
        }

        snapshot.forEach((doc) => {
            const feedbackData = doc.data();
            const categoryData = feedbackData.category || 'Uncategorized';
            displayFeedback(
                doc.id,
                feedbackData.name,
                feedbackData.message,
                feedbackData.rating,
                feedbackData.reply,
                categoryData
            );
        });
    }, (error) => {
        console.error('Error fetching feedback:', error);
    });
}

// Event listener for feedback category filter change
if (filterCategorySelect) {
    filterCategorySelect.addEventListener('change', () => {
        const selectedCategory = filterCategorySelect.value;
        fetchFeedback(selectedCategory);
    });
}

// Initial fetch of feedback when the page loads
window.onload = () => {
    const initialCategory = filterCategorySelect ? filterCategorySelect.value : 'All';
    fetchFeedback(initialCategory);
};


// Initial fetch of feedback on page load with default category
window.onload = () => {
    const initialCategory = filterCategorySelect ? filterCategorySelect.value : 'All';
    fetchFeedback(initialCategory);
};
