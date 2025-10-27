"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import ConsumerMapPicker from "@/components/ConsumerMapPicker"

export default function ConsumerSignup({ formData, setFormData, onBack }) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  const [subStep, setSubStep] = useState("basic") // basic -> otp -> profile -> location
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState(null)
  const [pincode, setPincode] = useState("")
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [otp, setOtp] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    const getAddress = async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        const data = await res.json()
        setCountry(data[0].PostOffice[0].Country)
        setState(data[0].PostOffice[0].State)
        setCity(data[0].PostOffice[0].Name)
      } catch (err) {
        setCountry("")
        setState("")
        setCity("")
      }
    }
    if (pincode) {
      getAddress()
    }
  }, [pincode])


  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword || !pincode || !country || !state || !city) {
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
          pincode: pincode,
          country: country,
          state: state,
          city: city,
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
    if (!profile.address || !profile.preferred_radius_km) {
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
          latitude: null, // Will be set in location step
          longitude: null, // Will be set in location step
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Profile completion failed")
        return
      }
      toast.success(data.message)
      setSubStep("location")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
  }

  // Complete signup with location
  const handleCompleteSignup = async () => {
    if (!selectedLocation) {
      toast.error("Please select your location")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Update profile with location
      const res = await fetch(`${API_BASE}/api/v1/consumers/location-signup`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          address: profile.address
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Location update failed")
        return
      }
      toast.success("Registration completed successfully!")
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
          <Input id="name" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
        </div>
        <div className="flex  gap-2"> 
        <div className="space-y-2 flex-1">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" type="number" placeholder="Enter your pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" type="text" placeholder="Enter your city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        </div>
        <div className="flex gap-2">
        <div className="space-y-2 flex-1">
          <Label htmlFor="country">Country</Label>
          <Input id="country" type="text" placeholder="Enter your country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" type="text" placeholder="Enter your state" value={state} onChange={(e) => setState(e.target.value)} required />
        </div>
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

  if (subStep === "profile") {
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
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setSubStep("otp")} className="flex-1">Back</Button>
          <Button onClick={handleCompleteProfile} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Next: Set Location"}</Button>
        </div>
      </div>
    )
  }

  if (subStep === "location") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Set Your Location</h3>
          <p className="text-sm text-muted-foreground">Choose your location to find nearby farmers</p>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <ConsumerMapPicker
              onLocationChange={handleLocationSelect}
              initialLocation={null}
              farmers={[]}
              categories={[]}
              loading={false}
            />
          </CardContent>
        </Card>

        {selectedLocation && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Location Selected</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Lat: {Number(selectedLocation.latitude).toFixed(6)}, Lng: {Number(selectedLocation.longitude).toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setSubStep("profile")} className="flex-1">Back</Button>
          <Button 
            onClick={handleCompleteSignup} 
            className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" 
            disabled={isSubmitting || !selectedLocation}
          >
            {isSubmitting ? "Completing..." : "Complete Registration"}
          </Button>
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
