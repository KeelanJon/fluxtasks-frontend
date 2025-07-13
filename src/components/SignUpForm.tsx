import React, { useState } from "react"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import CookieBanner from "./CookieBanner"
import "../styles/forms.css"

type SignupFormProps = {
  setAuthenticated: (value: boolean) => void
}

type FormData = {
  email: string
  password: string
}

type FormErrors = {
  email?: string
  password?: string
}

const SignupForm: React.FC<SignupFormProps> = ({ setAuthenticated }) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signupMessage, setSignupMessage] = useState("")

  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()
      console.log("Signup Attempt Response: ", data)

      if (data.success === true) {
        setAuthenticated(true)
        document.cookie = `auth=true; max-age=86400; path=/`

        navigate("/") // redirect to app
      } else {
        setSignupMessage(data.error || "Signup failed")
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Error during Signup POST request: ", err)
      setSignupMessage("An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`form-input ${errors.email ? "error" : ""}`}
              />
            </div>
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={12} className="form-error-icon" />
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`form-input with-toggle ${
                  errors.password ? "error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={12} className="form-error-icon" />
                {errors.password}
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="signup-link-container" style={{ color: "red" }}>
          {signupMessage}
        </div>

        <div className="signup-link-container">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="signup-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <CookieBanner />
    </div>
  )
}

export default SignupForm
