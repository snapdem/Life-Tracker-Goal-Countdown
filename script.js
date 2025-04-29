document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const nameInput = document.getElementById('name');
    const dobInput = document.getElementById('dob');
    const saveInfoBtn = document.getElementById('save-info');
    const userInfoContainer = document.getElementById('user-info-container');
    const lifeStatsContainer = document.getElementById('life-stats-container');
    const goalInputContainer = document.getElementById('goal-input-container');
    const goalsListContainer = document.getElementById('goals-list-container');
    const goalsList = document.getElementById('goals-list');
    const goalTitleInput = document.getElementById('goal-title');
    const goalAgeInput = document.getElementById('goal-age');
    const addGoalBtn = document.getElementById('add-goal');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentYearSpan = document.getElementById('current-year');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const liveTimeElement = document.getElementById('live-time');
    const liveDateElement = document.getElementById('live-date');
    
    // Analog Clock Elements
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');
    
    // Goals Summary Elements
    const activeGoalsCount = document.getElementById('active-goals-count');
    const atRiskGoalsCount = document.getElementById('at-risk-goals-count');
    const completedGoalsCount = document.getElementById('completed-goals-count');
    
    // Daily Tasks Elements
    const dailyTasksContainer = document.getElementById('daily-tasks-container');
    const taskGoalSelect = document.getElementById('task-goal-select');
    const taskTitleInput = document.getElementById('task-title');
    const addTaskBtn = document.getElementById('add-task');
    const tasksList = document.getElementById('tasks-list');
    
    // Study Timer Elements
    const studyTimerContainer = document.getElementById('study-timer-container');
    const timerMinutesElement = document.getElementById('timer-minutes');
    const timerSecondsElement = document.getElementById('timer-seconds');
    const timerStatusElement = document.getElementById('timer-status');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const timerGoalSelect = document.getElementById('timer-goal-select');
    const timerDurationInput = document.getElementById('timer-duration');
    const totalFocusTimeElement = document.getElementById('total-focus-time');
    const sessionsCompletedElement = document.getElementById('sessions-completed');
    const goalFocusBreakdown = document.getElementById('goal-focus-breakdown');
    
    // Display elements
    const userNameSpan = document.getElementById('user-name');
    const ageYearsSpan = document.getElementById('age-years');
    const ageMonthsSpan = document.getElementById('age-months');
    const ageDaysSpan = document.getElementById('age-days');
    const totalDaysSpan = document.getElementById('total-days');
    
    // Timer variables
    let timerInterval = null;
    let timerMinutes = 25;
    let timerSeconds = 0;
    let timerRunning = false;
    let timerPaused = false;
    
    // User data object
    let userData = {
        name: '',
        dob: null,
        goals: [],
        darkMode: false,
        tasks: [],
        focusTime: {
            todayTotal: 0,
            sessionsCompleted: 0,
            goalBreakdown: {},
            lastUpdate: new Date().toDateString()
        }
    };
    
    // Initialize: Check if user data exists in localStorage
    function init() {
        // Set current year in footer
        currentYearSpan.textContent = new Date().getFullYear();
        
        // Start the live clock
        updateISTClock();
        setInterval(updateISTClock, 1000);
        
        // Initialize analog clock
        updateAnalogClock();
        setInterval(updateAnalogClock, 1000);
        
        // Load stored data
        const storedData = localStorage.getItem('lifeTrackerData');
        if (storedData) {
            userData = JSON.parse(storedData);
            
            // Upgrade userData structure if needed
            if (!userData.tasks) userData.tasks = [];
            if (!userData.focusTime) {
                userData.focusTime = {
                    todayTotal: 0,
                    sessionsCompleted: 0,
                    goalBreakdown: {},
                    lastUpdate: new Date().toDateString()
                };
            }
            
            // Check if it's a new day, reset focus time if needed
            checkAndResetDailyStats();
            
            // Apply dark mode if saved
            if (userData.darkMode) {
                document.body.classList.add('dark-mode');
                darkModeToggle.checked = true;
            }
            
            // If we have user data, show the stats and goals sections
            if (userData.name && userData.dob) {
                showUserDashboard();
                updateLifeStats();
                renderGoals();
                populateGoalSelects();
                renderTasks();
                updateFocusTimeStats();
            }
        }
        
        // Load daily quote
        loadDailyQuote();
        
        // Add event listeners for tasks and timer
        setupTasksEventListeners();
        setupTimerEventListeners();
    }
    
    // Check if it's a new day and reset daily stats if needed
    function checkAndResetDailyStats() {
        const today = new Date().toDateString();
        if (userData.focusTime.lastUpdate !== today) {
            userData.focusTime.todayTotal = 0;
            userData.focusTime.sessionsCompleted = 0;
            userData.focusTime.goalBreakdown = {};
            userData.focusTime.lastUpdate = today;
            
            // Move completed tasks to history or just filter them out
            userData.tasks = userData.tasks.filter(task => !task.completed);
            
            saveUserData();
        }
    }
    
    // Update analog clock
    function updateAnalogClock() {
        // Get current time in IST
        const now = new Date();
        const options = { timeZone: 'Asia/Kolkata' };
        const istTime = new Date(now.toLocaleString('en-US', options));
        
        const seconds = istTime.getSeconds();
        const minutes = istTime.getMinutes();
        const hours = istTime.getHours() % 12; // Convert to 12-hour format
        
        // Calculate rotation angles
        const secondDegrees = (seconds / 60) * 360;
        const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
        const hourDegrees = ((hours + minutes / 60) / 12) * 360;
        
        // Apply rotations with smooth transitions
        secondHand.style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
        hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
        
        // Add smooth animation for second hand
        if (seconds === 0) {
            // Remove transition temporarily when going from 59s to 0s to avoid counter-clockwise animation
            secondHand.style.transition = 'none';
            setTimeout(() => {
                secondHand.style.transition = 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
            }, 50);
        } else {
            secondHand.style.transition = 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
        }
    }
    
    // Update live clock with IST time
    function updateISTClock() {
        // Create a date object for Indian Standard Time (UTC+5:30)
        const options = {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        const istTimeString = new Date().toLocaleTimeString('en-US', options);
        liveTimeElement.textContent = istTimeString;
        
        // Format date for IST
        const dateOptions = {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        const istDateString = new Date().toLocaleDateString('en-US', dateOptions);
        liveDateElement.textContent = `${istDateString} (IST)`;
        
        // Add a pulse animation effect to the time
        liveTimeElement.classList.add('pulse');
        setTimeout(() => {
            liveTimeElement.classList.remove('pulse');
        }, 500);
    }
    
    // Save user info when the save button is clicked
    saveInfoBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const dob = dobInput.value;
        
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        if (!dob) {
            alert('Please enter your date of birth');
            return;
        }
        
        // Save to user data
        userData.name = name;
        userData.dob = dob;
        
        // Save to localStorage
        saveUserData();
        
        // Show the dashboard
        showUserDashboard();
        
        // Update stats
        updateLifeStats();
    });
    
    // Add a new goal
    addGoalBtn.addEventListener('click', () => {
        const title = goalTitleInput.value.trim();
        const targetAge = parseInt(goalAgeInput.value);
        
        if (!title) {
            alert('Please enter a goal title');
            return;
        }
        
        if (isNaN(targetAge) || targetAge < 1) {
            alert('Please enter a valid target age');
            return;
        }
        
        // Create goal object
        const goal = {
            id: Date.now(), // Simple unique ID based on timestamp
            title,
            targetAge,
            createdAt: new Date().toISOString()
        };
        
        // Add to user data
        userData.goals.push(goal);
        
        // Save to localStorage
        saveUserData();
        
        // Render goals
        renderGoals();
        
        // Clear inputs
        goalTitleInput.value = '';
        goalAgeInput.value = '';
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            userData.darkMode = true;
        } else {
            document.body.classList.remove('dark-mode');
            userData.darkMode = false;
        }
        
        // Save preference to localStorage
        saveUserData();
    });
    
    // Calculate and update life stats
    function updateLifeStats() {
        if (!userData.dob) return;
        
        // Get current date and birth date
        const now = new Date();
        const birthDate = new Date(userData.dob);
        
        // Calculate total days lived
        const totalDaysLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
        
        // Calculate age (years, months, days)
        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();
        
        // Adjust for negative months or days
        if (days < 0) {
            months--;
            // Get the last day of the previous month
            const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += lastDayOfLastMonth;
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        // Update the DOM elements
        userNameSpan.textContent = userData.name;
        ageYearsSpan.textContent = years;
        ageMonthsSpan.textContent = months;
        ageDaysSpan.textContent = days;
        
        // Get current value (default to 0 if not set)
        const currentValue = parseInt(totalDaysSpan.textContent) || 0;
        
        // Only animate if the value is different or it's the first time
        if (currentValue !== totalDaysLived) {
            animateCount(totalDaysSpan, currentValue, totalDaysLived);
        }
    }
    
    // Render goals list
    function renderGoals() {
        if (!userData.goals || userData.goals.length === 0) {
            goalsList.innerHTML = '<p>No goals added yet. Add a goal above to get started!</p>';
            return;
        }
        
        goalsListContainer.classList.remove('hidden');
        goalsList.innerHTML = '';
        
        // Variables to track goal counts
        let activeCount = 0;
        let atRiskCount = 0;
        let completedCount = 0;
        
        userData.goals.forEach(goal => {
            const goalCard = createGoalCard(goal);
            goalsList.appendChild(goalCard);
            
            // Calculate if goal is still active
            const birthDate = new Date(userData.dob);
            const targetDate = new Date(birthDate);
            targetDate.setFullYear(birthDate.getFullYear() + goal.targetAge);
            
            // Determine status
            const today = new Date();
            const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining < 0) {
                completedCount++;
            } else if (daysRemaining <= 30) { // At risk if less than 30 days
                atRiskCount++;
            } else {
                activeCount++;
            }
        });
        
        // Update summary counts
        activeGoalsCount.textContent = activeCount;
        atRiskGoalsCount.textContent = atRiskCount;
        completedGoalsCount.textContent = completedCount;
        
        // Show daily tasks and timer containers
        dailyTasksContainer.classList.remove('hidden');
        studyTimerContainer.classList.remove('hidden');
    }
    
    // Create a goal card element
    function createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = 'goal-card';
        
        // Calculate target date based on birthdate and target age
        const birthDate = new Date(userData.dob);
        const targetDate = new Date(birthDate);
        targetDate.setFullYear(birthDate.getFullYear() + goal.targetAge);
        
        // Calculate days remaining
        const today = new Date();
        const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine status
        let status = '';
        let statusClass = '';
        let isAtRisk = false;
        
        if (daysRemaining < 0) {
            status = 'Missed';
            statusClass = 'status-missed';
        } else if (daysRemaining <= 30) { // At risk if less than 30 days
            status = 'At Risk';
            statusClass = 'status-ontrack';
            isAtRisk = true;
            card.classList.add('at-risk');
        } else {
            status = 'On Track';
            statusClass = 'status-ontrack';
        }
        
        // Calculate progress percentage
        const totalDaysForGoal = Math.ceil((targetDate - birthDate) / (1000 * 60 * 60 * 24));
        const daysElapsed = totalDaysForGoal - daysRemaining;
        const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDaysForGoal) * 100));
        
        // Count tasks for this goal
        const totalTasks = userData.tasks.filter(task => task.goalId === goal.id).length;
        const completedTasks = userData.tasks.filter(task => task.goalId === goal.id && task.completed).length;
        
        // Create card HTML
        let cardHtml = `
            <div class="goal-countdown">${Math.abs(daysRemaining)} days ${daysRemaining < 0 ? 'ago' : 'left'}</div>
            <h3>${goal.title}</h3>
            <p>Target Age: ${goal.targetAge} years</p>
            <p>Target Date: ${formatDate(targetDate)}</p>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            
            <span class="goal-status ${statusClass}">${status}</span>
        `;
        
        // Add warning message if goal is at risk
        if (isAtRisk && daysRemaining > 0) {
            cardHtml += `
                <div class="goal-action-needed">
                    <p>You have ${daysRemaining} days to conquer this goal!</p>
                </div>
            `;
        }
        
        // Add tasks progress if there are tasks
        if (totalTasks > 0) {
            cardHtml += `
                <span class="goal-tasks-count">
                    ${completedTasks} of ${totalTasks} tasks completed
                </span>
            `;
        }
        
        // Add delete button
        cardHtml += `<button class="delete-goal" data-id="${goal.id}">Delete</button>`;
        
        card.innerHTML = cardHtml;
        
        // Add event listener for delete button
        card.querySelector('.delete-goal').addEventListener('click', (e) => {
            const goalId = parseInt(e.target.getAttribute('data-id'));
            deleteGoal(goalId);
        });
        
        return card;
    }
    
    // Delete a goal
    function deleteGoal(goalId) {
        userData.goals = userData.goals.filter(goal => goal.id !== goalId);
        saveUserData();
        renderGoals();
    }
    
    // Show user dashboard and hide input form
    function showUserDashboard() {
        userInfoContainer.classList.add('hidden');
        lifeStatsContainer.classList.remove('hidden');
        goalInputContainer.classList.remove('hidden');
        goalsListContainer.classList.remove('hidden');
        dailyTasksContainer.classList.remove('hidden');
        studyTimerContainer.classList.remove('hidden');
    }
    
    // Save user data to localStorage
    function saveUserData() {
        localStorage.setItem('lifeTrackerData', JSON.stringify(userData));
    }
    
    // Format date as MM/DD/YYYY
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Animate count for number display
    function animateCount(element, start, end) {
        if (start === end) return; // Skip animation if the values are the same
        
        const duration = 1500; // Animation duration in ms
        const frameRate = 30; // Frames per second
        const totalFrames = duration / (1000 / frameRate);
        const increment = (end - start) / totalFrames;
        
        let currentFrame = 0;
        let currentValue = start;
        
        // Clear any existing animation
        if (element.countAnimationId) {
            cancelAnimationFrame(element.countAnimationId);
        }
        
        const animate = () => {
            currentFrame++;
            currentValue += increment;
            
            if (currentFrame === totalFrames) {
                element.textContent = end;
                element.countAnimationId = null;
            } else {
                element.textContent = Math.floor(currentValue);
                element.countAnimationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // Load daily inspirational quote
    function loadDailyQuote() {
        // Array of quotes focused on time, goals and deadlines
        const quotes = [
            { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
            { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
            { text: "A goal without a deadline is just a dream.", author: "Duke Ellington" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Time waits for no one. Treasure every moment you have.", author: "Judy Blume" },
            { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
            { text: "Better three hours too soon than a minute too late.", author: "William Shakespeare" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "Lost time is never found again.", author: "Benjamin Franklin" },
            { text: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
            { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
            { text: "Goals are dreams with deadlines.", author: "Diana Scharf" },
            { text: "Yesterday is gone. Tomorrow has not yet come. We have only today.", author: "Mother Teresa" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { text: "Time flies over us, but leaves its shadow behind.", author: "Nathaniel Hawthorne" }
        ];
        
        // Get a random quote instead of using day of year
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        
        // Update the quote in the DOM
        quoteText.textContent = randomQuote.text;
        quoteAuthor.textContent = `- ${randomQuote.author}`;
    }
    
    // Set up interval to update stats regularly
    function setupAutoUpdate() {
        // Update stats every minute
        setInterval(() => {
            updateLifeStats();
            renderGoals(); // Also re-render goals to update days remaining
        }, 60000);
    }
    
    // Add event listeners for tasks
    function setupTasksEventListeners() {
        addTaskBtn.addEventListener('click', addNewTask);

        // Event delegation for task actions
        tasksList.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if a task checkbox was clicked
            if (target.classList.contains('task-check') || target.parentElement.classList.contains('task-check')) {
                const taskItem = target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                toggleTaskCompletion(taskId);
            }
            
            // Check if a task delete button was clicked
            if (target.classList.contains('task-delete') || target.parentElement.classList.contains('task-delete')) {
                const taskItem = target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                deleteTask(taskId);
            }
        });
    }

    // Populate goal select dropdowns
    function populateGoalSelects() {
        // Clear existing options
        taskGoalSelect.innerHTML = '<option value="">Select a goal</option>';
        timerGoalSelect.innerHTML = '<option value="">Select a goal</option>';
        
        // Add active goals as options
        userData.goals.forEach(goal => {
            // Calculate if goal is still active
            const birthDate = new Date(userData.dob);
            const targetDate = new Date(birthDate);
            targetDate.setFullYear(birthDate.getFullYear() + goal.targetAge);
            
            // Only add active goals
            if (new Date() < targetDate) {
                const taskOption = document.createElement('option');
                taskOption.value = goal.id;
                taskOption.textContent = goal.title;
                taskGoalSelect.appendChild(taskOption);
                
                const timerOption = document.createElement('option');
                timerOption.value = goal.id;
                timerOption.textContent = goal.title;
                timerGoalSelect.appendChild(timerOption);
            }
        });
    }

    // Add a new task
    function addNewTask() {
        const goalId = taskGoalSelect.value;
        const title = taskTitleInput.value.trim();
        
        if (!title) {
            alert('Please enter a task');
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(), // Simple unique ID based on timestamp
            title,
            goalId: goalId ? parseInt(goalId) : null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to user data
        userData.tasks.push(task);
        
        // Save to localStorage
        saveUserData();
        
        // Render tasks
        renderTasks();
        
        // Update goals to reflect new task count
        renderGoals();
        
        // Clear inputs
        taskTitleInput.value = '';
        taskGoalSelect.value = '';
    }

    // Render tasks list
    function renderTasks() {
        // Show tasks container
        dailyTasksContainer.classList.remove('hidden');
        
        if (!userData.tasks || userData.tasks.length === 0) {
            tasksList.innerHTML = '<div class="no-tasks-message">No tasks added for today yet.</div>';
            return;
        }
        
        tasksList.innerHTML = '';
        
        userData.tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }

    // Create a task element
    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        let goalTitle = '';
        if (task.goalId) {
            const goal = userData.goals.find(g => g.id === task.goalId);
            if (goal) goalTitle = goal.title;
        }
        
        taskItem.innerHTML = `
            <div class="task-content">
                <div class="task-title">
                    ${task.title}
                </div>
                ${goalTitle ? `<div class="task-goal">Goal: ${goalTitle}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-check" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="task-delete" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return taskItem;
    }

    // Toggle task completion status
    function toggleTaskCompletion(taskId) {
        const taskIndex = userData.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            userData.tasks[taskIndex].completed = !userData.tasks[taskIndex].completed;
            saveUserData();
            renderTasks();
            renderGoals(); // Update goal cards with task counts
        }
    }

    // Delete a task
    function deleteTask(taskId) {
        userData.tasks = userData.tasks.filter(task => task.id !== taskId);
        saveUserData();
        renderTasks();
        renderGoals(); // Update goal cards with task counts
    }
    
    // Set up timer event listeners
    function setupTimerEventListeners() {
        timerStartBtn.addEventListener('click', startTimer);
        timerPauseBtn.addEventListener('click', pauseTimer);
        timerResetBtn.addEventListener('click', resetTimer);
        timerDurationInput.addEventListener('change', updateTimerDuration);
    }

    // Update timer duration from input
    function updateTimerDuration() {
        const duration = parseInt(timerDurationInput.value);
        if (isNaN(duration) || duration < 1) {
            timerDurationInput.value = 25;
            timerMinutes = 25;
        } else {
            timerMinutes = duration;
        }
        timerSeconds = 0;
        updateTimerDisplay();
    }

    // Start the timer
    function startTimer() {
        if (timerRunning && !timerPaused) return;
        
        const timerDisplay = document.querySelector('.timer-circle').parentElement;
        timerDisplay.classList.add('timer-running');
        timerDisplay.classList.remove('timer-paused');
        
        timerRunning = true;
        timerPaused = false;
        timerStartBtn.disabled = true;
        timerPauseBtn.disabled = false;
        timerResetBtn.disabled = false;
        timerStatusElement.textContent = 'Focus';
        
        // Disable inputs while timer is running
        timerDurationInput.disabled = true;
        timerGoalSelect.disabled = true;
        
        timerInterval = setInterval(() => {
            if (timerSeconds === 0) {
                if (timerMinutes === 0) {
                    // Timer complete
                    clearInterval(timerInterval);
                    timerComplete();
                    return;
                }
                timerMinutes--;
                timerSeconds = 59;
            } else {
                timerSeconds--;
            }
            updateTimerDisplay();
        }, 1000);
    }

    // Pause the timer
    function pauseTimer() {
        if (!timerRunning || timerPaused) return;
        
        clearInterval(timerInterval);
        timerPaused = true;
        timerStartBtn.disabled = false;
        timerStatusElement.textContent = 'Paused';
        
        const timerDisplay = document.querySelector('.timer-circle').parentElement;
        timerDisplay.classList.remove('timer-running');
        timerDisplay.classList.add('timer-paused');
    }

    // Reset the timer
    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = false;
        
        // Restore original timer duration
        timerMinutes = parseInt(timerDurationInput.value) || 25;
        timerSeconds = 0;
        
        // Update UI
        updateTimerDisplay();
        timerStartBtn.disabled = false;
        timerPauseBtn.disabled = true;
        timerResetBtn.disabled = true;
        timerStatusElement.textContent = 'Ready';
        
        // Enable inputs
        timerDurationInput.disabled = false;
        timerGoalSelect.disabled = false;
        
        const timerDisplay = document.querySelector('.timer-circle').parentElement;
        timerDisplay.classList.remove('timer-running', 'timer-paused');
    }

    // Update timer display
    function updateTimerDisplay() {
        timerMinutesElement.textContent = timerMinutes.toString().padStart(2, '0');
        timerSecondsElement.textContent = timerSeconds.toString().padStart(2, '0');
    }

    // Timer complete action
    function timerComplete() {
        // Play sound notification
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');
        audio.play().catch(e => console.log('Audio play error:', e)); // Catch to handle autoplay restrictions
        
        // Update focus time stats
        const sessionDuration = parseInt(timerDurationInput.value) || 25;
        userData.focusTime.todayTotal += sessionDuration;
        userData.focusTime.sessionsCompleted++;
        
        // Add to goal breakdown if a goal was selected
        const goalId = timerGoalSelect.value;
        if (goalId) {
            const goalIdInt = parseInt(goalId);
            if (!userData.focusTime.goalBreakdown[goalIdInt]) {
                userData.focusTime.goalBreakdown[goalIdInt] = 0;
            }
            userData.focusTime.goalBreakdown[goalIdInt] += sessionDuration;
        }
        
        // Save to localStorage
        saveUserData();
        
        // Update stats display
        updateFocusTimeStats();
        
        // Reset timer
        resetTimer();
        
        // Show notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Focus Timer Complete", {
                body: "Great job! You've completed a focus session.",
                icon: "https://cdn-icons-png.flaticon.com/512/3095/3095758.png"
            });
        } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }

    // Update focus time stats display
    function updateFocusTimeStats() {
        // Show timer container
        studyTimerContainer.classList.remove('hidden');
        
        // Update total focus time display
        const hours = Math.floor(userData.focusTime.todayTotal / 60);
        const minutes = userData.focusTime.todayTotal % 60;
        
        let timeDisplay = '';
        if (hours > 0) {
            timeDisplay = `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        } else {
            timeDisplay = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }
        
        totalFocusTimeElement.textContent = timeDisplay;
        
        // Update sessions completed
        sessionsCompletedElement.textContent = userData.focusTime.sessionsCompleted;
        
        // Update goal breakdown
        goalFocusBreakdown.innerHTML = '';
        
        const goalIds = Object.keys(userData.focusTime.goalBreakdown);
        if (goalIds.length === 0) {
            goalFocusBreakdown.innerHTML = '<p>No goal-specific focus time recorded today.</p>';
            return;
        }
        
        goalIds.forEach(goalId => {
            const goal = userData.goals.find(g => g.id === parseInt(goalId));
            if (!goal) return;
            
            const focusTime = userData.focusTime.goalBreakdown[goalId];
            const hours = Math.floor(focusTime / 60);
            const minutes = focusTime % 60;
            
            let timeDisplay = '';
            if (hours > 0) {
                timeDisplay = `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
            } else {
                timeDisplay = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
            }
            
            const goalItem = document.createElement('div');
            goalItem.className = 'goal-focus-item';
            goalItem.innerHTML = `
                <div class="goal-focus-title">${goal.title}</div>
                <span class="goal-focus-time">${timeDisplay}</span>
            `;
            
            goalFocusBreakdown.appendChild(goalItem);
        });
    }
    
    // Initialize app
    init();
    setupAutoUpdate();
}); 