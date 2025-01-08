let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


function addTask() {
  const input = document.querySelector("#task-input");
  const taskValue = input.value.trim();

  if (!taskValue) {
    alert("Task cannot be empty!");
    return;
  }

  const taskId = new Date().getTime().toString();

  tasks.push({
    id: taskId,
    title: taskValue,
    subtasks: [],
    done: false,
    createdDate: new Date().toLocaleDateString("en-US"),
    completedDate: null,
  });

  input.value = "";
  saveData();
  renderTasks();
}


function addSubtask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  const subtaskInput = document.querySelector(`#subtask-input-${taskId}`);
  const subtaskValue = subtaskInput.value.trim();

  if (!subtaskValue) {
    alert("Subtask cannot be empty!");
    return;
  }

  tasks[taskIndex].subtasks.push({
    title: subtaskValue,
    done: false,
  });

  subtaskInput.value = "";
  saveData();
  renderTasks();
}


function markTaskAsDone(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  const task = tasks[taskIndex];
  task.done = !task.done; 
  task.completedDate = task.done ? new Date().toLocaleDateString("en-US") : null;

  saveData();
  renderTasks();
}


function toggleSubtask(taskId, subtaskIndex) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  const subtask = tasks[taskIndex].subtasks[subtaskIndex];
  subtask.done = !subtask.done;
  saveData();
  renderTasks();
}


function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  tasks.splice(taskIndex, 1);
  saveData();
  renderTasks();
}

function deleteFromHistory(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  tasks.splice(taskIndex, 1);
  saveData();
  renderTasks();
}


function deleteSubtask(taskId, subtaskIndex) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
  saveData();
  renderTasks();
}

function clearHistory() {
  tasks = tasks.filter(task => !task.done);
  saveData();
  renderTasks();
}


function toggleSubtaskInput(taskId) {
  const subtaskInputContainer = document.querySelector(`#subtask-container-${taskId}`);
  const toggleButton = document.querySelector(`#toggle-subtask-button-${taskId}`);
  
  subtaskInputContainer.classList.toggle('d-none');

 
  if (subtaskInputContainer.classList.contains('d-none')) {
    toggleButton.textContent = 'Add Subtask';
  } else {
    toggleButton.textContent = 'Close'; 
  }
}


function renderTasks() {
  const taskList = document.querySelector("#task-list");
  const historyList = document.querySelector("#history-list");
  const clearHistoryButton = document.querySelector("#clearhistory");

  const activeTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

 
  taskList.innerHTML = activeTasks
    .map((task) => {
      return `
        <li class="mt-3 mb-4" id="task-${task.id}" draggable="true" ondragstart="dragTask(event, '${task.id}')">
          <span class="fs-2">${task.title}</span>
          
          <button class="btn-sm rounded btn-success ms-1 me-1" onclick="markTaskAsDone('${task.id}')">
          <i class="fa-solid fa-check"></i>
          </button>
          <button class="btn-sm rounded btn-danger me-1" onclick="deleteTask('${task.id}')"><i class="fa-solid fa-trash"></i></button>
          
          <!-- Toggle Subtask Input Button -->
          <button class="btn-sm rounded btn-primary" id="toggle-subtask-button-${task.id}" onclick="toggleSubtaskInput('${task.id}')">
           <i class="fa-solid fa-plus"></i>
          </button>
          
          <!-- Subtask Input Form -->
          <div id="subtask-container-${task.id}" class="d-none mt-2">
            <input class="me-1 bg-transparent border-bottom border-white py-1 rounded px-1 outline-none overflow-hidden text-white" id="subtask-input-${task.id}" type="text" placeholder="Add a subtask">
            <button class="btn-sm rounded btn-success" onclick="addSubtask('${task.id}')"> <i class="fa-solid fa-plus"></i></button>
          </div>
          <br>
          <small class="mt-2 text-secondary">(Created: ${task.createdDate})</small>

          <ul>
            ${task.subtasks
              .map(
                (subtask, subIndex) => `
                  <li class="mt-3 mb-3">
                    <span>${subtask.done ? `<del>${subtask.title}</del>` : subtask.title}</span>
                    <button class="btn-sm rounded btn-success ms-2" onclick="toggleSubtask('${task.id}', ${subIndex})">
                      ${subtask.done ? `<i class="fa-solid fa-rotate-left"></i>` : `<i class="fa-solid fa-check"></i>`}
                    </button>
                    <button class="btn-sm rounded btn-danger" onclick="deleteSubtask('${task.id}', ${subIndex})"><i class="fa-solid fa-trash"></i></button> 
                  </li>
                `
              )
              .join("")}
          </ul>
        </li>
      `;
    })
    .join("");


  historyList.innerHTML = completedTasks
    .map((task) => {
      return `
        <li class="mt-2 mb-4">
          <span><del>${task.title}</del></span>
          <small>(Completed: ${task.completedDate})</small>
          <button class="btn-sm rounded btn-danger ms-2" onclick="deleteFromHistory('${task.id}')"><i class="fa-solid fa-trash"></i></button>
        </li>
      `;
    })
    .join("");


  clearHistoryButton.style.display = completedTasks.length > 0 ? 'block' : 'none';
}


function dragTask(event, taskId) {
  event.dataTransfer.setData("taskId", taskId);
}


document.querySelector("#task-list").addEventListener("dragover", (event) => {
  event.preventDefault();
});


document.querySelector("#task-list").addEventListener("drop", (event) => {
  const draggedTaskId = event.dataTransfer.getData("taskId");
  const droppedTaskId = event.target.closest("li")?.id?.replace('task-', '');
  if (!draggedTaskId || !droppedTaskId || draggedTaskId === droppedTaskId) return;

  const draggedTaskIndex = tasks.findIndex(task => task.id === draggedTaskId);
  const droppedTaskIndex = tasks.findIndex(task => task.id === droppedTaskId);

  const temp = tasks[draggedTaskIndex];
  tasks[draggedTaskIndex] = tasks[droppedTaskIndex];
  tasks[droppedTaskIndex] = temp;

  saveData();
  renderTasks();
});


document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
});
