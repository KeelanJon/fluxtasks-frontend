import React, { useState, useEffect } from "react"
import { Plus, Check, Sun, Moon, Trash2 } from "lucide-react"
import LoginForm from "./components/LoginForm"
import "./styles/styles.css"

type Task = {
  id: number
  text: string
  completed: boolean
  created_at: string
  updated_at: string
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [authenticated, setAuthenticated] = useState(
    getCookie("auth") ? true : false
  )

  async function getSavedTasks() {
    const savedTasks = await fetch(import.meta.env.VITE_API_URL + "/api/tasks")
    const data = await savedTasks.json()

    setTasks(data)
  }

  useEffect(() => {
    getSavedTasks()
  }, [])

  // Set theme attribute on document
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    )
  }, [darkMode])

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? match[2] : null
  }

  const addTask = async () => {
    try {
      console.log("Adding new task")

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newTask.trim(),
        }),
      })

      const data = await res.json()
      console.log(data)
    } catch (err) {
      console.error("Error during POST request: ", err)
    }

    setNewTask("")
    getSavedTasks()
  }

  const toggleTask = async (id: number) => {
    //First get current data of the toggled task.
    const searchIndex = tasks.findIndex((task) => task.id == id)

    if (searchIndex !== -1) {
      console.log("Found at index:", searchIndex)
      console.log("Item:", tasks[searchIndex])
    } else {
      console.log("Item not found")
    }

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/tasks/" + id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: tasks[searchIndex].text,
            completed: !tasks[searchIndex].completed,
          }),
        }
      )

      const data = await res.json()
      console.log("Success toggling task completion: ", data)
    } catch (err) {
      console.error("Error during PATCH request: ", err)
    }

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/tasks/" + id,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const data = await res.json()
      console.log("Delete Successful: ", data)
    } catch (err) {
      console.error("Error during DELETE request: ", err)
    }

    setTasks(tasks.filter((task) => task.id !== id))
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return authenticated ? (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Tasks</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Stats */}
        <div className="stats-card">
          <div className="stats-content">
            <span className="stats-label">Completed</span>
            <span className="stats-value">
              {completedCount} of {totalCount}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width:
                  totalCount > 0
                    ? `${(completedCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        {/* Add Task Input */}
        <div className="add-task-container">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="task-input"
          />
          <button onClick={addTask} className="add-button">
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tasks yet. Add one above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`task-checkbox ${task.completed ? "checked" : ""}`}
                >
                  {task.completed && <Check size={14} />}
                </button>

                <span className="task-text">{task.text}</span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        <footer>
          <p>
            Developed by{" "}
            <a href="https://keelanjon.com" target="_blank">
              KeelanJon
            </a>
          </p>
        </footer>
      </div>
    </div>
  ) : (
    <LoginForm setAuthenticated={setAuthenticated} />
  )
}
