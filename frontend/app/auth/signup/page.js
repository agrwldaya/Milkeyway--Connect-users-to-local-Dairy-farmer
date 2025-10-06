"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Milk, ArrowLeft, User, Store, MapPin, Upload } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")

  const [step, setStep] = useState(1)
  const [role, setRole] = useState(roleParam === "farmer" ? "farmer" : "consumer")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    address: "",
    location: "",
    deliveryRadius: "",
    documents: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && role === "farmer") {
      setStep(3)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      if (role === "farmer") {
        router.push("/farmer/dashboard")
      } else {
        router.push("/consumer/dashboard")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col font-sans lg:flex-row">
    
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-sans">Create Account</CardTitle>
              <CardDescription>
                Step {step} of {role === "farmer" ? "3" : "2"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>I want to join as</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value)}>
                      <div
                        className="flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setRole("consumer")}
                      >
                        <RadioGroupItem value="consumer" id="consumer" />
                        <Label htmlFor="consumer" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Consumer</p>
                            <p className="text-sm text-muted-foreground">Buy fresh dairy products</p>
                          </div>
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setRole("farmer")}
                      >
                        <RadioGroupItem value="farmer" id="farmer" />
                        <Label htmlFor="farmer" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold">Farmer</p>
                            <p className="text-sm text-muted-foreground">Sell your dairy products</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button onClick={handleNext} className="w-full bg-[#80e619] hover:bg-[#80e619]/90">
                    Continue
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                      Login
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90">
                      {role === "farmer" ? "Continue" : "Create Account"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Farmer Details */}
              {step === 3 && role === "farmer" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      placeholder="Green Valley Farm"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Farm Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete farm address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (City/District)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Mumbai, Maharashtra"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      placeholder="10"
                      value={formData.deliveryRadius}
                      onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Upload Documents (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#80e619] transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload farm license or certification</p>
                      <Input
                        id="documents"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFormData({ ...formData, documents: e.target.files?.[0] || null })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
