"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ConsumerSignup({ formData, setFormData, onBack }) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  const [subStep, setSubStep] = useState("basic") // basic -> otp -> profile
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState("")

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/consumers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Registration failed")
        return
      }
      toast.success(data.message)
      setUserId(data.userId)
      setSubStep("otp")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Enter OTP")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/consumers/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: userId, otp }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "OTP verification failed")
        return
      }
      toast.success(data.message)
      setSubStep("profile")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const [profile, setProfile] = useState({ address: "", preferred_radius_km: "", latitude: "", longitude: "" })

  const handleCompleteProfile = async () => {
    if (!profile.address || !profile.preferred_radius_km || !profile.latitude || !profile.longitude) {
      toast.error("Please fill complete profile details")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/consumers/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: profile.address,
          preferred_radius_km: Number(profile.preferred_radius_km),
          latitude: Number(profile.latitude),
          longitude: Number(profile.longitude),
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Profile completion failed")
        return
      }
      toast.success(data.message)
      router.push("/consumer/dashboard")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (subStep === "basic") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={handleRegister} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create Account"}</Button>
        </div>
      </div>
    )
  }

  if (subStep === "otp") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input id="otp" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setSubStep("basic")} className="flex-1">Back</Button>
          <Button onClick={handleVerifyOtp} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify"}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" placeholder="Enter your address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="radius">Preferred Radius (km)</Label>
        <Input id="radius" type="number" placeholder="10" value={profile.preferred_radius_km} onChange={(e) => setProfile({ ...profile, preferred_radius_km: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="latitude">Latitude</Label>
        <Input id="latitude" type="number" placeholder="19.076" value={profile.latitude} onChange={(e) => setProfile({ ...profile, latitude: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="longitude">Longitude</Label>
        <Input id="longitude" type="number" placeholder="72.8777" value={profile.longitude} onChange={(e) => setProfile({ ...profile, longitude: e.target.value })} />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setSubStep("otp")} className="flex-1">Back</Button>
        <Button onClick={handleCompleteProfile} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Complete Profile"}</Button>
      </div>
    </div>
  )
}
