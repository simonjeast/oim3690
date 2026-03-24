const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#todo-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "todo-items-v1";
let filter = "all";
let todos = loadTodos();

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter((item) => item && typeof item.text === "string").map((item) => ({
      id: typeof item.id === "number" ? item.id : Date.now() + Math.random(),
      text: item.text.trim(),
      completed: Boolean(item.completed),
    }));
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getVisibleTodos() {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function updateCount() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const label = activeCount === 1 ? "task" : "tasks";
  count.textContent = `${activeCount} ${label} left`;
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = "todo-item";
  if (todo.completed) {
    item.classList.add("is-completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `Mark ${todo.text} as complete`);
  checkbox.addEventListener("change", () => {
    todos = todos.map((entry) =>
      entry.id === todo.id ? { ...entry, completed: checkbox.checked } : entry
    );
    saveTodos();
    renderTodos();
  });

  const label = document.createElement("span");
  label.className = "todo-item__label";
  label.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "todo-item__delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    todos = todos.filter((entry) => entry.id !== todo.id);
    saveTodos();
    renderTodos();
  });

  item.append(checkbox, label, deleteButton);
  return item;
}

function renderTodos() {
  list.innerHTML = "";
  const visible = getVisibleTodos();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "todo-item";
    empty.textContent = "No tasks yet.";
    list.append(empty);
  } else {
    visible.forEach((todo) => list.append(createTodoElement(todo)));
  }

  updateCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }

  todos.unshift({
    id: Date.now(),
    text,
    completed: false,
  });

  saveTodos();
  renderTodos();
  form.reset();
  input.focus();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter || "all";
    filterButtons.forEach((entry) => entry.classList.remove("is-active"));
    button.classList.add("is-active");
    renderTodos();
  });
});

renderTodos();
