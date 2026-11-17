const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const empty = document.getElementById("empty");
const summary = document.getElementById("summary");
const errorBox = document.getElementById("error");

let tasks = [];

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("Request failed");
  return res.status === 204 ? null : res.json();
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function render() {
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute("aria-label", `Mark "${task.title}" as done`);
    check.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.textContent = task.title;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(check, text, del);
    list.append(li);
  });

  const doneCount = tasks.filter((t) => t.done).length;
  empty.hidden = tasks.length > 0;
  summary.textContent = tasks.length ? `${doneCount} of ${tasks.length} done` : "";
}

async function loadTasks() {
  try {
    tasks = await api("/api/tasks");
    showError("");
    render();
  } catch {
    showError("Could not load tasks. Refresh the page to try again.");
  }
}

async function addTask(title) {
  try {
    const task = await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    tasks.push(task);
    showError("");
    render();
  } catch {
    showError("Could not add the task. Try again.");
  }
}

async function toggleTask(id) {
  try {
    const updated = await api(`/api/tasks/${id}`, { method: "PATCH" });
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    showError("");
    render();
  } catch {
    showError("Could not update the task. Try again.");
  }
}

async function deleteTask(id) {
  try {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    tasks = tasks.filter((t) => t.id !== id);
    showError("");
    render();
  } catch {
    showError("Could not delete the task. Try again.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title);
  input.value = "";
  input.focus();
});

loadTasks();
