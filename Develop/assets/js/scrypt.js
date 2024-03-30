// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const taskId = nextId;
  nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div class="card task-card mb-3"></div>');
    taskCard.attr("id", `task-${task.id}`);
    taskCard.attr("data-id", task.id);
  
    const taskHeader = $('<div class="card-header"></div>');
    taskHeader.text(task.title);
    taskCard.append(taskHeader);
  
    const taskBody = $('<div class="card-body"></div>');
    taskBody.html(`
      <p class="card-text">${task.description}</p>
      <p class="card-text"><small>Due: ${task.dueDate}</small></p>
    `);
    taskCard.append(taskBody);
  
    const deleteButton = $('<button class="btn btn-danger btn-sm delete-task">Delete</button>');
    deleteButton.on("click", handleDeleteTask);
    taskCard.append(deleteButton);
  
    // Color-code the task card based on the due date
    const today = dayjs();
    const dueDate = dayjs(task.dueDate);
    if (today.isSame(dueDate, "day")) {
      taskCard.addClass("bg-warning");
    } else if (today.isAfter(dueDate)) {
      taskCard.addClass("bg-danger");
    }
  
    return taskCard;
  }


// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  if (taskList && taskList.length > 0) {
    taskList.forEach(function (task) {
      const taskCard = createTaskCard(task);
      $(`#${task.status}-cards`).append(taskCard);
    });

    $(".task-card").draggable({
      revert: "invalid",
      start: function () {
        $(this).addClass("dragging");
      },
      stop: function () {
        $(this).removeClass("dragging");
      },
    });
  }
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
  
    const title = $("#task-title").val();
    const description = $("#task-description").val();
    const dueDate = $("#task-due-date").val();
  
    const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      dueDate: dueDate,
      status: "todo",
    };
  
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
  
    $("#add-task-form")[0].reset();
    $("#formModal").modal("hide");
  
    renderTaskList();
  }


// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest(".task-card").attr("data-id");
    taskList = taskList.filter((task) => task.id !== parseInt(taskId));
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr("data-id");
  const newStatus = $(this).attr("id");

  taskList.forEach(function (task) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Remove the dragged task card from its original position
  ui.draggable.remove();

  // Append the dragged task card to the target column's card container
  $(`#${newStatus}-cards`).append(ui.draggable);
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#add-task-form").on("submit", handleAddTask);

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
    tolerance: "pointer",
    hoverClass: "highlight",
  });

  $(".task-card").draggable({
    revert: "invalid",
    start: function () {
      $(this).addClass("dragging");
    },
    stop: function () {
      $(this).removeClass("dragging");
    },
  });

  $("#task-due-date").datepicker({
    dateFormat: "yy-mm-dd",
  });
});