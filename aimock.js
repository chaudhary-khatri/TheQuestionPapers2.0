// Get elements
const chatbot = document.getElementById('chatbot');
const openChatbotBtn = document.getElementById('openChatbot');
const closeChatbotBtn = document.getElementById('closeChatbot');
const sendMessageBtn = document.getElementById('sendMessage');
const userMessageInput = document.getElementById('userMessage');
const chatbotMessages = document.getElementById('chatbotMessages');

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "thequestionpaper-409f0.firebaseapp.com",
  projectId: "thequestionpaper-409f0",
  storageBucket: "thequestionpaper-409f0.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Function to open chatbot
openChatbotBtn.onclick = () => {
  chatbot.style.display = 'block';
};

// Function to close chatbot
closeChatbotBtn.onclick = () => {
  chatbot.style.display = 'none';
};

// Function to send user message
sendMessageBtn.onclick = async () => {
  const userMessage = userMessageInput.value.trim();
  if (userMessage) {
    displayMessage('User', userMessage);
    userMessageInput.value = '';
    await handleChatbotResponse(userMessage);
  }
};

// Function to display messages
function displayMessage(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = `${sender}: ${message}`;
  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Scroll to bottom
}

// Function to handle user request and create mock tests
async function handleChatbotResponse(message) {
  try {
    // Example logic to fetch data from Firestore and generate mock test
    const mockTestData = await generateMockTest(message);
    
    // Here you can create the Google Form based on the mockTestData
    // This is a placeholder; you'll need to implement the Google Forms API or
    // a method to create the form based on the collected data.
    
    const botResponse = `I've created your mock test: ${mockTestData}. You can fill it out in the Google Form.`;
    displayMessage('Chatbot', botResponse);
  } catch (error) {
    console.error("Error:", error);
    displayMessage('Chatbot', "I'm sorry, I couldn't create the mock test. Please try again.");
  }
}

// Mock function to generate a mock test based on the user's request
async function generateMockTest(userRequest) {
  // Example: Query Firestore to get data based on the userRequest
  const querySnapshot = await firestore.collection('yourCollection').get();
  let questions = [];

  querySnapshot.forEach((doc) => {
    questions.push(doc.data().question);
  });

  // Here you can implement your logic to create a mock test using `questions` and userRequest
  return questions.join(", "); // Return a string of questions for now
}
