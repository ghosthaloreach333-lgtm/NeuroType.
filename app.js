// NeuroType Application Logic
// Handles user authentication, account management, and game logic

class NeuroTypeApp {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    // Account Management
    createAccount(username, password) {
        // Check if username already exists
        if (localStorage.getItem(`user_${username}`)) {
            return { success: false, message: "Username already exists" };
        }

        if (username.length < 3) {
            return { success: false, message: "Username must be at least 3 characters" };
        }

        if (password.length < 6) {
            return { success: false, message: "Password must be at least 6 characters" };
        }

        // Check for special character in password
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        if (!hasSpecialChar) {
            return { success: false, message: "Password must contain at least one special character (!@#$%^&* etc.)" };
        }

        const userData = {
            username: username,
            password: password,
            createdAt: new Date().toISOString(),
            placementComplete: false,
            baslineWPM: 0,
            stats: {
                averageWPM: 0,
                bestWPM: 0,
                wins: 0,
                losses: 0,
                totalRaces: 0,
                races: []
            }
        };

        localStorage.setItem(`user_${username}`, JSON.stringify(userData));
        this.login(username, password);
        return { success: true, message: "Account created successfully" };
    }

    login(username, password) {
        const userData = localStorage.getItem(`user_${username}`);
        
        if (!userData) {
            return { success: false, message: "User not found" };
        }

        const user = JSON.parse(userData);
        if (user.password !== password) {
            return { success: false, message: "Incorrect password" };
        }

        localStorage.setItem("currentUser", username);
        this.currentUser = user;
        return { success: true, message: "Logged in successfully" };
    }

    logout() {
        localStorage.removeItem("currentUser");
        this.currentUser = null;
    }

    loadCurrentUser() {
        const username = localStorage.getItem("currentUser");
        if (username) {
            const userData = localStorage.getItem(`user_${username}`);
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Game Logic
    generatePlacementPrompt() {
        const prompts = [
            "The quick brown fox jumps over the lazy dog",
            "NeuroType helps you improve your typing speed",
            "Practice makes perfect in competitive typing",
            "Speed and accuracy are keys to victory",
            "Challenge yourself and beat the bot",
            "Every keystroke brings you closer to victory",
            "Master the keyboard and dominate the races",
            "Your fingers will fly across the keyboard",
            "Typing races push you to your limits",
            "Become a typing champion today"
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    // Calculate WPM: (characters typed / 5) / minutes
    calculateWPM(characters, timeInSeconds) {
        const minutes = timeInSeconds / 60;
        const words = characters / 5;
        return Math.round(words / minutes);
    }

    // Bot speed adaptation: returns WPM slightly faster or slower than player average
    getBotSpeed(playerAverageWPM, difficulty = 'adaptive') {
        const variance = Math.random() * 10 + 5; // 5-15 WPM variance
        
        if (difficulty === 'adaptive') {
            // 50% chance bot is faster, 50% slower
            const faster = Math.random() > 0.5;
            return faster ? playerAverageWPM + variance : playerAverageWPM - variance;
        }
        return playerAverageWPM;
    }

    // Check if user has completed placement match
    hasCompletedPlacement() {
        return this.currentUser && this.currentUser.placementComplete;
    }

    // Record placement match completion
    completePlacement(baselineWPM) {
        if (!this.isLoggedIn()) return false;

        const username = this.currentUser.username;
        const userData = JSON.parse(localStorage.getItem(`user_${username}`));

        userData.placementComplete = true;
        userData.baslineWPM = baselineWPM;

        localStorage.setItem(`user_${username}`, JSON.stringify(userData));
        this.currentUser = userData;

        return true;
    }

    recordRaceResult(playerWPM, botWPM, accuracy, promptLength) {
        if (!this.isLoggedIn()) return false;

        const won = playerWPM > botWPM;
        const username = this.currentUser.username;
        const userData = JSON.parse(localStorage.getItem(`user_${username}`));

        const raceData = {
            date: new Date().toISOString(),
            playerWPM: playerWPM,
            botWPM: botWPM,
            won: won,
            accuracy: accuracy,
            promptLength: promptLength
        };

        userData.stats.races.push(raceData);
        userData.stats.totalRaces += 1;
        userData.stats.wins += won ? 1 : 0;
        userData.stats.losses += won ? 0 : 1;

        // Update best WPM
        if (playerWPM > userData.stats.bestWPM) {
            userData.stats.bestWPM = playerWPM;
        }

        // Calculate average WPM
        const totalWPM = userData.stats.races.reduce((sum, race) => sum + race.playerWPM, 0);
        userData.stats.averageWPM = Math.round(totalWPM / userData.stats.races.length);

        localStorage.setItem(`user_${username}`, JSON.stringify(userData));
        this.currentUser = userData;

        return { success: true, won: won, stats: userData.stats };
    }

    getUserStats() {
        if (!this.isLoggedIn()) return null;
        return this.currentUser.stats;
    }

    deleteAccount() {
        if (!this.isLoggedIn()) return false;
        
        const username = this.currentUser.username;
        localStorage.removeItem(`user_${username}`);
        this.logout();
        return true;
    }
}

// Initialize the app globally
const app = new NeuroTypeApp();
