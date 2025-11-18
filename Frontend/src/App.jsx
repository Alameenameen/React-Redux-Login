import React from "react";
import {Routes ,Route} from "react-router-dom";
import SignUp from "./components/signup/Signup"


export default function App(){
    return (
        <Routes>
            {/* signup route for calling frontend */}
            <Route path="/signup" element={<SignUp/>}/>
        </Routes>
    )
}