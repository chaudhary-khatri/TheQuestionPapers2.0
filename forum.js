import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

// DOM Elements
const questionInput = document.getElementById("questionInput");
const postQuestionButton = document.getElementById("postQuestionButton");
const questionsList = document.getElementById("questionsList");

// Function to handle posting a question
async function postQuestion() {
    const question = questionInput.value.trim();
    const user = auth.currentUser;

    if (question && user) {
        const { displayName, photoURL } = user;

        try {
            const questionRef = collection(db, "questions");

            // Add question to Firestore
            await addDoc(questionRef, {
                userId: user.uid,
                username: displayName || "Anonymous",
                profilePic: photoURL || "default-profile-pic-url",
                question: question,
                timestamp: serverTimestamp(),
                replies: [],
                likes: 0,
                dislikes: 0,
                votedUsers: [] // Track users who voted
            });

            alert("Question posted successfully!");
            questionInput.value = ""; // Clear input after submission
            loadQuestions(); // Reload the list of questions
        } catch (error) {
            console.error("Error posting question:", error);
            alert("Error posting question.");
        }
    } else {
        alert("Please Login");
    }
}

// Function to handle like/dislike voting
async function handleVote(questionId, voteType) {
    const questionDocRef = doc(db, "questions", questionId);
    const questionDoc = await getDoc(questionDocRef);
    const questionData = questionDoc.data();

    if (questionData.votedUsers && questionData.votedUsers.includes(auth.currentUser.uid)) {
        console.log('User has already voted!');
        return; // User has already voted, exit function
    }

    // Determine the action based on vote type
    if (voteType === 'like') {
        // Increment likes
        await updateDoc(questionDocRef, {
            likes: questionData.likes + 1,
            votedUsers: arrayUnion(auth.currentUser.uid)
        });
    } else if (voteType === 'dislike') {
        // Increment dislikes
        await updateDoc(questionDocRef, {
            dislikes: questionData.dislikes + 1,
            votedUsers: arrayUnion(auth.currentUser.uid)
        });
    }
}

// Function to load questions from Firestore
function loadQuestions() {
    questionsList.innerHTML = ""; // Clear previous questions

    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));

    // Fetch real-time updates of questions
    onSnapshot(q, (querySnapshot) => {
        questionsList.innerHTML = ""; // Clear the list before adding new questions

        querySnapshot.forEach((questionDoc) => {
            const questionData = questionDoc.data();
            const listItem = document.createElement("li");
            listItem.dataset.questionId = questionDoc.id; // Attach question ID to the list item

            // Create user info section
            const userInfo = document.createElement("div");
            userInfo.classList.add("user-info");

            const userImage = document.createElement("img");
            userImage.src = questionData.profilePic;
            userImage.alt = questionData.username;
            userImage.classList.add("user-profile-pic");

            const userName = document.createElement("span");
            userName.textContent = questionData.username;
            userName.classList.add("username");

            const timePosted = document.createElement("span");
            timePosted.textContent = new Date(questionData.timestamp.seconds * 1000).toLocaleString();
            timePosted.classList.add("timestamp");

            userInfo.appendChild(userImage);
            userInfo.appendChild(userName);
            userInfo.appendChild(timePosted);

            // Create question content section
            const questionContent = document.createElement("div");
            questionContent.classList.add("question-content");
            questionContent.textContent = questionData.question;

            // Like/Dislike buttons
            const likeButton = document.createElement("button");
            likeButton.textContent = `👍${questionData.likes || 0}`;
            likeButton.classList.add("like-button");

            const dislikeButton = document.createElement("button");
            dislikeButton.textContent = `👎${questionData.dislikes || 0}`;
            dislikeButton.classList.add("dislike-button");

            // Event listeners for Like/Dislike buttons
            likeButton.addEventListener("click", async () => {
                const questionId = listItem.dataset.questionId;
                await handleVote(questionId, 'like');
            });

            dislikeButton.addEventListener("click", async () => {
                const questionId = listItem.dataset.questionId;
                await handleVote(questionId, 'dislike');
            });

            // Show number of replies
            const repliesCount = document.createElement("span");
            repliesCount.textContent = `Replies: ${questionData.replies.length || 0}`;

            // Show 'View All' button if there are more than 3 replies
            const repliesContainer = document.createElement("div");
            const replySection = document.createElement("div");
            replySection.classList.add("reply-section");

            if (questionData.replies && questionData.replies.length > 3) {
                const viewAllButton = document.createElement("button");
                viewAllButton.textContent = "View All Replies";
                viewAllButton.classList.add("view-all-replies");

                viewAllButton.addEventListener("click", () => {
                    repliesContainer.innerHTML = ''; // Clear current replies
                    questionData.replies.forEach((reply) => {
                        createReply(reply, repliesContainer);
                    });
                    viewAllButton.remove(); // Remove the "View All" button
                });

                repliesContainer.appendChild(viewAllButton);
            }

            // Show only the latest 3 replies initially
            const latestReplies = questionData.replies.slice(0, 3);
            latestReplies.forEach((reply) => {
                createReply(reply, repliesContainer);
            });

            // Create reply input and button
            const replyInput = document.createElement("input");
            replyInput.type = "text";
            replyInput.placeholder = "Write a reply...";

            const replyButton = document.createElement("button");
            replyButton.textContent = "Post Reply";
            replyButton.classList.add("reply-button");

            replyButton.addEventListener("click", async () => {
                const replyText = replyInput.value.trim();
                const user = auth.currentUser;

                if (replyText && user) {
                    const { displayName, photoURL } = user;

                    try {
                        const questionDocRef = doc(db, "questions", questionDoc.id);

                        // Get the current timestamp outside of arrayUnion
                        const timestamp = new Date();

                        // Add reply to Firestore
                        await updateDoc(questionDocRef, {
                            replies: arrayUnion({
                                username: displayName || "Anonymous",
                                profilePic: photoURL || "default-profile-pic-url",
                                reply: replyText,
                                timestamp: timestamp
                            })
                        });

                        replyInput.value = ""; // Clear the reply input field
                        console.log("Reply posted successfully!");

                    } catch (error) {
                        console.error("Error posting reply:", error);
                        alert("Error posting reply.");
                    }
                } else {
                    alert("Please enter a reply.");
                }
            });

            // Append all elements to the question list item
            listItem.appendChild(userInfo);
            listItem.appendChild(questionContent);
            listItem.appendChild(likeButton);
            listItem.appendChild(dislikeButton);
            listItem.appendChild(repliesCount);
            listItem.appendChild(repliesContainer);
            listItem.appendChild(replySection);
            listItem.appendChild(replyInput);
            listItem.appendChild(replyButton);

            questionsList.appendChild(listItem);
        });
    });
}

// Helper function to create a reply item
function createReply(reply, container) {
    const replyItem = document.createElement("li");
    const replyUserInfo = document.createElement("div");
    replyUserInfo.classList.add("user-info");

    const replyUserImage = document.createElement("img");
    replyUserImage.src = reply.profilePic;
    replyUserImage.alt = reply.username;
    replyUserImage.classList.add("user-profile-pic");

    const replyUserName = document.createElement("span");
    replyUserName.textContent = reply.username;
    replyUserName.classList.add("username");

    const replyTime = document.createElement("span");
    replyTime.textContent = new Date(reply.timestamp.seconds * 1000).toLocaleString();
    replyTime.classList.add("timestamp");

    replyUserInfo.appendChild(replyUserImage);
    replyUserInfo.appendChild(replyUserName);
    replyUserInfo.appendChild(replyTime);

    const replyContent = document.createElement("div");
    replyContent.classList.add("reply-content");
    replyContent.textContent = reply.reply;

    replyItem.appendChild(replyUserInfo);
    replyItem.appendChild(replyContent);

    container.appendChild(replyItem);
}

// Initialize the page by loading existing questions
loadQuestions();

// Event listener for posting a question
postQuestionButton.addEventListener("click", postQuestion);
