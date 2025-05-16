import { useState } from "react";
import { useSignup } from "../hooks/useSignup";

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error, isLoading } = useSignup();
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [code, setCode] = useState('');

  // hanldes clicking signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    await signup(email, password, selectedRole, code, name);
    window.location.reload();
  };

  // switches role from student to teacher
  const handleButtonClick = (buttonName) => {
    setSelectedRole(buttonName === selectedRole ? selectedRole : buttonName);
  };

  // signup page
  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Sign Up</h3>

      <label>Name:</label>
      <input 
        type="text" 
        onChange={(e) => setName(e.target.value)} 
        value={name} 
      />

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

      <input 
        type="hidden"  
        value={code} 
      />

      <div className="RoleButtonsContainer">
        <button 
          className={`role-button ${selectedRole === 'student' ? 'active' : ''}`} 
          type="button" 
          onClick={() => handleButtonClick('student')}
        >
          I'm a Student/Parent
        </button>
        <button 
          className={`role-button ${selectedRole === 'teacher' ? 'active' : ''}`} 
          type="button" 
          onClick={() => handleButtonClick('teacher')}
        >
          I'm a Teacher
        </button>
      </div>

      <button disabled={isLoading}>Sign up</button>
          {error && <div className="error">{error}</div>}
        </form>

);
};



export default Signup;