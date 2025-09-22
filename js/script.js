const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

// Mengecek dukungan Local Storage pada browser
function isStorageExist() {
  return typeof Storage !== 'undefined';
}

// Menyimpan data ke Local Storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Memuat data dari Local Storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Menjalankan event saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
  const formSubmit = document.getElementById('form');
  formSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Menambahkan tugas baru ke dalam daftar
function addTodo() {
  const textTodo = document.getElementById('title').value;
  const timeStamp = document.getElementById('date').value;

  if (textTodo.trim() === '' || timeStamp.trim() === '') {
    alert('Judul dan tanggal tidak boleh kosong!');
    return;
  }

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, timeStamp, false);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Membuat ID unik berdasarkan timestamp
function generateId() {
  return +new Date();
}

// Membuat objek tugas
function generateTodoObject(id, task, timeStamp, isCompleted) {
  return { id, task, timeStamp, isCompleted };
}

// Mencari tugas berdasarkan ID
function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

// Mencari indeks tugas berdasarkan ID
function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

// Memindahkan tugas ke daftar "Yang sudah dilakukan"
function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget === null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Memindahkan tugas kembali ke daftar "Yang harus dilakukan"
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget === null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Menghapus tugas dari daftar
function removeTodo(todoId) {
  const todoTargetIndex = findTodoIndex(todoId);
  if (todoTargetIndex === -1) return;

  todos.splice(todoTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Membuat elemen tugas dalam bentuk HTML
function makeTodo(todoObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = todoObject.task;

  const textTimeStamp = document.createElement('p');
  textTimeStamp.innerText = `Tenggat: ${todoObject.timeStamp}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textTimeStamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `todo-${todoObject.id}`);

  // Menambahkan tombol aksi
  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');

  if (todoObject.isCompleted) {
    // Tombol Undo dan Trash untuk tugas yang sudah selesai
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = '↩';
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerText = '🗑';
    trashButton.addEventListener('click', function () {
      removeTodo(todoObject.id);
    });
    actionContainer.append(undoButton, trashButton);

  } else {
    // Tombol Centang dan Trash untuk tugas yang belum selesai
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = '✔';
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(todoObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerText = '🗑';
    trashButton.addEventListener('click', function () {
      removeTodo(todoObject.id);
    });
    actionContainer.append(checkButton, trashButton);
  }
  container.append(actionContainer);
  return container;
}

// Menjalankan event RENDER_EVENT untuk merender ulang daftar tugas
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  const completedTODOList = document.getElementById('completed-todos');

  uncompletedTODOList.innerHTML = '';
  completedTODOList.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  }
});