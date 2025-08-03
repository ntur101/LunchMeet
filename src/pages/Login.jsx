import React, { useState } from "react"
import { Input } from "/components/ui/input"
import { Button } from "/components/ui/button"
import { Checkbox } from "/components/ui/checkbox"
import { Label } from "/components/ui/label"
import { Link } from "react-router-dom"

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      {/* Logo */}
      <img
        src="/src/assets/logo.png"
        alt="Description"
        className="w-48 h-48 rounded-full object-cover"
      />

      {/* Login Title Text */}
      <h1 className="w-full text-center text-3xl mb-10">
        Login
      </h1>

      {/* Form Fields */}
      <div className="w-full max-w-sm space-y-6">

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
        <Link to="/">
          <Button className="w-full bg-[#C5BAFF] text-black hover:text-white">Sign In</Button>
        </Link>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full my-6">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm">or</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      {/* Sign Up Button */}
      <div className="w-full max-w-sm my-6">
        <Link to="/signup">
          <Button className="w-full bg-[#C5BAFF] text-black hover:text-white">Sign Up</Button>
        </Link>
      </div>

    </div>
    
  )
}
export default Login;