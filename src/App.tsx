import React, { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { Plus, Check, Sun, Moon, Trash2 } from "lucide-react"
import LoginForm from "./components/LoginForm"
import SignupForm from "./components/SignUpForm"
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
  const navigate = useNavigate()
  //Handle Logout

  function logout() {
    console.log("Users Logged out")

    document.cookie = "auth=; max-age=0; path=/"
    setAuthenticated(false)
    navigate("/login") // send the user back to the login page
  }

  // Load tasks from localStorage on component mount
  useEffect(() => {
    getSavedTasks()
  }, [])

  function getSavedTasks() {
    try {
      const savedTasks = localStorage.getItem("todoTasks")
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        setTasks(parsedTasks)
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error)
      setTasks([])
    }
  }

  // Save tasks to localStorage whenever tasks change
  const saveTasksToStorage = (updatedTasks: Task[]) => {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(updatedTasks))
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error)
    }
  }

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

  const addTask = () => {
    if (newTask.trim() === "") return

    const newTaskObj: Task = {
      id: Date.now(), // Simple ID generation using timestamp
      text: newTask.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTaskObj]
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
    setNewTask("")
  }

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            updated_at: new Date().toISOString(),
          }
        : task
    )

    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
  }

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addTask()
  }

  const taskAppContent = (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Tasks</h1>
          <div className="header-buttons-wrapper">
            <button className="logout-button button-secondary" onClick={logout}>
              Logout
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
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
        <form className="add-task-container" onSubmit={handleSubmit}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />
          <button onClick={addTask} className="add-button">
            <Plus size={16} />
            Add
          </button>
        </form>

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
  )

  return (
    <Routes>
      <Route
        path="/"
        element={authenticated ? taskAppContent : <Navigate to="/login" />}
      ></Route>
      <Route
        path="/login"
        element={<LoginForm setAuthenticated={setAuthenticated} />}
      ></Route>
      <Route
        path="/signup"
        element={<SignupForm setAuthenticated={setAuthenticated} />}
      ></Route>
    </Routes>
  )
}
