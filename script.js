// Day Planner App - Main Logic

class DayPlanner {
    constructor() {
        this.allTasks = [];
        this.morningTasks = [];
        this.afternoonTasks = [];
        this.nightTasks = [];
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

    // Check if it's a new day and reset if needed
    checkAndResetDaily() {
        const today = new Date().toDateString();
        if (this.currentDate !== today) {
            this.performDailyReset();
            this.currentDate = today;
        }
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
        const allTodayTasks = [...this.morningTasks, ...this.afternoonTasks, ...this.nightTasks];
        const unfinishedTasks = allTodayTasks.filter(task => !task.completed);

        // Move unfinished tasks back to main list
        unfinishedTasks.forEach(task => {
            task.completed = false; // Reset completion status
            this.allTasks.push(task);
        });

        // Clear all today's tasks
        this.morningTasks = [];
        this.afternoonTasks = [];
        this.nightTasks = [];

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
        this.morningTasks = JSON.parse(localStorage.getItem('morningTasks') || '[]');
        this.afternoonTasks = JSON.parse(localStorage.getItem('afternoonTasks') || '[]');
        this.nightTasks = JSON.parse(localStorage.getItem('nightTasks') || '[]');
        
        // Migrate old data if exists
        const oldTodayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
        if (oldTodayTasks.length > 0 && this.morningTasks.length === 0 && this.afternoonTasks.length === 0 && this.nightTasks.length === 0) {
            // Distribute old tasks evenly across time slots
            oldTodayTasks.forEach((task, index) => {
                if (index % 3 === 0) this.morningTasks.push(task);
                else if (index % 3 === 1) this.afternoonTasks.push(task);
                else this.nightTasks.push(task);
            });
            this.saveData();
            localStorage.removeItem('todayTasks'); // Clean up old data
        }
    }

    // Check if task is due within 3 days
    isDueSoon(deadline) {
        if (!deadline) return false;
        const now = new Date();
        const dueDate = new Date(deadline);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    }

    // Get deadline state class
    getDeadlineState(deadline) {
        if (!deadline) return '';
        const now = new Date();
        const dueDate = new Date(deadline);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays === 0) return 'due-today';
        if (diffDays === 1) return 'due-tomorrow';
        if (diffDays <= 3) return 'due-soon';
        if (diffDays <= 7) return 'due-week';
        return 'due-future';
    }

    // Check if task is overdue
    isOverdue(deadline) {
        if (!deadline) return false;
        const now = new Date();
        const dueDate = new Date(deadline);
        return dueDate < now;
    }

    // Check if task is overdue
    isOverdue(deadline) {
        if (!deadline) return false;
        const now = new Date();
        const dueDate = new Date(deadline);
        return dueDate < now;
    }

    // Get task list array by source name
    getTaskList(source) {
        if (source === 'all') return this.allTasks;
        if (source === 'morning') return this.morningTasks;
        if (source === 'afternoon') return this.afternoonTasks;
        if (source === 'night') return this.nightTasks;
        return [];
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
        localStorage.setItem('morningTasks', JSON.stringify(this.morningTasks));
        localStorage.setItem('afternoonTasks', JSON.stringify(this.afternoonTasks));
        localStorage.setItem('nightTasks', JSON.stringify(this.nightTasks));
    }

    // Setup all event listeners
    setupEventListeners() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const clearTodayBtn = document.getElementById('clearTodayBtn');
        
        // Time slot containers for drag and drop
        const morningContainer = document.getElementById('morningTasks');
        const afternoonContainer = document.getElementById('afternoonTasks');
        const nightContainer = document.getElementById('nightTasks');

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
        const deadlineInput = document.getElementById('deadlineInput');
        const text = input.value.trim();
        const deadline = deadlineInput ? deadlineInput.value : null;

        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            deadline: deadline || null,
            createdAt: new Date().toISOString()
        };

        this.allTasks.push(task);
        this.saveData();
        this.render();

        input.value = '';
        if (deadlineInput) deadlineInput.value = '';
        input.focus();
    }

    // Delete a task (or move back to checklist)
    deleteTask(taskId, source) {
        if (source === 'all') {
            // Delete completely from main checklist
            this.allTasks = this.allTasks.filter(t => t.id !== taskId);
        } else if (source === 'morning') {
            // Move back to main checklist (not delete)
            const task = this.morningTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = false;
                this.allTasks.push(task);
                this.morningTasks = this.morningTasks.filter(t => t.id !== taskId);
            }
        } else if (source === 'afternoon') {
            // Move back to main checklist (not delete)
            const task = this.afternoonTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = false;
                this.allTasks.push(task);
                this.afternoonTasks = this.afternoonTasks.filter(t => t.id !== taskId);
            }
        } else if (source === 'night') {
            // Move back to main checklist (not delete)
            const task = this.nightTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = false;
                this.allTasks.push(task);
                this.nightTasks = this.nightTasks.filter(t => t.id !== taskId);
            }
        }

        this.saveData();
        this.render();
    }

    // Toggle task completion
    toggleTask(taskId, source) {
        let tasks;
        if (source === 'all') tasks = this.allTasks;
        else if (source === 'morning') tasks = this.morningTasks;
        else if (source === 'afternoon') tasks = this.afternoonTasks;
        else if (source === 'night') tasks = this.nightTasks;
        
        let task = tasks.find(t => t.id === taskId);

        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.render();
        }
    }

    // Edit a task
    editTask(taskId, source) {
        let tasks;
        if (source === 'all') tasks = this.allTasks;
        else if (source === 'morning') tasks = this.morningTasks;
        else if (source === 'afternoon') tasks = this.afternoonTasks;
        else if (source === 'night') tasks = this.nightTasks;
        
        let task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            // Also allow editing deadline
            const currentDeadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '';
            const newDeadline = prompt('Edit deadline (YYYY-MM-DD) or leave empty:', currentDeadline);
            if (newDeadline !== null) {
                task.deadline = newDeadline.trim() || null;
            }
            
            this.saveData();
            this.render();
        }
    }

    // Clear all today's tasks
    clearToday() {
        const totalTasks = this.morningTasks.length + this.afternoonTasks.length + this.nightTasks.length;
        if (totalTasks === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Move all unfinished tasks back to the to-do list?')) {
            // Collect unfinished tasks from all time slots
            const unfinishedTasks = [
                ...this.morningTasks.filter(task => !task.completed),
                ...this.afternoonTasks.filter(task => !task.completed),
                ...this.nightTasks.filter(task => !task.completed)
            ];

            // Move unfinished tasks back to main list
            unfinishedTasks.forEach(task => {
                task.completed = false; // Reset completion status
                this.allTasks.push(task);
            });

            // Clear all today's tasks
            this.morningTasks = [];
            this.afternoonTasks = [];
            this.nightTasks = [];
            
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

        const taskItem = e.target.closest('.task-item, .today-task-item');
        if (!taskItem) return;

        taskItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskItem.dataset.taskId);
        e.dataTransfer.setData('source', taskItem.dataset.source);
        
        // Store the original index for reordering
        const sourceList = this.getTaskList(taskItem.dataset.source);
        const taskIndex = sourceList.findIndex(t => t.id == taskItem.dataset.taskId);
        e.dataTransfer.setData('originalIndex', taskIndex);
    }

    handleDragEnd(e) {
        // Don't handle drag end if it was prevented
        const interactiveElement = e.target.closest('button, input');
        if (interactiveElement) return;

        const taskItem = e.target.closest('.task-item, .today-task-item');
        if (taskItem) {
            taskItem.classList.remove('dragging');
        }
        
        // Remove drag-over class from all containers
        document.querySelectorAll('.today-tasks-container, .task-list').forEach(container => {
            container.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Check if hovering over any time slot container or main task list
        const timeContainer = e.target.closest('.today-tasks-container');
        const taskList = e.target.closest('.task-list');
        
        if (timeContainer) {
            // Remove drag-over from all containers first
            document.querySelectorAll('.today-tasks-container, .task-list').forEach(container => {
                container.classList.remove('drag-over');
            });
            // Add to current container
            timeContainer.classList.add('drag-over');
        } else if (taskList) {
            // Remove drag-over from all containers first
            document.querySelectorAll('.today-tasks-container, .task-list').forEach(container => {
                container.classList.remove('drag-over');
            });
            // Add to task list
            taskList.classList.add('drag-over');
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

        // Remove drag-over class from all containers
        document.querySelectorAll('.today-tasks-container, .task-list').forEach(container => {
            container.classList.remove('drag-over');
        });

        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        const source = e.dataTransfer.getData('source');
        const originalIndex = parseInt(e.dataTransfer.getData('originalIndex'));

        // Check which container was dropped into
        const targetContainer = e.target.closest('.today-tasks-container, .task-list');
        if (!targetContainer) return;

        const targetType = targetContainer.dataset.type || 'all';
        
        // Check if dropping in the same list (reordering)
        if (source === targetType) {
            this.reorderTaskInList(taskId, source, originalIndex, e);
        } else {
            // Moving between different lists
            this.moveTask(taskId, source, targetType);
        }
    }

    // Move task between lists
    moveTask(taskId, sourceList, targetList = null) {
        let task = null;
        let sourceArray = null;

        // Find the task in the source list
        if (sourceList === 'all') {
            sourceArray = this.allTasks;
        } else if (sourceList === 'morning') {
            sourceArray = this.morningTasks;
        } else if (sourceList === 'afternoon') {
            sourceArray = this.afternoonTasks;
        } else if (sourceList === 'night') {
            sourceArray = this.nightTasks;
        }

        if (sourceArray) {
            task = sourceArray.find(t => t.id === taskId);
            if (task) {
                // Remove from source
                sourceArray.splice(sourceArray.indexOf(task), 1);
            }
        }

        if (!task) return;

        // Determine target list
        let targetArray = null;
        if (targetList === 'morning' || (!targetList && sourceList === 'all')) {
            targetArray = this.morningTasks;
        } else if (targetList === 'afternoon') {
            targetArray = this.afternoonTasks;
        } else if (targetList === 'night') {
            targetArray = this.nightTasks;
        } else if (targetList === null && sourceList !== 'all') {
            // Moving from time slot back to all tasks
            targetArray = this.allTasks;
        }

        if (targetArray) {
            task.completed = false; // Reset completion when moving
            targetArray.push(task);
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
        const allTodayTasks = [...this.morningTasks, ...this.afternoonTasks, ...this.nightTasks];
        const totalTasks = allTodayTasks.length;
        const completedTasks = allTodayTasks.filter(task => task.completed).length;
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
        const deadlineState = this.getDeadlineState(task.deadline);
        const deadlineText = task.deadline ? ` (Due: ${new Date(task.deadline).toLocaleDateString()})` : '';
        
        return `
            <li class="task-item ${completed} ${deadlineState}" draggable="true" data-task-id="${task.id}" data-source="${source}" ondragstart="planner.handleDragStart(event)" ondragend="planner.handleDragEnd(event)">
                <input
                    type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="event.stopPropagation(); planner.toggleTask(${task.id}, '${source}')"
                >
                <span class="task-text">${this.escapeHtml(task.text)}${deadlineText}</span>
                <button class="task-edit" onclick="event.stopPropagation(); planner.editTask(${task.id}, '${source}')" title="Edit task">Edit</button>
                <button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, '${source}')">Delete</button>
            </li>
        `;
    }

    // Create today's task HTML (inner content)
    createTodayTaskItemHTML(task, source = 'today') {
        const completed = task.completed ? 'completed' : '';
        const deadlineState = this.getDeadlineState(task.deadline);
        const deadlineText = task.deadline ? ` (Due: ${new Date(task.deadline).toLocaleDateString()})` : '';
        const moveBackButton = task.completed ? '' : `<button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, '${source}')" title="Move back to checklist">←</button>`;

        return `
            <input
                type="checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="event.stopPropagation(); planner.toggleTask(${task.id}, '${source}')"
            >
            <span class="task-text">${this.escapeHtml(task.text)}${deadlineText}</span>
            <button class="task-edit" onclick="event.stopPropagation(); planner.editTask(${task.id}, '${source}')" title="Edit task">Edit</button>
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
        this.renderMorningTasks();
        this.renderAfternoonTasks();
        this.renderNightTasks();
        this.updateProgress();
        this.updateCurrentDate();
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

    // Render morning tasks
    renderMorningTasks() {
        this.renderTimeSlotTasks('morningTasks', this.morningTasks, 'morning');
    }

    // Render afternoon tasks
    renderAfternoonTasks() {
        this.renderTimeSlotTasks('afternoonTasks', this.afternoonTasks, 'afternoon');
    }

    // Render night tasks
    renderNightTasks() {
        this.renderTimeSlotTasks('nightTasks', this.nightTasks, 'night');
    }

    // Helper method to render tasks for a specific time slot
    renderTimeSlotTasks(containerId, tasks, source) {
        const container = document.getElementById(containerId);
        
        // Clear previous content
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (tasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.style.listStyle = 'none';
            emptyState.textContent = 'Drag tasks here';
            container.appendChild(emptyState);
        } else {
            tasks.forEach(task => {
                const li = document.createElement('li');
                const completed = task.completed ? 'completed' : '';
                const deadlineState = this.getDeadlineState(task.deadline);
                li.className = `today-task-item ${completed} ${deadlineState}`;
                li.draggable = true;
                li.dataset.taskId = task.id;
                li.dataset.source = source;
                li.setAttribute('ondragstart', 'planner.handleDragStart(event)');
                li.setAttribute('ondragend', 'planner.handleDragEnd(event)');
                li.innerHTML = this.createTodayTaskItemHTML(task, source);
                
                container.appendChild(li);
            });
        }
    }
}

// Initialize the planner when DOM is ready
let planner;

document.addEventListener('DOMContentLoaded', () => {
    planner = new DayPlanner();
});
