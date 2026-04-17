// Day Planner App - Main Logic

class DayPlanner {
    constructor() {
        this.allTasks = [];
        this.todayTasks = [];
        this.currentDate = new Date().toDateString();
        this.init();
    }

    init() {
        this.checkAndResetDaily();
        this.loadData();
        this.setupEventListeners();
        this.updateCurrentDate();
        this.render();
        this.updateProgress();
        this.setupAutoClear();
    }

    // Setup automatic daily clearing
    setupAutoClear() {
        // Check every 5 minutes if it's a new day
        setInterval(() => {
            this.checkAndResetDaily();
        }, 5 * 60 * 1000); // 5 minutes

        // Also set up a timeout for exactly when the day changes
        this.scheduleMidnightReset();
    }

    // Schedule a reset at exactly midnight
    scheduleMidnightReset() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight

        const timeUntilMidnight = midnight.getTime() - now.getTime();

        // Set timeout for exactly when the day changes
        setTimeout(() => {
            this.performDailyReset();
            // Schedule the next midnight reset
            this.scheduleMidnightReset();
        }, timeUntilMidnight);
    }

    // Perform the daily reset (separate from checkAndResetDaily for clarity)
    performDailyReset() {
        const todayTasks = [...this.todayTasks];
        const unfinishedTasks = todayTasks.filter(task => !task.completed);

        // Move unfinished tasks back to main list
        unfinishedTasks.forEach(task => {
            task.completed = false; // Reset completion status
            this.allTasks.push(task);
        });

        // Clear today's tasks
        this.todayTasks = [];

        // Update storage
        this.saveData();

        // Update UI
        this.render();
        this.updateProgress();

        // Show notification if app is visible
        if (document.visibilityState === 'visible') {
            this.showResetNotification(unfinishedTasks.length);
        }

        console.log(`Daily reset completed: ${unfinishedTasks.length} unfinished tasks moved back to checklist`);
    }

    // Load data from localStorage
    loadData() {
        this.allTasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
        this.todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
    }

    // Check if we need to reset daily tasks (new day detected)
    checkAndResetDaily() {
        const lastDate = localStorage.getItem('lastDate');
        const currentDate = new Date().toDateString();

        if (lastDate !== currentDate) {
            // New day detected - perform reset
            this.performDailyReset();
            localStorage.setItem('lastDate', currentDate);
        }
    }

    // Show notification when daily reset occurs
    showResetNotification(unfinishedCount) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'reset-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🌅</span>
                <span class="notification-text">
                    New day started! ${unfinishedCount} unfinished task${unfinishedCount !== 1 ? 's' : ''} moved back to your checklist.
                </span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('allTasks', JSON.stringify(this.allTasks));
        localStorage.setItem('todayTasks', JSON.stringify(this.todayTasks));
    }

    // Setup all event listeners
    setupEventListeners() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const clearTodayBtn = document.getElementById('clearTodayBtn');
        const todayContainer = document.getElementById('todayTasks');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        clearTodayBtn.addEventListener('click', () => this.clearToday());

        // Drag and drop setup (drop zone listeners only)
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    // Add a new task
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.allTasks.push(task);
        this.saveData();
        this.render();

        input.value = '';
        input.focus();
    }

    // Delete a task (or move back to checklist)
    deleteTask(taskId, source) {
        if (source === 'all') {
            // Delete completely from main checklist
            this.allTasks = this.allTasks.filter(t => t.id !== taskId);
        } else if (source === 'today') {
            // Move back to main checklist (not delete)
            const task = this.todayTasks.find(t => t.id === taskId);
            if (task) {
                // Reset completion status when moving back
                task.completed = false;
                this.allTasks.push(task);
                this.todayTasks = this.todayTasks.filter(t => t.id !== taskId);
            }
        }

        this.saveData();
        this.render();
    }

    // Toggle task completion
    toggleTask(taskId, source) {
        let tasks = source === 'all' ? this.allTasks : this.todayTasks;
        let task = tasks.find(t => t.id === taskId);

        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.render();
        }
    }

    // Edit a task
    editTask(taskId, source) {
        let tasks = source === 'all' ? this.allTasks : this.todayTasks;
        let task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveData();
            this.render();
        }
    }

    // Clear all today's tasks
    clearToday() {
        if (this.todayTasks.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Move all unfinished tasks back to the to-do list?')) {
            this.todayTasks.forEach(task => {
                if (!task.completed) {
                    this.allTasks.push(task);
                }
            });

            this.todayTasks = [];
            this.saveData();
            this.render();
        }
    }

    // Drag and drop handlers
    handleDragStart(e) {
        // Don't start drag if clicking on or inside interactive elements (buttons, checkboxes)
        const interactiveElement = e.target.closest('button, input');
        if (interactiveElement) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        taskItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskItem.dataset.taskId);
        e.dataTransfer.setData('source', taskItem.dataset.source);
    }

    handleDragEnd(e) {
        // Don't handle drag end if it was prevented
        const interactiveElement = e.target.closest('button, input');
        if (interactiveElement) return;

        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('dragging');
        }
        document.getElementById('todayTasks').classList.remove('drag-over');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const todayContainer = document.getElementById('todayTasks');
        if (e.target === todayContainer || todayContainer.contains(e.target)) {
            todayContainer.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const todayContainer = document.getElementById('todayTasks');
        if (e.target === todayContainer) {
            todayContainer.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const todayContainer = document.getElementById('todayTasks');
        todayContainer.classList.remove('drag-over');

        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        const source = e.dataTransfer.getData('source');

        if (!e.target.closest('#todayTasks')) return;

        this.moveTask(taskId, source);
    }

    // Move task between lists
    moveTask(taskId, sourceList) {
        let task = null;

        if (sourceList === 'all') {
            task = this.allTasks.find(t => t.id === taskId);
            if (task) {
                this.allTasks = this.allTasks.filter(t => t.id !== taskId);
                task.completed = false; // Reset completion when moving
                this.todayTasks.push(task);
            }
        } else if (sourceList === 'today') {
            task = this.todayTasks.find(t => t.id === taskId);
            if (task) {
                this.todayTasks = this.todayTasks.filter(t => t.id !== taskId);
                task.completed = false; // Reset completion when moving
                this.allTasks.push(task);
            }
        }

        this.saveData();
        this.render();
    }

    // Update the current date display
    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-US', options);
        dateElement.textContent = formattedDate;
    }

    // Update progress bar for today's tasks
    updateProgress() {
        const totalTasks = this.todayTasks.length;
        const completedTasks = this.todayTasks.filter(task => task.completed).length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill && progressText) {
            // Check if progress increased to trigger slide animation
            const currentWidth = parseFloat(progressFill.style.width) || 0;
            const newWidth = percentage;

            if (newWidth > currentWidth) {
                // Progress increased - trigger slide animation
                progressFill.classList.remove('slide');
                setTimeout(() => {
                    progressFill.classList.add('slide');
                }, 10);
            }

            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${completedTasks} / ${totalTasks} tasks`;

            // Add visual feedback for completion
            if (percentage === 100 && totalTasks > 0) {
                progressText.style.color = '#4CAF50';
                progressText.style.fontWeight = '600';
            } else {
                progressText.style.color = '#666';
                progressText.style.fontWeight = '500';
            }
        }
    }

    // Create task item HTML
    createTaskItemHTML(task, source) {
        const completed = task.completed ? 'completed' : '';
        return `
            <li class="task-item ${completed}" draggable="true" data-task-id="${task.id}" data-source="${source}" ondragstart="planner.handleDragStart(event)" ondragend="planner.handleDragEnd(event)">
                <input
                    type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="event.stopPropagation(); planner.toggleTask(${task.id}, '${source}')"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-edit" onclick="event.stopPropagation(); planner.editTask(${task.id}, '${source}')" title="Edit task">Edit</button>
                <button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, '${source}')">Delete</button>
            </li>
        `;
    }

    // Create today's task HTML (inner content)
    createTodayTaskItemHTML(task) {
        const completed = task.completed ? 'completed' : '';
        const moveBackButton = task.completed ? '' : `<button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, 'today')" title="Move back to checklist">←</button>`;

        return `
            <input
                type="checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="event.stopPropagation(); planner.toggleTask(${task.id}, 'today')"
            >
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button class="task-edit" onclick="event.stopPropagation(); planner.editTask(${task.id}, 'today')" title="Edit task">Edit</button>
            ${moveBackButton}
        `;
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render the UI
    render() {
        this.renderTaskList();
        this.renderTodayTasks();
        this.updateProgress();
    }

    // Render all tasks list
    renderTaskList() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        if (this.allTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
            return;
        }

        this.allTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = this.createTaskItemHTML(task, 'all');
            taskList.appendChild(li);
        });
    }

    // Render today's tasks
    renderTodayTasks() {
        const todayContainer = document.getElementById('todayTasks');
        
        // Clear previous content
        while (todayContainer.firstChild) {
            todayContainer.removeChild(todayContainer.firstChild);
        }

        if (this.todayTasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.style.listStyle = 'none';
            emptyState.textContent = 'Drag tasks here to plan your day';
            todayContainer.appendChild(emptyState);
        } else {
            this.todayTasks.forEach(task => {
                const li = document.createElement('li');
                const completed = task.completed ? 'completed' : '';
                li.className = 'today-task-item ' + completed;
                li.draggable = true;
                li.dataset.taskId = task.id;
                li.dataset.source = 'today';
                li.setAttribute('ondragstart', 'planner.handleDragStart(event)');
                li.setAttribute('ondragend', 'planner.handleDragEnd(event)');
                li.innerHTML = this.createTodayTaskItemHTML(task);
                
                todayContainer.appendChild(li);
            });
        }
    }
}

// Initialize the planner when DOM is ready
let planner;

document.addEventListener('DOMContentLoaded', () => {
    planner = new DayPlanner();
});
