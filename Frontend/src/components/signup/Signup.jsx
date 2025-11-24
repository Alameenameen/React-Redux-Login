import React,{useState} from "react";
import api from "../../utils/Api";
import {useNavigate} from 'react-router-dom';
import {toast , Toaster} from "sonner";
import '../../assets/Styles/Signup.css'


export default function Signup(){
    const [formData , setFormData] = useState({
      userName:"",
      email:"",
      phone:"",
      password:"",
      profilePicture:null
    })

 const Navigate = useNavigate();

      const [error , setError] = useState({
      userName:"",
      email:"",
      phone:"",
      password:"",
      profilePicture:""
    })

 const validateUserName = (userName)=>{
   const namePattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
  if (!namePattern.test(userName)) {
    return "Name should contain only letters and spaces";
  }
  return "";
 }

const validatePhone = (phone) => {
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phone)) {
    return "Phone number should be exactly 10 digits";
  }
  return "";
};


const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Enter a valid email";
  }
  return "";
};


const validateProfilePicture = (file) => {
  if (!file) return "Profile picture is required";
  const validTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!validTypes.includes(file.type)) return "Only PNG / JPG / JPEG allowed";
  if (file.size > 2 * 1024 * 1024) return "File must be under 2MB";
  return "";
};


const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordPattern.test(password)) {
      return "Password must be at least 6 characters with 1 uppercase and 1 number";
    }
    return "";
  };


const handleChange = (e) =>{
  const {name,value} = e.target;
  setFormData((prev)=>({...prev,[name]:value}));
  console.log(e.target)
  
  //this is the live validation 

  if(name === "userName") setError((prev)=>({...prev,userName:validateUserName(value)}));
  if(name === "phone") setError((prev)=>({...prev,phone:validatePhone(value)}))
  if(name === "email") setError((prev)=>({...prev,email:validateEmail(value)}))
}



const handleFileChange = (e) =>{
  const file = e.target.files[0];
  setFormData((prev)=>({...prev,profilePicture:file}));
  setError((prev)=>({...prev,profilePicture:validateProfilePicture(file)}));
}


const handleSubmit = async(e)=>{
  e.preventDefault();

  //final validations checking

  const nameError = validateUserName(formData.userName);
  const phoneError = validatePhone(formData.phone);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const profileError = validateProfilePicture(formData.profilePicture);

    const newErrors = {
      userName: nameError,
      phone: phoneError,
      email: emailError,
      password: passwordError,
      profilePicture: profileError,
    };
    setError(newErrors);

    //checking if any string is empty or not
    if(Object.values(newErrors).some(Boolean)) return;


    const data = new FormData();

// preparing userdata for sending to  backend
    data.append("userName",formData.userName)
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("password", formData.password);
    data.append("profilePicture", formData.profilePicture);


    try {
      const response = await api.post("/auth/signup",data,{
        headers:{"Content-Type":"multipart/form-data"}
      });

      toast.success("Registration Sucessfull");

      // setTimeout(()=>Navigate("/"),2000);
    } catch (error) {
      const msg = error.response?.data?.message || "signup Failed";
      toast.error(msg);
    }

};





    return (
     <>
      <Toaster position="top-center" />
      <div className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">Signup</h2>
          <form onSubmit={handleSubmit} className="signup-form">
            <input type="text" name="userName" placeholder="Username" value={formData.userName} onChange={handleChange} className={`form-input ${error.userName ? "input-error" : ""}`} />
            {error.userName && <p className="error-message">{error.userName}</p>}

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`form-input ${error.email ? "input-error" : ""}`} />
            {error.email && <p className="error-message">{error.email}</p>}

            <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={`form-input ${error.phone ? "input-error" : ""}`} />
            {error.phone && <p className="error-message">{error.phone}</p>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={`form-input ${error.password ? "input-error" : ""}`} />
            {error.password && <p className="error-message">{error.password}</p>}

            <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} className="form-file-input" />
            {error.profilePicture && <p className="error-message">{error.profilePicture}</p>}

            <button type="submit" className="submit-btn" disabled={
              !formData.userName || !formData.email || !formData.phone || !formData.password || !formData.profilePicture ||
              !!error.userName || !!error.phone || !!error.email || !!error.password || !!error.profilePicture
            }>Sign Up</button>
          </form>

          <a className="signup-link" href="/">Sign In</a>
        </div>
      </div>
    </>
  );
}