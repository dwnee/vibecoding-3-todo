import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB1TguFKBPntBWGpMZsQdPcrXEWyaMzAmU",
  authDomain: "noona-todo-backend-2b3d9.firebaseapp.com",
  databaseURL: "https://noona-todo-backend-2b3d9-default-rtdb.firebaseio.com",
  projectId: "noona-todo-backend-2b3d9",
  storageBucket: "noona-todo-backend-2b3d9.firebasestorage.app",
  messagingSenderId: "693087686586",
  appId: "1:693087686586:web:f2e06bfb1e1eb9069d9783",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todosRef = ref(db, "todos");

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoItemTemplate = document.getElementById("todo-item-template");

let todos = [];

/** Firebase Realtime Database `todos` 아래에 새 할 일 문서 추가 */
async function addTodo(text) {
  const newRef = push(todosRef);
  await set(newRef, {
    text,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const item = todoItemTemplate.content.firstElementChild.cloneNode(true);
    const textEl = item.querySelector(".todo-text");
    const editBtn = item.querySelector(".edit-btn");
    const deleteBtn = item.querySelector(".delete-btn");

    textEl.textContent = todo.text;

    editBtn.addEventListener("click", async () => {
      const nextText = prompt("수정할 내용을 입력하세요.", todo.text);
      if (nextText === null) return;

      const trimmed = nextText.trim();
      if (!trimmed) {
        alert("빈 내용은 저장할 수 없습니다.");
        return;
      }

      try {
        await update(ref(db, `todos/${todo.id}`), {
          text: trimmed,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error(error);
        alert("수정에 실패했습니다.");
      }
    });

    deleteBtn.addEventListener("click", async () => {
      const ok = confirm("이 할 일을 삭제할까요?");
      if (!ok) return;

      try {
        await remove(ref(db, `todos/${todo.id}`));
      } catch (error) {
        console.error(error);
        alert("삭제에 실패했습니다.");
      }
    });

    todoList.appendChild(item);
  });
}

onValue(
  todosRef,
  (snapshot) => {
    const data = snapshot.val() || {};
    todos = Object.entries(data)
      .map(([id, value]) => ({
        id,
        text: value.text,
        createdAt: value.createdAt || 0,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
    renderTodos();
  },
  (error) => {
    console.error("Realtime Database 읽기 실패:", error);
    alert("할 일 목록을 불러오지 못했습니다. 보안 규칙과 DB URL을 확인하세요.");
  }
);

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) return;

  try {
    await addTodo(text);
    todoInput.value = "";
    todoInput.focus();
  } catch (error) {
    console.error(error);
    alert("Firebase에 추가하지 못했습니다. 보안 규칙과 네트워크를 확인하세요.");
  }
});
