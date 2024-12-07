import { useState } from "react"
import { useLogin } from "../hooks/useLogin"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, error, isLoading} = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()

    await login(email, password)
  }

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="left-section">
          <h2>Welcome to OnTask!</h2>
          <p>This website is made to enhance communication among teachers, parents, and students. Users can track assignments, view announcements, and access a weekly calendar. Our platform improves organization and clarity, ensuring a user-friendly experience while safeguarding sensitive information.</p>
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