// signin.js

// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    Timestamp,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOGIfnmr_hkf85h6-7wngePIvCPDKEb8k",
    authDomain: "thequestionpaper-409f0.firebaseapp.com",
    databaseURL:
        "https://thequestionpaper-409f0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thequestionpaper-409f0",
    storageBucket: "thequestionpaper-409f0.appspot.com",
    messagingSenderId: "798858195313",
    appId: "1:798858195313:web:65f7dd64b82f6e7f4ac6d0",
    measurementId: "G-3R5D88WF9Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Select DOM elements
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signInForm = document.getElementById("signIn");
const signUpForm = document.getElementById("signup");
const passwordRecoveryLink = document.getElementById("recoverPasswordLink");
const passwordRecoveryModal = document.getElementById("passwordRecoveryModal");
const closeModalButton = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");
const passwordRecoveryForm = document.getElementById("passwordRecoveryForm");
const recoveryEmailInput = document.getElementById("recoveryEmail");
const passwordRecoveryMessage = document.getElementById("passwordRecoveryMessage");
const recoveryLoading = document.getElementById("recoveryLoading");

// Form Elements
const submitSignUpButton = document.getElementById("submitSignUp");
const signUpButtonText = document.getElementById("signUpButtonText");
const signUpLoading = document.getElementById("signUpLoading");
const signUpMessage = document.getElementById("signUpMessage");

const submitSignInButton = document.getElementById("submitSignIn");
const signInButtonText = document.getElementById("signInButtonText");
const signInLoading = document.getElementById("signInLoading");
const signInMessage = document.getElementById("signInMessage");

const fNameInput = document.getElementById("fName");
const lNameInput = document.getElementById("lName");
const rEmailInput = document.getElementById("rEmail");
const rPasswordInput = document.getElementById("rPassword");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Initialize Google and Facebook Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Helper Functions

/**
 * Validates the registration form inputs.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateSignUpForm() {
    const fName = fNameInput.value.trim();
    const lName = lNameInput.value.trim();
    const email = rEmailInput.value.trim();
    const password = rPasswordInput.value;

    // Regular expressions
    const nameRegex = /^[A-Za-z]{2,50}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!nameRegex.test(fName)) {
        displayMessage(signUpMessage, "First name must be 2-50 alphabetic characters.", "red");
        return false;
    }

    if (!nameRegex.test(lName)) {
        displayMessage(signUpMessage, "Last name must be 2-50 alphabetic characters.", "red");
        return false;
    }

    if (!validateEmail(email)) {
        displayMessage(signUpMessage, "Please enter a valid email address.", "red");
        return false;
    }

    if (!passwordRegex.test(password)) {
        displayMessage(signUpMessage, "Password must be at least 8 characters long and include uppercase, lowercase letters, and numbers.", "red");
        return false;
    }

    return true;
}

/**
 * Validates the login form inputs.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateSignInForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validateEmail(email)) {
        displayMessage(signInMessage, "Please enter a valid email address.", "red");
        return false;
    }

    if (password.length < 8) {
        displayMessage(signInMessage, "Password must be at least 8 characters long.", "red");
        return false;
    }

    return true;
}

/**
 * Validates an email address using regex.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Displays a message in the specified message element.
 * @param {HTMLElement} element - The message element.
 * @param {string} message - The message to display.
 * @param {string} color - The color of the message text.
 */
function displayMessage(element, message, color) {
    element.innerText = message;
    element.style.color = color;
    element.hidden = false;
}

/**
 * Clears the message in the specified message element.
 * @param {HTMLElement} element - The message element.
 */
function clearMessage(element) {
    element.innerText = "";
    element.hidden = true;
}

/**
 * Disables a button and shows a loading spinner.
 * @param {HTMLElement} button - The button to disable.
 * @param {HTMLElement} spinner - The spinner to show.
 */
function showLoading(button, spinner) {
    button.disabled = true;
    spinner.hidden = false;
}

/**
 * Enables a button and hides the loading spinner.
 * @param {HTMLElement} button - The button to enable.
 * @param {HTMLElement} spinner - The spinner to hide.
 */
function hideLoading(button, spinner) {
    button.disabled = false;
    spinner.hidden = true;
}

/**
 * Parses the display name into first and last names.
 * @param {string} displayName - The display name to parse.
 * @returns {Object} An object containing firstName and lastName.
 */
function parseName(displayName) {
    const nameParts = displayName ? displayName.trim().split(" ") : ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    return { firstName, lastName };
}

/**
 * Redirects the user based on their role.
 * @param {string} role - The role of the user.
 */
function redirectToAppropriatePage(role) {
    if (role === "admin") {
        window.location.href = "adminpnl.html";
    } else {
        window.location.href = "index.html";
    }
}

/**
 * Opens the password recovery modal and traps focus within it.
 */
function openModal() {
    passwordRecoveryModal.hidden = false;
    modalOverlay.hidden = false;
    // Trap focus
    trapFocus(passwordRecoveryModal);
}

/**
 * Closes the password recovery modal and releases focus.
 */
function closePasswordRecoveryModal() {
    passwordRecoveryModal.hidden = true;
    modalOverlay.hidden = true;
    // Reset form and messages
    passwordRecoveryForm.reset();
    clearMessage(passwordRecoveryMessage);
    // Release focus
    releaseFocus();
}

/**
 * Traps focus within a specified element.
 * @param {HTMLElement} element - The element to trap focus within.
 */
let focusedElementBeforeModal;

function trapFocus(element) {
    const focusableElements = element.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    focusedElementBeforeModal = document.activeElement;

    element.addEventListener('keydown', function(e) {
        const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);

        if (!isTabPressed) return;

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });

    firstFocusable.focus();
}

/**
 * Releases focus back to the element that was focused before the modal was opened.
 */
function releaseFocus() {
    if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
    }
}

// Toggle between Sign Up and Sign In forms
signUpButton.addEventListener("click", function () {
    signInForm.hidden = true;
    signUpForm.hidden = false;
    clearMessage(signInMessage);
    signUpForm.scrollIntoView({ behavior: "smooth" });
});

signInButton.addEventListener("click", function () {
    signInForm.hidden = false;
    signUpForm.hidden = true;
    clearMessage(signUpMessage);
    signInForm.scrollIntoView({ behavior: "smooth" });
});

// Open Password Recovery Modal
passwordRecoveryLink.addEventListener("click", function (e) {
    e.preventDefault();
    openModal();
});

// Close Password Recovery Modal
closeModalButton.addEventListener("click", function () {
    closePasswordRecoveryModal();
});
modalOverlay.addEventListener("click", function () {
    closePasswordRecoveryModal();
});

// Handle Password Recovery Form Submission
passwordRecoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = recoveryEmailInput.value.trim();

    // Clear previous messages
    clearMessage(passwordRecoveryMessage);

    if (!validateEmail(email)) {
        displayMessage(passwordRecoveryMessage, "Please enter a valid email address.", "red");
        return;
    }

    // Show loading indicator
    showLoading(recoveryFormSubmitButton, recoveryLoading);

    try {
        await sendPasswordResetEmail(auth, email);
        displayMessage(passwordRecoveryMessage, "Password reset email sent! Please check your inbox.", "green");
        // Optionally, close the modal after a delay
        setTimeout(() => {
            closePasswordRecoveryModal();
        }, 3000);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        let message = "An unexpected error occurred. Please try again.";
        switch (error.code) {
            case "auth/user-not-found":
                message = "No user found with this email.";
                break;
            case "auth/invalid-email":
                message = "Invalid email address format.";
                break;
            default:
                message = "Error: " + error.message;
        }
        displayMessage(passwordRecoveryMessage, message, "red");
    } finally {
        // Hide loading indicator
        hideLoading(recoveryFormSubmitButton, recoveryLoading);
    }
});

// Sign Up Functionality
signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
        return;
    }

    const fName = fNameInput.value.trim();
    const lName = lNameInput.value.trim();
    const email = rEmailInput.value.trim();
    const password = rPasswordInput.value;

    // Clear previous messages
    clearMessage(signUpMessage);

    // Show loading indicator
    showLoading(submitSignUpButton, signUpLoading);
    signUpButtonText.innerText = "Signing Up...";

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Store user details in Firestore
        await setDoc(doc(db, "users", user.uid), {
            createdAt: Timestamp.now(),
            email: email,
            firstName: fName,
            lastName: lName,
            role: "user", // Default role; change as needed
            emailVerified: user.emailVerified,
        });

        // Inform the user to verify their email
        displayMessage(signUpMessage, "Registration successful! A verification email has been sent to your email address. Please verify to log in.", "green");

        // Switch to sign-in form after a short delay
        setTimeout(() => {
            signUpForm.hidden = true;
            signInForm.hidden = false;
            signUpForm.reset();
            clearMessage(signUpMessage);
            signInForm.scrollIntoView({ behavior: "smooth" });
        }, 3000);
    } catch (error) {
        console.error("Error during sign up:", error);
        let message = "An unexpected error occurred. Please try again.";
        switch (error.code) {
            case "auth/email-already-in-use":
                message = "This email is already in use. Please use a different email or sign in.";
                break;
            case "auth/invalid-email":
                message = "Invalid email address format.";
                break;
            case "auth/weak-password":
                message = "Password is too weak. Please use a stronger password.";
                break;
            default:
                message = "Error: " + error.message;
        }
        displayMessage(signUpMessage, message, "red");
    } finally {
        // Hide loading indicator
        hideLoading(submitSignUpButton, signUpLoading);
        signUpButtonText.innerText = "Sign Up";
    }
});

// Sign In Functionality
signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateSignInForm()) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous messages
    clearMessage(signInMessage);

    // Show loading indicator
    showLoading(submitSignInButton, signInLoading);
    signInButtonText.innerText = "Signing In...";

    try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
            displayMessage(signInMessage, "Please verify your email before signing in. Check your inbox for a verification email.", "red");
            return;
        }

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            redirectToAppropriatePage(userData.role);
        } else {
            displayMessage(signInMessage, "User data not found. Please contact support.", "red");
        }
    } catch (error) {
        console.error("Error during sign in:", error);
        let message = "An unexpected error occurred. Please try again.";
        switch (error.code) {
            case "auth/invalid-email":
                message = "Invalid email address format.";
                break;
            case "auth/user-not-found":
                message = "No user found with this email.";
                break;
            case "auth/wrong-password":
                message = "Incorrect password.";
                break;
            default:
                message = "Error: " + error.message;
        }
        displayMessage(signInMessage, message, "red");
    } finally {
        // Hide loading indicator
        hideLoading(submitSignInButton, signInLoading);
        signInButtonText.innerText = "Sign In";
    }
});

// Handle Social Logins using DRY Principle
async function handleSocialLogin(provider) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // If new user, set default data
            const { firstName, lastName } = parseName(user.displayName);
            await setDoc(userDocRef, {
                createdAt: Timestamp.now(),
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                role: "user",
                emailVerified: user.emailVerified,
            });
        }

        // Fetch updated user data
        const updatedUserDoc = await getDoc(userDocRef);
        const userData = updatedUserDoc.data();

        // Redirect based on role
        if (userData.emailVerified) {
            redirectToAppropriatePage(userData.role);
        } else {
            await sendEmailVerification(user);
            alert("Please verify your email address. A verification email has been sent to your email.");
        }
    } catch (error) {
        console.error("Social Sign-In Error:", error);
        let message = "An unexpected error occurred during social sign-in. Please try again.";
        if (error.code === "auth/popup-closed-by-user") {
            message = "The popup was closed before completing the sign-in. Please try again.";
        }
        alert(message);
    }
}

// Google Sign-In
document.querySelectorAll(".social-btn.google").forEach((button) => {
    button.addEventListener("click", () => handleSocialLogin(googleProvider));
});

// Facebook Sign-In
document.querySelectorAll(".social-btn.facebook").forEach((button) => {
    button.addEventListener("click", () => handleSocialLogin(facebookProvider));
});

// Monitor Auth State Changes (Optional but recommended)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, you can perform additional checks or redirections here
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            redirectToAppropriatePage(userData.role);
        }
    } else {
        // No user is signed in, you can show the sign-in form
        signInForm.hidden = false;
    }
});
