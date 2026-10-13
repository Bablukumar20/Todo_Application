const STORAGE_KEY = "dynamicTodoTasks";

let tasks = loadTasks();
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");
const activeCount = document.getElementById("activeCount");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now(),
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  taskInput.value = "";
  taskInput.focus();
  render();
});

taskList.addEventListener("click", (event) => {
  const item = event.target.closest(".task-item");
  if (!item) return;

  const id = Number(item.dataset.id);

  if (event.target.closest(".check-btn")) {
    toggleTask(id);
  }

  if (event.target.closest(".delete-btn")) {
    deleteTask(id);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });

    render();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = visibleTasks.map(createTaskHTML).join("");

  const hasVisibleTasks = visibleTasks.length > 0;
  taskList.hidden = !hasVisibleTasks;
  emptyState.hidden = hasVisibleTasks;

  if (!hasVisibleTasks) {
    if (currentFilter === "completed") {
      emptyTitle.textContent = "No completed tasks";
      emptyText.textContent = "Complete a task and it will appear here.";
    } else if (currentFilter === "active") {
      emptyTitle.textContent = "All caught up!";
      emptyText.textContent = "You have no active tasks right now.";
    } else {
      emptyTitle.textContent = "No tasks yet";
      emptyText.textContent = "Add your first task above and start getting things done.";
    }
  }

  updateStats();
}

function createTaskHTML(task) {
  const safeTitle = escapeHTML(task.title);
  const date = new Date(task.createdAt);
  const time = date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });

  return `
    <article class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
      <button class="check-btn" type="button" aria-label="${task.completed ? "Mark task as active" : "Mark task as completed"}">
        ${task.completed ? "✓" : ""}
      </button>

      <div class="task-content">
        <p class="task-title">${safeTitle}</p>
        <p class="task-time">Added ${time}</p>
      </div>

      <button class="delete-btn" type="button" aria-label="Delete task" title="Delete task">×</button>
    </article>
  `;
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  activeCount.textContent = active;
  progressText.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

render();
