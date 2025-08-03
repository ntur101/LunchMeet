import React, { useState } from "react"
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { Input } from "/components/ui/input"
import { Button } from "/components/ui/button"
import { Checkbox } from "/components/ui/checkbox"
import { Label } from "/components/ui/label"
import { Link } from "react-router-dom"

function SignUp() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Clear error and proceed
        setError("");
        navigate("/"); // redirect to homepage or dashboard
    };

    const { setUsername } = useUser();
    const handleInputChange = (e) => {
        setUsername(e.target.value);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
            {/* Logo */}
            <img
                src="/src/assets/logo.png"
                alt="Description"
                className="w-48 h-48 rounded-full object-cover"
        />

        {/* Sign Up Title Text */}
        <h1 className="w-full text-center text-3xl mb-10">
            Sign Up
        </h1>

        {/* Form Fields */}
        <div className="w-full max-w-sm space-y-6">

            {/* Username Input */}
            <div>
                <Label htmlFor="username" className="text-base">Username</Label>
                <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter your username" 
                    className="text-sm"
                    onChange={handleInputChange}
                />
            </div>

            {/* Email Input */}
            <div>
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" className="text-sm"/>
            </div>

            {/* Password Input */}
            <div>
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Confirm Password Input */}
            <div>
                <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            {/* Show Password Checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="showPassword"
                    checked={showPassword}
                    onCheckedChange={(checked) => setShowPassword(!!checked)}
                />
                <Label htmlFor="showPassword">Show password</Label>
            </div>

            {/* Confirm Button */}
            <Button
                className="w-full bg-[#C5BAFF] text-black hover:text-white"
                onClick={handleSignUp}
            >
                Sign Up
            </Button>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>

    </div>
    
  )
}
export default SignUp;