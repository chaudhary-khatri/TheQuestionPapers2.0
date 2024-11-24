import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";  // Import Firebase Analytics

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOGIfnmr_hkf85h6-7wngePIvCPDKEb8k",
    authDomain: "thequestionpaper-409f0.firebaseapp.com",
    databaseURL: "https://thequestionpaper-409f0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thequestionpaper-409f0",
    storageBucket: "thequestionpaper-409f0.appspot.com",
    messagingSenderId: "798858195313",
    appId: "1:798858195313:web:65f7dd64b82f6e7f4ac6d0",
    measurementId: "G-3R5D88WF9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);  // Initialize Firebase Analytics

document.addEventListener('DOMContentLoaded', () => {
    const profileLink = document.getElementById('profileLink');
    const profileIcon = document.getElementById('profileIcon');
    const profileName = document.getElementById('profileName');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is logged in
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const firstName = userData.firstName || user.displayName || user.email.split('@')[0];

                    profileName.textContent = firstName;
                    profileLink.querySelector('a').href = 'profile.html';

                    // Set the profile icon if available
                    if (userData.profileIcon) {
                        profileIcon.src = userData.profileIcon;
                    } else {
                        profileIcon.src = 'path/to/default/icon.png'; // Default icon
                    }
                } else {
                    // If no user document, redirect to signin
                    profileName.textContent = 'Login';
                    profileLink.querySelector('a').href = 'signin.html';
                    profileIcon.src = 'path/to/default/icon.png'; // Default icon
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                profileName.textContent = 'Login';
                profileLink.querySelector('a').href = 'signin.html';
                profileIcon.src = 'path/to/default/icon.png'; // Default icon
            }
        } else {
            // User is not logged in
            profileName.textContent = 'Login';
            profileLink.querySelector('a').href = 'signin.html';
            profileIcon.src = 'path/to/default/icon.png'; // Default icon
        }
    });
});
