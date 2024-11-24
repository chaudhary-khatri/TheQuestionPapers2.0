import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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
const storage = getStorage(app);

// DOM Elements
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileFirstName = document.getElementById('profileFirstName');
const profileLastName = document.getElementById('profileLastName');
const profilePicture = document.getElementById('profilePicture');
const logoutButton = document.getElementById('logoutButton');
const uploadButton = document.getElementById('uploadButton');
const profilePicInput = document.getElementById('profilePicInput');
const editProfileButton = document.getElementById('editProfileButton');
const editProfileContainer = document.createElement('div');
const downloadsList = document.getElementById('downloadsList');

// Edit Profile Section
editProfileContainer.classList.add('edit-profile-container');
editProfileContainer.innerHTML = `
    <h2>Edit Profile</h2>
    <label for="editFirstName">First Name:</label>
    <input type="text" id="editFirstName" placeholder="First Name" />
    <label for="editLastName">Last Name:</label>
    <input type="text" id="editLastName" placeholder="Last Name" />
    <button id="saveProfileButton">Save Changes</button>
    <button id="cancelEditButton">Cancel</button>
`;
editProfileContainer.style.display = 'none'; // Hidden initially
document.querySelector('.profile-container').appendChild(editProfileContainer);

// Fetch and Display User Profile Data
async function loadUserProfile(user) {
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            profileName.textContent = `${userData.firstName} ${userData.lastName}`;
            profileEmail.textContent = user.email;
            profileFirstName.textContent = userData.firstName || 'Not Available';
            profileLastName.textContent = userData.lastName || 'Not Available';

            // Check if user has uploaded a profile picture, otherwise use Gmail photoURL
            if (userData.profilePicture) {
                profilePicture.src = userData.profilePicture;
            } else if (user.photoURL) {
                // Use Gmail profile picture if available
                profilePicture.src = user.photoURL;
            } else {
                // Fallback to a default image if no profile picture or Gmail picture is available
                profilePicture.src = 'path/to/default-image.png'; // Replace with your default image path
            }
            
            loadUserDownloads(user.uid); // Fetch and display user downloads
        } else {
            console.error('User document not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Fetch and Display User Downloads
async function loadUserDownloads(uid) {
    try {
        const downloadsRef = doc(db, 'users', uid);
        const userDoc = await getDoc(downloadsRef);
        const userDownloads = userDoc.data().downloads || [];

        downloadsList.innerHTML = ''; // Clear existing list
        if (userDownloads.length > 0) {
            userDownloads.forEach(download => {
                const listItem = document.createElement('li');
                listItem.textContent = download;
                downloadsList.appendChild(listItem);
            });
        } else {
            downloadsList.innerHTML = '<li>No downloads available.</li>';
        }
    } catch (error) {
        console.error('Error fetching user downloads:', error);
    }
}

// Handle User Authentication State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadUserProfile(user);
    } else {
        window.location.href = 'signin.html';
    }
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'signin.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

// Handle Profile Picture Upload
uploadButton.addEventListener('click', () => {
    profilePicInput.click();
});

profilePicInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, 'users', auth.currentUser.uid), { profilePicture: downloadURL });
            profilePicture.src = downloadURL;
            alert('Profile picture uploaded successfully!');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    }
});

// Edit Profile Button
editProfileButton.addEventListener('click', () => {
    editProfileContainer.style.display = 'block';
    document.getElementById('editFirstName').value = profileFirstName.textContent;
    document.getElementById('editLastName').value = profileLastName.textContent;
});

// Save Profile Changes
document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const updatedFirstName = document.getElementById('editFirstName').value;
    const updatedLastName = document.getElementById('editLastName').value;
    
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            firstName: updatedFirstName,
            lastName: updatedLastName,
        });
        profileFirstName.textContent = updatedFirstName;
        profileLastName.textContent = updatedLastName;
        profileName.textContent = `${updatedFirstName} ${updatedLastName}`;
        editProfileContainer.style.display = 'none'; // Hide edit section
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});

// Cancel Edit Profile
document.getElementById('cancelEditButton').addEventListener('click', () => {
    editProfileContainer.style.display = 'none'; // Hide edit section
});
