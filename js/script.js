const todos = [];
const RENDER_EVENT = "render-todo";

// Menjalankan event saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
    const formSubmit = document.getElementById('form');
    formSubmit.addEventListener("submit", function (event) {
        event.preventDefault();
        addTodo();
    });
});

// Menambahkan tugas baru ke dalam daftar
function addTodo() {
    const textTodo = document.getElementById("title").value;
    const timeStamp = document.getElementById("date").value;

    if (textTodo.trim() === "" || timeStamp.trim() === "") {
        alert("Judul dan tanggal tidak boleh kosong!");
        return;
    }

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textTodo, timeStamp, false);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Membuat ID unik berdasarkan timestamp
function generateId() {
    return +new Date();
}

// Membuat objek tugas
function generateTodoObject(id, task, timeStamp, isCompleted) {
    return { id, task, timeStamp, isCompleted };
}

// Menjalankan event RENDER_EVENT untuk merender ulang daftar tugas
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('todos'); // "Yang harus dilakukan"
    const completedTODOList = document.getElementById('completed-todos'); // "Yang sudah dilakukan"

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

    if (todoObject.isCompleted) {
        // Tombol Undo untuk memindahkan tugas kembali ke daftar belum selesai
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.innerText = "↩";

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(todoObject.id);
        });

        // Tombol Trash untuk menghapus tugas
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = "🗑";

        trashButton.addEventListener('click', function () {
            removeTodo(todoObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        // Tombol centang untuk memindahkan tugas ke daftar sudah selesai
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.innerText = "✔";

        checkButton.addEventListener('click', function () {
            addTaskToCompleted(todoObject.id);
        });

        // Tombol Trash untuk menghapus tugas
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = "🗑";

        trashButton.addEventListener('click', function () {
            removeTodo(todoObject.id);
        });

        container.append(checkButton, trashButton);
    }

    return container;
}

// Mencari tugas berdasarkan ID
function findTodo(todoId) {
    return todos.find(todo => todo.id === todoId) || null;
}

// Memindahkan tugas ke daftar "Yang sudah dilakukan"
function addTaskToCompleted(todoId) {
    const todo = findTodo(todoId);
    if (todo) {
        todo.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Memindahkan tugas kembali ke daftar "Yang harus dilakukan"
function undoTaskFromCompleted(todoId) {
    const todo = findTodo(todoId);
    if (todo) {
        todo.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Menghapus tugas dari daftar
function removeTodo(todoId) {
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}
