document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    // ... (بقية تعريفات العناصر الأخرى مثل shareButton, sidebar, etc.) ...
    const shareButton = document.getElementById('share-button');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');
    const dynamicBackgroundArea = document.getElementById('dynamic-background-area');


    // --- Function to set the theme (light or dark) ---
    // This function encapsulates the logic for applying the theme
    // and saving the preference to localStorage.
    function setTheme(themeName) {
        if (themeName === "dark") {
            html.classList.add("dark");
            // Ensure the toggle switch reflects the dark mode state (checked)
            if (themeToggle) {
                themeToggle.checked = true;
            }
            localStorage.setItem('theme', 'dark');
        } else { // themeName is "light"
            html.classList.remove("dark");
            // Ensure the toggle switch reflects the light mode state (unchecked)
            if (themeToggle) {
                themeToggle.checked = false;
            }
            localStorage.setItem('theme', 'light');
        }
    }

    // --- Initial Theme Application on Page Load ---
    // Check for a saved theme preference in localStorage.
    // If found, apply it; otherwise, default to "dark" mode.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme("dark"); // Default theme if no preference is saved
    }

    // --- Theme Toggle Event Listener ---
    // Attach an event listener to the theme toggle switch.
    // When the switch state changes, update the theme accordingly.
    if (themeToggle) {
        themeToggle.addEventListener("change", function() {
            // If the toggle is checked (true), set theme to dark; otherwise, set to light.
            setTheme(this.checked ? "dark" : "light");
        });
    }

    // --- Sidebar Toggle Logic ---
    shareButton.addEventListener('click', () => {
        sidebar.classList.remove('translate-x-full');
    });

    closeSidebarButton.addEventListener('click', () => {
        sidebar.classList.add('translate-x-full');
    });

    // Close sidebar when clicking outside (optional, but good UX)
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !shareButton.contains(event.target) && !sidebar.classList.contains('translate-x-full')) {
            sidebar.classList.add('translate-x-full');
        }
    });

    // --- Page Navigation Logic ---
    function showPage(pageId) {
        contentSections.forEach(section => {
            section.classList.add('hidden'); // Hide all sections
        });
        document.getElementById(`${pageId}-page`).classList.remove('hidden'); // Show the selected section
        sidebar.classList.add('translate-x-full'); // Close sidebar after navigation
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;
            showPage(page);
        });
    });

    // Initially show the home page
    showPage('home');

    // --- Dynamic Background (Meteor Trails) Logic ---
    // Reduced number of meteors for performance
    const numberOfMeteors = 12; // Reduced from 20
    const minSize = 10;
    const maxSize = 30; // Reduced max size
    const minDuration = 25; // Increased min duration
    const maxDuration = 50; // Increased max duration

    function createMeteor() {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');

        const size = Math.random() * (maxSize - minSize) + minSize;
        meteor.style.width = `${size}px`;
        meteor.style.height = `${size}px`;

        // Start position: Randomly across the top, slightly off-screen left
        const startX = Math.random() * window.innerWidth * 1.5 - window.innerWidth * 0.5;
        const startY = -size; // Start above the viewport
        meteor.style.left = `${startX}px`;
        meteor.style.top = `${startY}px`;

        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        const delay = Math.random() * maxDuration; // Random delay for staggered animation

        meteor.style.animationDuration = `${duration}s`;
        meteor.style.animationDelay = `${delay}s`;

        // Add a random rotation to make them look more dynamic
        const initialRotation = Math.random() * 360;
        meteor.style.transform = `rotate(${initialRotation}deg)`;

        dynamicBackgroundArea.appendChild(meteor);

        // Remove meteor after animation ends to prevent accumulation
        meteor.addEventListener('animationend', () => {
            meteor.remove();
            createMeteor(); // Create a new one to keep the animation continuous
        });
    }

    // Create initial meteors
    for (let i = 0; i < numberOfMeteors; i++) {
        createMeteor();
    }

    // --- Gemini API Integration: Project Description Generator ---
    async function generateDescription(projectId, projectTitle) {
        const inputElement = document.getElementById(`${projectId}-input`);
        const outputElement = document.getElementById(`generated-${projectId}-desc`);
        const spinnerElement = document.getElementById(`spinner-${projectId}`);

        const prompt = `Generate a concise and engaging project description (around 50-70 words) for a portfolio website. The project is titled "${projectTitle}". Here are some keywords/brief idea: "${inputElement.value}". Focus on its purpose, key features, and impact.`;

        outputElement.classList.add('hidden'); // Hide previous output
        spinnerElement.classList.remove('hidden'); // Show spinner

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                outputElement.textContent = text;
                outputElement.classList.remove('hidden'); // Show generated text
            } else {
                outputElement.textContent = "Failed to generate description. Please try again.";
                outputElement.classList.remove('hidden');
                console.error("Gemini API response structure unexpected:", result);
            }
        } catch (error) {
            outputElement.textContent = "Error generating description. Please check your network or try again later.";
            outputElement.classList.remove('hidden');
            console.error("Error calling Gemini API:", error);
        } finally {
            spinnerElement.classList.add('hidden'); // Hide spinner
        }
    }

    // Attach event listeners to generate description buttons
    document.getElementById('generate-alpha-desc').addEventListener('click', () => {
        generateDescription('project-alpha', 'Project Alpha');
    });

    document.getElementById('generate-creative-desc').addEventListener('click', () => {
        generateDescription('creative-portfolio', 'Creative Portfolio');
    });
});
