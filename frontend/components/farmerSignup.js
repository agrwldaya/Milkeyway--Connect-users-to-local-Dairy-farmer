"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Upload, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import LocationPicker from "./LocationPicker"
    
export default function FarmerSignup({ formData, setFormData, step, setStep, onBack }) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  const [subStep, setSubStep] = useState(step === 2 ? "basic" : "farm") // basic -> otp -> farm -> location -> docs
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState(null)
  const [pincode, setPincode] = useState("")
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  
  useEffect(() => {
    const getAddress = async () => {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await res.json()
      setCountry(data[0].PostOffice[0].Country)
      setState(data[0].PostOffice[0].State)
      setCity(data[0].PostOffice[0].Name)
    }
    getAddress()
  }, [pincode])
  
  
  const [otp, setOtp] = useState("")
  const [coords, setCoords] = useState({ latitude: "", longitude: "" })
  const [uploadedFiles, setUploadedFiles] = useState({
    farmer_proof_doc: null,
    farm_image: null,
    farmer_image: null
  })

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
      const res = await fetch(`${API_BASE}/api/v1/farmers/register`, {
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
    if (!formData.farmName || !formData.address || !formData.location || !formData.deliveryRadius) {
      toast.error("Fill all farm details")
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
      setSubStep("location")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationSelect = async (location) => {
    setCoords({ latitude: location.latitude, longitude: location.longitude })
    
    // Update location in backend
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/farmers/location/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      })
      const data = await res.json()
      if (!res.ok){
        toast.error(data?.message || "Location update failed")
        return
      }
      toast.success("Location selected successfully")
      setSubStep("docs")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileSelect = (fileType, file) => {
    console.log('File selected:', fileType, file)
    if (file) {
      console.log('File name:', file.name)
      console.log('File size:', file.size)
    }
    setFormData({ ...formData, [fileType]: file })
    setUploadedFiles({ ...uploadedFiles, [fileType]: file })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUploadDocs = async () => {
    console.log('FormData before upload:', formData)
    console.log('UploadedFiles:', uploadedFiles)
    
    // Check both formData and uploadedFiles as fallback
    const farmerProofDoc = formData.farmer_proof_doc || uploadedFiles.farmer_proof_doc
    
    if (!farmerProofDoc) {
      toast.error("Farmer proof document is required")
      return
    }
    setIsSubmitting(true)
    try {
      const form = new FormData()
      
      // Add required farmer proof document
      form.append("farmer_proof_doc", farmerProofDoc)
      
      // Add optional documents if provided
      const farmImage = formData.farm_image || uploadedFiles.farm_image
      const farmerImage = formData.farmer_image || uploadedFiles.farmer_image
      
      if (farmImage) {
        form.append("farm_image", farmImage)
      }
      if (farmerImage) {
        form.append("farmer_image", farmerImage)
      }
      
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
        <div className="flex gap-2">
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" type="number" placeholder="Enter your pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" type="text" placeholder="Enter your city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        </div>
        <div className="flex gap-2">
        <div className="space-y-2">
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Location Selection</span>
          </div>
          <p className="text-sm text-blue-700">
            After filling the farm details, you'll be asked to select your farm location using either GPS or an interactive map.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setSubStep("otp")} className="flex-1">Back</Button>
          <Button onClick={handleCompleteFarmProfile} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save & Continue"}</Button>
        </div>
      </div>
    )
  }

  if (subStep === "location") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Select Farm Location</h3>
          <p className="text-sm text-muted-foreground">
            Choose your farm location using GPS or an interactive map
          </p>
        </div>
        
        <LocationPicker 
          onLocationSelect={handleLocationSelect}
          initialLocation={coords.latitude && coords.longitude ? coords : null}
        />
        
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setSubStep("farm")} 
            className="flex-1"
          >
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="farmer_proof_doc">Farmer Proof Document *</Label>
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#80e619] transition-colors cursor-pointer"
            onClick={() => document.getElementById('farmer_proof_doc').click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload ID proof, license, or certification</p>
            <Input 
              id="farmer_proof_doc" 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                console.log('File input changed:', e.target.files)
                handleFileSelect("farmer_proof_doc", e.target.files?.[0] || null)
              }} 
            />
          </div>
          {uploadedFiles.farmer_proof_doc && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Selected: {uploadedFiles.farmer_proof_doc.name}</span>
                  <p className="text-xs text-green-600">Size: {formatFileSize(uploadedFiles.farmer_proof_doc.size)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="farm_image">Farm Image (Optional)</Label>
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#80e619] transition-colors cursor-pointer"
            onClick={() => document.getElementById('farm_image').click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload farm photo</p>
            <Input 
              id="farm_image" 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                console.log('Farm image input changed:', e.target.files)
                handleFileSelect("farm_image", e.target.files?.[0] || null)
              }} 
            />
          </div>
          {uploadedFiles.farm_image && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Selected: {uploadedFiles.farm_image.name}</span>
                  <p className="text-xs text-green-600">Size: {formatFileSize(uploadedFiles.farm_image.size)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="farmer_image">Farmer Photo (Optional)</Label>
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#80e619] transition-colors cursor-pointer"
            onClick={() => document.getElementById('farmer_image').click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload your photo</p>
            <Input 
              id="farmer_image" 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                console.log('Farmer image input changed:', e.target.files)
                handleFileSelect("farmer_image", e.target.files?.[0] || null)
              }} 
            />
          </div>
          {uploadedFiles.farmer_image && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Selected: {uploadedFiles.farmer_image.name}</span>
                  <p className="text-xs text-green-600">Size: {formatFileSize(uploadedFiles.farmer_image.size)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setSubStep("location")} className="flex-1">Back</Button>
        <Button onClick={handleUploadDocs} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90" disabled={isSubmitting}>{isSubmitting ? "Uploading..." : "Finish"}</Button>
      </div>
    </div>
  )
}
