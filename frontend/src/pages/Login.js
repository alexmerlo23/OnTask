import { useState } from "react"
import { useLogin } from "../hooks/useLogin"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, error, isLoading} = useLogin()

  // handles login button
  const handleSubmit = async (e) => {
    e.preventDefault()

    await login(email, password)
    window.location.reload();
  }

  // login screen
  return (
    <div className="login-page">
      <div className="login-content">
        <div className="left-section">
          <h2>Welcome to OnTask!</h2>
          <p>This website is designed to enhance communication among teachers, parents, and students. Teachers can post reminders and assignments, while students and parents can view them through a shared calendar. Our platform promotes organization and clarity, providing a user-friendly experience while protecting sensitive information.</p>
      </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h3>Log In</h3>
          
          <label>Email address:</label>
          <input 
            type="email" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
          />
          <label>Password:</label>
          <input 
            type="password" 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
          />

          <button disabled={isLoading}>Log in</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default Login