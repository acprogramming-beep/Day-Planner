# Day Planner

A browser-based day planner for keeping an unscheduled task list, assigning work to today’s schedule, and reviewing completed tasks. It works entirely on the device and can be used offline after its first successful load.

## Features

### Task list

- Add a task with the **Add** button or by pressing Enter in the task field.
- Add an optional deadline to a task.
- Edit a task’s text, deadline, and labels.
- Delete a task from the unscheduled To-Do List.
- Mark tasks complete with a checkbox.
- Drag tasks to reorder them in the unscheduled list.
- Tasks are sorted by deadline urgency: overdue tasks first, then upcoming deadlines, then tasks without deadlines.

### Labels and filtering

- Add one or more labels when creating or editing a task. Separate labels with commas, for example: `Work, urgent`.
- Labels appear as tags on tasks and in task history.
- Each task keeps only one copy of a label, ignoring capitalization differences.
- Previously used labels are saved locally as suggestions and tap-to-select chips, so they can be reused without retyping (including on iPad).
- Filter the unscheduled To-Do List with the label checklist.
  - With no labels checked, all unscheduled tasks are shown.
  - With one or more labels checked, a task appears if it has **at least one** selected label (OR matching).
- Scheduled tasks are not hidden by the unscheduled-list filter.

### Daily scheduling

- Plan today’s work in separate **Morning**, **Afternoon**, and **Night** sections.
- Drag tasks from the unscheduled list into a time section.
- Drag tasks between time sections or back to the unscheduled list.
- Reorder tasks within any section using drag and drop.
- Use the move-back control on an incomplete scheduled task to return it to the unscheduled list.
- Track the day’s scheduled-task completion with a live progress bar.
- Use **Clear Today** to clear the schedule; unfinished tasks are returned to the unscheduled list.

### Deadlines

- Display a task’s due date beside its title.
- Visually highlight overdue and approaching tasks, including tasks due today, tomorrow, within three days, or within a week.

### Completion history

- Completed tasks are saved to the **Task History** page with their completion date and labels.
- If a task is completed more than once, history retains only its most recent completion record.
- Use **Clear history** to permanently remove all completed-task records. This does not remove active or scheduled tasks.

### Daily reset

- At midnight, unfinished scheduled tasks automatically return to the unscheduled To-Do List.
- The app also checks periodically for a missed day change while it remains open.
- A visible notification explains how many unfinished tasks were moved back when the app is open.

### Navigation and usability

- The home and history controls are compact, accessible line icons in the upper-right corner.
- Layout adapts for desktop and smaller screens.
- A service worker and web app manifest support offline use and installation as a Progressive Web App (PWA), where supported by the browser.

## How to use it

1. Add a task, optionally choosing a deadline and comma-separated labels.
2. Reuse a label suggestion when appropriate.
3. Use the left-side label checklist to focus the unscheduled list.
4. Drag the tasks you want to do today into Morning, Afternoon, or Night.
5. Check tasks off as you finish them and review them later from the History icon.

## Data and privacy

The app does not use a server or cloud database. Its data is saved in the browser’s `localStorage` for the site, so it remains on that browser profile and device.

| Stored key | Contents |
| --- | --- |
| `allTasks` | Unscheduled tasks |
| `morningTasks`, `afternoonTasks`, `nightTasks` | Scheduled tasks for each time section |
| `finishedTasks` | Most recent completion record for each completed task |
| `usedLabels` | Reusable label suggestions |
| `plannerDate` | Date used to detect a new day and reset the saved schedule |

Clearing history removes only `finishedTasks`. Labels remain available for reuse even if the task that first used them is deleted.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Main planner interface |
| `history.html` | Completed-task history page |
| `style.css` | Responsive styling |
| `script.js` | Planner, scheduling, labels, filtering, and storage logic |
| `history.js` | History rendering and clearing logic |
| `service-worker.js` | Offline asset caching |
| `manifest.json` | PWA metadata |

## Browser support

The app uses standard modern browser capabilities: `localStorage`, HTML drag and drop, and service workers. Chrome, Edge, Firefox, and Safari support the core planner; installation and some drag behavior can vary by browser and device.
