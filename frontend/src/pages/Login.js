import { useState } from "react"
import { useLogin } from "../hooks/useLogin"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, error, isLoading} = useLogin()

  // handles login button
  const handleSubmit = async (e) => {
    e.preventDefault()

    const successfulLogin = await login(email, password)
    if (successfulLogin) {
      // window.location.reload();
    }
  }

  // login screen
  return (
    <div className="login-page">
      <div className="login-content">
        <div className="left-section">
          <h2>Welcome to OnTask!</h2>
          <p>At OnTask, our goal is to help parents play an active role in their child’s education. Through the power of a shared calendar, teachers can post assignments while parents track progress and mark them as completed. This gives teachers reassurance that assignments are being completed legitimately while also keeping parents informed about their child's course work.</p>
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