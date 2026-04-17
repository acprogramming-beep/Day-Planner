# 📅 Day Planner App

A simple, elegant day-planner web application that helps you manage your to-do list and plan your daily tasks with drag-and-drop functionality.

## Features

✨ **Core Features:**
- **To-Do List Checklist**: Maintain a complete list of all tasks you need to accomplish
- **Daily Task Planning**: Drag tasks from your to-do list to a dedicated "Today's Tasks" section
- **Persistent Storage**: All tasks are saved automatically using browser localStorage
- **Daily Reset**: Unfinished tasks automatically return to your to-do list at the start of each day
- **Task Management**: 
  - Mark tasks as complete with checkboxes
  - Delete tasks from either list
  - Add new tasks with keyboard (Enter key) or button click
- **Intuitive Drag & Drop**: Simple click-and-drag interface to move tasks between lists

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. The app will load your saved tasks or start fresh if this is your first time

### 📱 Access on iPad (or any Device on Your Network)

#### **Option 1: Deploy to Cloud (Recommended - No Computer Required!)**

The app is now a **Progressive Web App (PWA)** that works completely offline. Deploy it for free to access from anywhere:

**Deploy to GitHub Pages (5 minutes):**
1. Create a GitHub account at [github.com](https://github.com)
2. Fork or create a new repository named `day-planner`
3. Upload all files to the repository
4. Go to **Settings** → **Pages** → Select `main` branch
5. Access your app at `https://yourusername.github.io/day-planner`
6. On iPad: bookmark this link and add to home screen!

**Deploy to Netlify (5 minutes):**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the folder containing all the files
3. Get a live URL instantly
4. On iPad: bookmark and add to home screen!

**Deploy to Vercel (5 minutes):**
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub or upload files
3. Deploy with one click
4. Access from anywhere!

#### **Option 2: Local Server (Computer Must Stay On)**
If you prefer to run locally, see the "Server Setup" section below.

#### **Option 3: No Deployment - Just Use Offline**
Once you open the app once in Safari on iPad, it caches everything locally. You can then:
1. Use it completely offline
2. Data persists on that device
3. Add to home screen for quick access

### Adding Tasks
1. Type a task description in the "Add a new task..." input field
2. Press Enter or click the "Add" button
3. The task appears in your To-Do List

### Planning Your Day
1. **Drag tasks** from the left "To-Do List" panel to the right "Today's Tasks" panel
2. Focus on completing the tasks in "Today's Tasks"
3. As you finish tasks, check the checkbox to mark them complete

### Completing Tasks
- Click the **checkbox** next to any task to mark it as complete
- Completed tasks appear dimmed with strikethrough text
- You can still delete completed tasks or uncheck them if needed

### End of Day
- **Finished tasks**: These can be deleted to clean up
- **Unfinished tasks in Today's Tasks**: Click "Clear Today" to automatically move all unfinished tasks back to your To-Do List
- The next day, all unfinished tasks will be available in your To-Do List again

### Deleting Tasks
- Click the **Delete** button next to any task to remove it completely
- This action is permanent

## Technical Details

### Files
- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - JavaScript logic and functionality
- `service-worker.js` - Service worker for offline support
- `manifest.json` - PWA configuration
- `README.md` - Documentation (this file)

### How It Works
- **Storage**: Uses browser localStorage to persist data
- **Daily Reset**: Automatically detects new days and moves unfinished tasks from "Today's Tasks" back to "To-Do List"
- **Drag & Drop**: Uses HTML5 Drag and Drop API for smooth task movement
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Support**: Service worker caches the app for offline functionality
- **PWA**: Can be installed on home screen as a standalone app

### Browser Compatibility
- Chrome/Edge: ✅ Full PWA support
- Firefox: ✅ Full PWA support
- Safari: ✅ Works as web app (can add to home screen)
- Mobile browsers: ✅ Touch-friendly (drag functionality may vary)

## Tips for Best Use

1. **Review Daily**: Check your day planner each morning to see what needs to be done
2. **Realistic Goals**: Only drag tasks you can realistically complete today
3. **Regular Cleanup**: Delete completed tasks to keep your list manageable
4. **Clear at Day's End**: Use "Clear Today" at the end of your day to reset for tomorrow

## Server Setup (Optional - For Local Network Only)

**⚠️ Note:** You don't need this if you deployed to the cloud (see iPad access section above).

Only use the local server if you want to run the app only on your home WiFi network while your computer is on.

### Files Included:
- **`server.py`** - Python HTTP server script
- **`start-server.bat`** - Windows batch file to easily start the server

### Running the Server:

**Windows (Easiest):**
1. Double-click `start-server.bat`
2. Your computer's network IP will be displayed
3. Open the shown URL on any device on your WiFi

**Mac/Linux/Manual:**
```bash
python3 server.py
```

### Requirements:
- Python 3.x installed (download from [python.org](https://www.python.org/))
- Connected to WiFi
- Other devices on the same network

### Troubleshooting:

**"Python is not installed"**
- Install Python from https://www.python.org/
- During installation, check "Add Python to PATH"

**Can't connect from iPad**
- Verify iPad is on the same WiFi network
- Check your computer's IP address (shown in server output)
- Make sure Windows Firewall isn't blocking the connection
- Try `http://192.168.x.x:8000` format

**Server won't start**
- Try running as Administrator
- Make sure port 8000 isn't already in use
- Check that you're in the correct folder

## Future Enhancement Ideas

- Recurring tasks
- Task priorities/categories
- Time estimates
- Due dates
- Export/import tasks
- Dark mode
- Cloud sync

---

**Enjoy organizing your day! 🚀**
