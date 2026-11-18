
// LIFE RESET - First working version

let goals = JSON.parse(localStorage.getItem("goals") || "[]");
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
let habits = JSON.parse(localStorage.getItem("habits") || "[]");
let journals = JSON.parse(localStorage.getItem("journals") || "[]");
let learningGoals = JSON.parse(
    localStorage.getItem("learningGoals") || "[]"
);

function saveData() {
    localStorage.setItem("goals", JSON.stringify(goals));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("journals", JSON.stringify(journals));
    localStorage.setItem("learningGoals", JSON.stringify(learningGoals));
}

function showPage(page, button) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    document.querySelectorAll("nav button").forEach(b => {
        b.classList.remove("active");
    });

    button.classList.add("active");
    refresh();
}

function addGoal() {
    const input = document.getElementById("goalInput");
    const deadlineInput = document.getElementById("goalDeadline");

    const name = input.value.trim();
    const deadline = deadlineInput.value;

    if (!name) {
        alert("Please enter your goal.");
        return;
    }

    goals.push({
        name: name,
        deadline: deadline,
        milestones: []
    });

    input.value = "";
    deadlineInput.value = "";

    saveData();
    refresh();
}


function addMilestone(goalIndex) {
    const input = document.getElementById("milestoneInput" + goalIndex);
    const name = input.value.trim();

    if (!name) {
        alert("Enter a milestone first.");
        return;
    }

    if (!goals[goalIndex].milestones) {
        goals[goalIndex].milestones = [];
    }

    goals[goalIndex].milestones.push({
        name: name,
        done: false
    });

    saveData();
    refresh();
}

function toggleMilestone(goalIndex, milestoneIndex) {
    goals[goalIndex].milestones[milestoneIndex].done =
        !goals[goalIndex].milestones[milestoneIndex].done;

    saveData();
    refresh();
}

function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value.trim()) return;

    tasks.push({ name: input.value.trim(), done: false });
    input.value = "";
    saveData();
    refresh();
}

function completeTask(index) {
    tasks[index].done = !tasks[index].done;
    saveData();
    refresh();
}

let budget = Number(localStorage.getItem("budget") || 0);

function addTransaction() {
    const name = document.getElementById("expenseName");
    const amount = document.getElementById("expenseAmount");
    const type = document.getElementById("transactionType");
    const category = document.getElementById("expenseCategory");
    const date = document.getElementById("expenseDate");

    const value = Number(amount.value);

    if (!name.value.trim() || !Number.isFinite(value) || value <= 0) {
        alert("Enter a valid name and amount.");
        return;
    }

    if (!date.value) {
        alert("Please select a date.");
        return;
    }

    expenses.push({
        id: Date.now() + Math.random(),
        name: name.value.trim(),
        amount: value,
        type: type.value,
        category: category.value,
        date: date.value
    });

    name.value = "";
    amount.value = "";

    saveData();
    refresh();
}

function saveBudget() {
    const value = Number(document.getElementById("budgetInput").value);

    if (!Number.isFinite(value) || value < 0) {
        alert("Enter a valid budget.");
        return;
    }

    budget = value;
    localStorage.setItem("budget", String(budget));
    refresh();
}

function deleteTransaction(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
    refresh();
}

function updateFinance() {
    const income = expenses
        .filter(e => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0);

    const spent = expenses
        .filter(e => e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0);

    const balance = income - spent;

    document.getElementById("incomeTotal").textContent =
        "₹" + income.toFixed(2);

    document.getElementById("totalExpenses").textContent =
        "₹" + spent.toFixed(2);

    document.getElementById("balanceTotal").textContent =
        "₹" + balance.toFixed(2);

    const budgetSummary = document.getElementById("budgetSummary");

    budgetSummary.textContent = budget > 0
        ? `Budget: ₹${budget.toFixed(2)} | Spent: ₹${spent.toFixed(2)} | Remaining: ₹${(budget - spent).toFixed(2)}`
        : "No monthly budget set yet.";

    document.getElementById("budgetInput").value = budget || "";

    document.getElementById("expenseList").innerHTML =
        expenses.map(e => `
            <div class="item">
                <strong>${escapeHTML(e.name)}</strong>
                <p>${escapeHTML(e.category)} | ${escapeHTML(e.date)}</p>
                <p>${e.type === "income" ? "+" : "-"}₹${e.amount.toFixed(2)}</p>
                <button onclick="deleteTransaction(${e.id})">
                    Delete
                </button>
            </div>
        `).join("") || "No transactions yet.";
}

function getTodayKey() {
const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getWeekDates() {
    const dates = [];
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dayNumber = String(date.getDate()).padStart(2, "0");

        dates.push({
            key: `${year}-${month}-${dayNumber}`,
            label: date.toLocaleDateString("en", {
                weekday: "short"
            })
        });
    }

    return dates;
}

function addHabit() {
    const input = document.getElementById("habitInput");
    const name = input.value.trim();

    if (!name) {
        alert("Please enter a habit.");
        return;
    }

    habits.push({
        name: name,
        history: {}
    });

    input.value = "";
    saveData();
    refresh();
}

function toggleHabit(index, dateKey) {
    const habit = habits[index];

    if (!habit.history) {
        habit.history = {};

        if (habit.done) {
            habit.history[getTodayKey()] = true;
        }
    }

    habit.history[dateKey] = !habit.history[dateKey];

    saveData();
    refresh();
}


function saveJournal() {

    const mood = document.getElementById("moodInput").value;

    const text = document.getElementById("journalInput").value.trim();

    journals.push({
        mood: mood,
        text: text,
        date: new Date().toLocaleString()
    });

    document.getElementById("journalInput").value = "";

    saveData();
    refresh();

    alert("Your mood and journal entry have been saved! 🌷");
}

function refresh() {
    document.getElementById("goalCount").textContent = goals.length;
    document.getElementById("taskCount").textContent =
        tasks.filter(t => t.done).length;

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

document.getElementById("goalList").innerHTML =
    goals.map((g, i) => {
        const milestones = g.milestones || [];
        const completed = milestones.filter(m => m.done).length;
        const total = milestones.length;
        const progress = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        return `
            <div class="item">
                <h3>${escapeHTML(g.name)}</h3>

                <p>Target date: ${g.deadline || "Not set"}</p>

                <p>Progress: ${progress}%</p>

                <progress value="${progress}" max="100"></progress>

                <h4>Milestones</h4>

                ${milestones.map((m, j) => `
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                ${m.done ? "checked" : ""}
                                onchange="toggleMilestone(${i}, ${j})"
                            >
                            ${escapeHTML(m.name)}
                        </label>
                    </div>
                `).join("")}

                <input
                    id="milestoneInput${i}"
                    placeholder="Add a small step..."
                >

                <button onclick="addMilestone(${i})">
                    Add Milestone
                </button>
            </div>
        `;
    }).join("") || "No goals yet. Create your first goal!";

    document.getElementById("taskList").innerHTML =
        tasks.map((t, i) => `
            <div class="item">
                <input type="checkbox" ${t.done ? "checked" : ""}
                    onchange="completeTask(${i})">
                ${escapeHTML(t.name)}
            </div>
        `).join("");

    document.getElementById("todayTasks").innerHTML =
        tasks.length
        ? tasks.map(t => `<div class="item">${t.done ? "✓" : "○"} ${escapeHTML(t.name)}</div>`).join("")
        : "No tasks yet. Add your first task!";

    // Update dashboard spending amount
const totalSpent = expenses
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

document.getElementById("spentCount").textContent =
    "₹" + totalSpent.toFixed(2);

// Update finance page
updateFinance();

    const weekDates = getWeekDates();
const todayKey = getTodayKey();

let completedToday = 0;

document.getElementById("habitList").innerHTML =
    habits.map((h, i) => {

        const history = h.history || {};

        // Preserve the old habit's completed status
        const todayDone = history[todayKey] !== undefined
            ? history[todayKey]
            : Boolean(h.done);

        if (todayDone) completedToday++;

        const completedThisWeek = weekDates.filter(date => {
            if (history[date.key] !== undefined) {
                return history[date.key];
            }

            return date.key === todayKey && Boolean(h.done);
        }).length;

        const percentage = Math.round(
            (completedThisWeek / 7) * 100
        );

        return `
            <div class="habit-card">

                <h3>${escapeHTML(h.name)}</h3>

                <p>${completedThisWeek} of 7 days completed</p>

                <progress value="${percentage}" max="100"></progress>

                <div class="habit-week">

                    ${weekDates.map(date => {

                        const isDone = history[date.key] !== undefined
                            ? history[date.key]
                            : date.key === todayKey && Boolean(h.done);

                        return `
                            <label class="habit-day">
                                ${date.label}
                                <input
                                    type="checkbox"
                                    ${isDone ? "checked" : ""}
                                    onchange="toggleHabit(${i}, '${date.key}')"
                                >
                            </label>
                        `;
                    }).join("")}

                </div>

            </div>
        `;
    }).join("") || "No habits yet. Create your first habit!";

const dailyPercentage = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

document.getElementById("habitPercentage").textContent =
    dailyPercentage + "%";

document.getElementById("habitProgressBar").style.width =
    dailyPercentage + "%";

document.getElementById("habitSummaryText").textContent =
    habits.length
        ? `${completedToday} of ${habits.length} habits completed today.`
        : "Start your first habit today!";

    
document.getElementById("journalList").innerHTML =

    journals.slice().reverse().map(j => `

        <div class="item">

            <div class="mood-entry-top">

                <strong>${escapeHTML(j.mood || "📝 Previous Entry")}</strong>

                <small>${escapeHTML(j.date || "")}</small>

            </div>

            ${j.text
                ? `<p class="mood-entry-note">${escapeHTML(j.text)}</p>`
                : `<p class="mood-entry-note">No written note for this check-in.</p>`
            }

        </div>

    `).join("") || "No entries yet. Start your first mood check-in!";

document.getElementById("moodCount").textContent = journals.length;

    document.getElementById("progressDetails").innerHTML =
        `Goals: ${goals.length}<br>
         Completed tasks: ${tasks.filter(t => t.done).length}<br>
        Habits: ${habits.filter(h =>
    h.history && h.history[todayKey] !== undefined
        ? h.history[todayKey]
        : Boolean(h.done)
).length} completed today<br>
         Total expenses: ₹${total.toFixed(2)}`;

    document.getElementById("learningList").innerHTML =

        learningGoals.map((goal, index) => `

            <div class="learning-card">

                <h3>${escapeHTML(goal.name)}</h3>

                <p>Category: ${escapeHTML(goal.category)}</p>

                <p>
                    Status: ${goal.done ? "Completed 🎉" : "In Progress"}
                </p>

                <button onclick="toggleLearningGoal(${index})">
                    ${goal.done ? "Mark Incomplete" : "Mark Completed"}
                </button>

            </div>

        `).join("") || "No learning goals yet. Add your first one!";


    const completedLearning = learningGoals.filter(
        goal => goal.done
    ).length;

    const learningPercentage = learningGoals.length
        ? Math.round(
            (completedLearning / learningGoals.length) * 100
        )
        : 0;

    document.getElementById("learningPercentage").textContent =
        learningPercentage + "%";

    document.getElementById("learningProgressBar").style.width =
        learningPercentage + "%";

    document.getElementById("learningSummary").textContent =
        `${completedLearning} of ${learningGoals.length} learning goals completed.`;

}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

refresh();


// ===================================
// PROCRASTINATION RESCUE - FOCUS TIMER
// ===================================

// Store the timer information
let focusInterval = null;
let remainingSeconds = 300;
let totalFocusSeconds = 300;

let focusSessions = Number(localStorage.getItem("focusSessions") || 0);

function updateFocusTimer() {

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    document.getElementById("focusTimer").textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    const progress = (remainingSeconds / totalFocusSeconds) * 360;

    document.getElementById("timerCircle").style.setProperty(
        "--progress",
        progress + "deg"
    );
}

function startFocusTimer(minutes) {

    clearInterval(focusInterval);

    totalFocusSeconds = minutes * 60;
    remainingSeconds = totalFocusSeconds;

    document.getElementById("focusOverlay").classList.add("active");
    document.getElementById("focusStatus").textContent = "FOCUSING";

    updateFocusTimer();
    runFocusCountdown();
}

function runFocusCountdown() {

    clearInterval(focusInterval);

    focusInterval = setInterval(function () {

        remainingSeconds--;

        updateFocusTimer();

        if (remainingSeconds <= 0) {

            clearInterval(focusInterval);
            focusInterval = null;

            document.getElementById("focusStatus").textContent = "SESSION COMPLETE";

            focusSessions++;

            localStorage.setItem("focusSessions", String(focusSessions));

            document.getElementById("sessionCount").textContent = focusSessions;

            alert("Amazing! You completed a focus session! 🌟");
        }

    }, 1000);
}

function pauseFocusTimer() {

    clearInterval(focusInterval);
    focusInterval = null;

    document.getElementById("focusStatus").textContent = "PAUSED";
}

function resumeFocusTimer() {

    if (focusInterval !== null || remainingSeconds <= 0) {
        return;
    }

    document.getElementById("focusStatus").textContent = "FOCUSING";

    runFocusCountdown();
}

function resetFocusTimer() {

    clearInterval(focusInterval);
    focusInterval = null;

    remainingSeconds = totalFocusSeconds;

    document.getElementById("focusStatus").textContent = "READY TO FOCUS";

    updateFocusTimer();
}

function closeFocusMode() {

    clearInterval(focusInterval);
    focusInterval = null;

    document.getElementById("focusOverlay").classList.remove("active");
}

document.getElementById("sessionCount").textContent = focusSessions;

updateFocusTimer();

document.getElementById("stuckReason").addEventListener(
    "change",
    function () {
        document.getElementById("rescueMessage").textContent =
            this.value + ". Take one tiny step. Start now!";
    }
);

function addLearningGoal() {

    const input = document.getElementById("learningInput");
    const category = document.getElementById("learningCategory");

    const name = input.value.trim();

    if (!name) {
        alert("Please enter a learning goal.");
        return;
    }

    learningGoals.push({
        name: name,
        category: category.value,
        done: false
    });
    input.value = "";

    saveData();
    refresh();
}


function toggleLearningGoal(index) {

    learningGoals[index].done = !learningGoals[index].done;

    saveData();
    refresh();
}

// ===================================
// DAILY ROUTINE PLANNER
// ===================================

let dailyRoutines = JSON.parse(
    localStorage.getItem("dailyRoutines") || "[]"
);

function addRoutine() {

    const input = document.getElementById("routineInput");
    const start = document.getElementById("routineStart");
    const end = document.getElementById("routineEnd");

    const name = input.value.trim();

    if (!name || !start.value || !end.value) {
        alert("Please enter activity and both times.");
        return;
    }

    if (end.value <= start.value) {
        alert("End time must be after start time.");
        return;
    }

    dailyRoutines.push({
        name: name,
        start: start.value,
        end: end.value,
        done: false
    });

    saveRoutines();
    input.value = "";
    start.value = "";
    end.value = "";

    refreshRoutines();
}

function saveRoutines() {
    localStorage.setItem(
        "dailyRoutines",
        JSON.stringify(dailyRoutines)
    );
}

function toggleRoutine(index) {

    dailyRoutines[index].done =
        !dailyRoutines[index].done;

    saveRoutines();
    refreshRoutines();
}

function deleteRoutine(index) {

    dailyRoutines.splice(index, 1);

    saveRoutines();
    refreshRoutines();
}

function refreshRoutines() {

    const list = document.getElementById("routineList");

    if (!list) return;

    list.innerHTML = dailyRoutines.map((item, index) => `
        <div class="habit-card">
            <h3>${escapeHTML(item.name)}</h3>
            <p>${item.start} - ${item.end}</p>
            <p>${item.done ? "Completed 🎉" : "Pending"}</p>

            <button onclick="toggleRoutine(${index})">
                ${item.done ? "Undo" : "Mark Completed"}
            </button>

            <button onclick="deleteRoutine(${index})">
                Delete
            </button>
        </div>
    `).join("") || "No activities planned yet.";

    const completed = dailyRoutines.filter(
        item => item.done
    ).length;

    const percentage = dailyRoutines.length
        ? Math.round(
            completed / dailyRoutines.length * 100
        )
        : 0;

    document.getElementById("routinePercentage").textContent =
        percentage + "%";

    document.getElementById("routineProgressBar").style.width =
        percentage + "%";

    document.getElementById("routineSummary").textContent =
        `${completed} of ${dailyRoutines.length} activities completed.`;
}

refreshRoutines();

// ===================================
// DAILY STREAK, MOTIVATION & BADGES
// ===================================

let dailyStreak = Number(
    localStorage.getItem("dailyStreak") || 0
);

let lastCheckIn = localStorage.getItem("lastCheckIn") || "";

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function dailyCheckIn() {

    const today = getTodayDate();

    if (lastCheckIn === today) {
        alert("You've already checked in today! 🌸");
        return;
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterday =
        yesterdayDate.getFullYear() + "-" +
        String(yesterdayDate.getMonth() + 1).padStart(2, "0") + "-" +
        String(yesterdayDate.getDate()).padStart(2, "0");

    if (lastCheckIn === yesterday) {
        dailyStreak++;
    } else {
        dailyStreak = 1;
    }

    lastCheckIn = today;

    localStorage.setItem("dailyStreak", dailyStreak);
    localStorage.setItem("lastCheckIn", lastCheckIn);

    refreshRewards();

    alert("Check-in complete! Keep growing! 🌷");
}

function refreshRewards() {

    document.getElementById("streakCount").textContent =
        dailyStreak + (dailyStreak === 1 ? " Day" : " Days");

    const checkedInToday = lastCheckIn === getTodayDate();

    document.getElementById("checkInButton").textContent =
        checkedInToday ? "Checked In Today ✓" : "Check In Today 🌷";

    document.getElementById("checkInButton").disabled =
        checkedInToday;

    document.getElementById("streakMessage").textContent =
        dailyStreak === 0
            ? "Start your journey today!"
            : "Amazing! Keep showing up for yourself! 💗";

    const quotes = [
        "You are capable of amazing things! 🌸",
        "Small steps every day create big changes.",
        "Your only competition is who you were yesterday.",
        "Don't stop until you are proud.",
        "Progress, not perfection!",
        "You deserve the life you're working for.",
        "Believe in yourself and keep going!"
    ];

    const dayNumber = Math.floor(
        new Date().getTime() / 86400000
    );

    document.getElementById("dailyQuote").textContent =
        quotes[dayNumber % quotes.length];

    const badges = [
        {
            name: "First Step 🌱",
            description: "Complete your first daily check-in",
            days: 1
        },
        {
            name: "Three Day Glow ✨",
            description: "Maintain a 3-day streak",
            days: 3
        },
        {
            name: "One Week Warrior 🌷",
            description: "Maintain a 7-day streak",
            days: 7
        },
        {
            name: "Consistency Queen 👑",
            description: "Maintain a 30-day streak",
            days: 30
        }
    ];

    document.getElementById("achievementList").innerHTML =
        badges.map(badge => `
            <div class="habit-card">
                <h3>${dailyStreak >= badge.days ? "🏆" : "🔒"}
                    ${badge.name}
                </h3>
                <p>${badge.description}</p>
                <p>${dailyStreak >= badge.days ? "Unlocked!" : "Not unlocked yet"}</p>
            </div>
        `).join("");
}

refreshRewards();
