// History Page Script
window.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    const renderHistory = () => {
        const finishedTasks = JSON.parse(localStorage.getItem('finishedTasks') || '[]');
        historyList.innerHTML = '';
        clearHistoryBtn.disabled = finishedTasks.length === 0;

        if (finishedTasks.length === 0) {
            historyList.innerHTML = '<li class="empty-state">No finished tasks yet.</li>';
            return;
        }

        // Sort by finished date, newest first
        finishedTasks.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
        finishedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item completed';
            const date = new Date(task.finishedAt).toLocaleString();
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${escapeHtml(task.text)}</span>
                ${createLabelsHTML(task.labels)}
            </div>
            <span class="history-date">(Finished: ${date})</span>
        `;
            historyList.appendChild(li);
        });
    };

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all completed-task history? This cannot be undone.')) {
            localStorage.removeItem('finishedTasks');
            renderHistory();
        }
    });

    renderHistory();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createLabelsHTML(labels = []) {
    if (!labels.length) return '';
    const labelTags = labels.map(label => `<span class="task-label">${escapeHtml(label)}</span>`).join('');
    return `<span class="task-labels" aria-label="Labels">${labelTags}</span>`;
}
