"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, User, Store } from "lucide-react"
import ConsumerSignup from "@/components/consumerSIgnup"
import FarmerSignup from "@/components/farmerSignup"

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
    <div className="min-h-screen flex flex-col   font-sans lg:flex-row">
    
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

              {/* Step 2 & 3: Role-specific forms */}
              {step === 2 && role === "consumer" && (
                <ConsumerSignup
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(1)}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}

              {(step === 2 || step === 3) && role === "farmer" && (
                <FarmerSignup
                  formData={formData}
                  setFormData={setFormData}
                  step={step}
                  setStep={setStep}
                  onBack={() => setStep(1)}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
