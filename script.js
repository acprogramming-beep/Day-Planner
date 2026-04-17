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
    }

    // Check if we need to reset daily tasks (new day detected)
    checkAndResetDaily() {
        const lastDate = localStorage.getItem('lastDate');
        const currentDate = new Date().toDateString();

        if (lastDate !== currentDate) {
            // New day detected - move unfinished tasks from today back to all tasks
            const todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
            const allTasks = JSON.parse(localStorage.getItem('allTasks') || '[]');

            todayTasks.forEach(task => {
                if (!task.completed) {
                    allTasks.push(task);
                }
            });

            localStorage.setItem('allTasks', JSON.stringify(allTasks));
            localStorage.setItem('todayTasks', JSON.stringify([]));
            localStorage.setItem('lastDate', currentDate);
        }
    }

    // Load data from localStorage
    loadData() {
        this.allTasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
        this.todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
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

        // Drag and drop setup
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
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

    // Delete a task
    deleteTask(taskId, source) {
        if (source === 'all') {
            this.allTasks = this.allTasks.filter(t => t.id !== taskId);
        } else if (source === 'today') {
            this.todayTasks = this.todayTasks.filter(t => t.id !== taskId);
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
        // Don't start drag if clicking on interactive elements (buttons, checkboxes)
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            e.preventDefault();
            return;
        }

        if (!e.target.classList.contains('task-item') && !e.target.closest('.task-item')) return;

        const taskItem = e.target.classList.contains('task-item') ? e.target : e.target.closest('.task-item');
        taskItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskItem.dataset.taskId);
        e.dataTransfer.setData('source', taskItem.dataset.source);
    }

    handleDragEnd(e) {
        // Don't handle drag end if it was prevented
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

        const taskItem = e.target.classList.contains('task-item') ? e.target : e.target.closest('.task-item');
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

    // Create task item HTML
    createTaskItemHTML(task, source) {
        const completed = task.completed ? 'completed' : '';
        return `
            <li class="task-item ${completed}" draggable="true" data-task-id="${task.id}" data-source="${source}">
                <input
                    type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="event.stopPropagation(); planner.toggleTask(${task.id}, '${source}')"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, '${source}')">Delete</button>
            </li>
        `;
    }

    // Create today's task HTML (inner content)
    createTodayTaskItemHTML(task) {
        const completed = task.completed ? 'completed' : '';
        return `
            <input
                type="checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="event.stopPropagation(); planner.toggleTask(${task.id}, 'today')"
            >
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="event.stopPropagation(); planner.deleteTask(${task.id}, 'today')">Delete</button>
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
