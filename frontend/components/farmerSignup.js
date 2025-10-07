"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Upload } from "lucide-react"
import { toast } from "sonner"
    
export default function FarmerSignup({ formData, setFormData, step, setStep, onBack }) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  const [subStep, setSubStep] = useState(step === 2 ? "basic" : "farm") // basic -> otp -> farm -> docs
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState("")
  const [coords, setCoords] = useState({ latitude: "", longitude: "" })

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
      const res = await fetch(`${API_BASE}/api/v1/farmers/register`, {
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
      setStep(2)
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
      const res = await fetch(`${API_BASE}/api/v1/farmers/verify`, {
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
      setSubStep("farm")
      setStep(3)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteFarmProfile = async () => {
    if (!formData.farmName || !formData.address || !formData.location || !formData.deliveryRadius || !coords.latitude || !coords.longitude) {
      toast.error("Fill all farm details including coordinates")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/farmers/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          farm_name: formData.farmName,
          address: formData.address,
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
          delivery_radius_km: Number(formData.deliveryRadius),
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Profile completion failed")
        return
      }
      toast.success(data.message)
      setSubStep("docs")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadDocs = async () => {
    if (!formData.documents) {
      // optional, allow skip
      router.push("/farmer/dashboard")
      return
    }
    setIsSubmitting(true)
    try {
      const form = new FormData()
      form.append("farmer_doc", formData.documents)
      const res = await fetch(`${API_BASE}/api/v1/farmers/upload-docs/${userId}`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      const data = await res.json()
        if (!res.ok){
        toast.error(data?.message || "Document upload failed")
        return
      }
      toast.success(data.message)
      router.push("/farmer/dashboard")
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
          <Button onClick={handleRegister} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Continue"}</Button>
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

  if (subStep === "farm") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="farmName">Farm Name</Label>
          <Input id="farmName" placeholder="Green Valley Farm" value={formData.farmName} onChange={(e) => setFormData({ ...formData, farmName: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Farm Address</Label>
          <Textarea id="address" placeholder="Enter your complete farm address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (City/District)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="location" placeholder="Mumbai, Maharashtra" className="pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
          <Input id="deliveryRadius" type="number" placeholder="10" value={formData.deliveryRadius} onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" value={coords.latitude} onChange={(e) => setCoords({ ...coords, latitude: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" value={coords.longitude} onChange={(e) => setCoords({ ...coords, longitude: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setSubStep("otp")} className="flex-1">Back</Button>
          <Button onClick={handleCompleteFarmProfile} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save & Continue"}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documents">Upload Documents (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#80e619] transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload farm license or certification</p>
          <Input id="documents" type="file" className="hidden" onChange={(e) => setFormData({ ...formData, documents: e.target.files?.[0] || null })} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setSubStep("farm")} className="flex-1">Back</Button>
        <Button onClick={handleUploadDocs} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Uploading..." : "Finish"}</Button>
      </div>
    </div>
  )
}
