"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, User, Camera, Heart, Shield, Info, MapPin, Settings, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Enhanced profile setup schema
const profileSetupSchema = z.object({
  // Step 1: Account Type
  accountType: z.enum(["single", "couple"]),
  profileType: z.enum(["single_profile", "couple_profile"]),

  // Step 2: Basic Info
  displayName: z.string().min(1, "Display name is required"),
  gender: z.enum(["male", "female", "non_binary", "transgender", "other"]),
  genderOther: z.string().optional(),
  sexuality: z.enum(["straight", "gay", "lesbian", "bisexual", "pansexual", "asexual", "other"]),
  sexualityOther: z.string().optional(),
  age: z.number().min(18, "Must be 18 or older").max(100),
  relationshipStatus: z.enum(["single", "in_relationship", "married", "separated", "divorced", "other"]),
  relationshipStatusOther: z.string().optional(),

  // Step 3: Introduction
  headline: z.string().min(10, "Headline must be at least 10 characters").max(100),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000),

  // Step 4: Location
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),

  // Step 5: Partner Info (conditional)
  partner1Name: z.string().optional(),
  partner1Gender: z.enum(["male", "female", "non_binary", "transgender", "other"]).optional(),
  partner1GenderOther: z.string().optional(),
  partner1Sexuality: z.enum(["straight", "gay", "lesbian", "bisexual", "pansexual", "asexual", "other"]).optional(),
  partner1SexualityOther: z.string().optional(),
  partner1Bio: z.string().optional(),

  partner2Name: z.string().optional(),
  partner2Gender: z.enum(["male", "female", "non_binary", "transgender", "other"]).optional(),
  partner2GenderOther: z.string().optional(),
  partner2Sexuality: z.enum(["straight", "gay", "lesbian", "bisexual", "pansexual", "asexual", "other"]).optional(),
  partner2SexualityOther: z.string().optional(),
  partner2Bio: z.string().optional(),

  // Step 6: Dating Preferences
  seekingGenders: z.array(z.string()).min(1, "Select at least one preference"),
  seekingAccountTypes: z.array(z.string()).min(1, "Select at least one account type"),
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),

  // Step 7: Interests & Kinks
  interests: z.array(z.string()).default([]),
  customInterests: z.string().optional(),

  // Step 8: Preferences & Activities
  preferences: z.array(z.string()).default([]),
  customPreferences: z.string().optional(),

  // Step 9: Boundaries
  boundaries: z.array(z.string()).default([]),
  customBoundaries: z.string().optional(),

  // Step 10: Safe Sex Practices
  safeSexPractices: z.array(z.string()).default([]),
  customSafeSexPractices: z.string().optional(),
})

type ProfileSetupData = z.infer<typeof profileSetupSchema>

const STEPS = [
  { id: 1, title: "Account Type", icon: Users },
  { id: 2, title: "Basic Info", icon: User },
  { id: 3, title: "Introduction", icon: Info },
  { id: 4, title: "Location", icon: MapPin },
  { id: 5, title: "Partner Info", icon: Users },
  { id: 6, title: "Preferences", icon: Heart },
  { id: 7, title: "Interests", icon: Settings },
  { id: 8, title: "Activities", icon: Heart },
  { id: 9, title: "Boundaries", icon: Shield },
  { id: 10, title: "Safe Sex", icon: Shield },
  { id: 11, title: "Photos", icon: Camera },
]

const INTEREST_OPTIONS = [
  "BDSM",
  "Role-playing",
  "Swinging",
  "Group sex",
  "Voyeurism",
  "Exhibitionism",
  "Fetishes",
  "Kink exploration",
  "Dom/Sub",
  "Polyamory",
  "Open relationships",
  "Threesomes",
  "Casual encounters",
  "NSA fun",
]

const PREFERENCE_OPTIONS = [
  "Soft swap",
  "Full swap",
  "Same room",
  "Separate rooms",
  "Threesomes",
  "Foursomes",
  "Group parties",
  "Club events",
  "Private meetings",
  "Online play",
  "Video chat",
  "Photo exchange",
]

const BOUNDARY_OPTIONS = [
  "Anal sex",
  "Oral sex",
  "BDSM",
  "Pain play",
  "Humiliation",
  "Public play",
  "Recording/photos",
  "Substance use",
  "Rough play",
  "Age play",
  "Pet play",
  "Water sports",
  "Scat play",
]

const SAFE_SEX_OPTIONS = [
  "Condom use",
  "Dental dam use",
  "Regular STI testing",
  "Recent test results",
  "Vaccination status",
  "Birth control",
  "PrEP usage",
  "Open communication",
  "Safe words",
  "Consent discussions",
]

interface ProfileSetupProps {
  onComplete: () => void
}

export default function ProfileSetupUpdated({ onComplete }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [stepErrors, setStepErrors] = useState<{ [key: number]: string }>({})
  const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string; path?: string; id?: string }[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      accountType: "single",
      profileType: "single_profile",
      displayName: "",
      gender: "male",
      sexuality: "straight",
      age: 25,
      relationshipStatus: "single",
      headline: "",
      bio: "",
      city: "",
      state: "",
      country: "United States",
      seekingGenders: [],
      seekingAccountTypes: [],
      ageRangeMin: 18,
      ageRangeMax: 65,
      interests: [],
      preferences: [],
      boundaries: [],
      safeSexPractices: [],
    },
  })

  const watchAccountType = form.watch("accountType")
  const isCoupleAccount = watchAccountType === "couple"
  const maxSteps = 11
  const progress = (currentStep / maxSteps) * 100

  // Supabase Edge Function calls
  const callEdgeFunction = async (functionName: string, data: any) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error("No valid session found")
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      console.log("No files selected")
      return
    }

    console.log(`Uploading ${files.length} files`)
    setLoading(true)
    setError("")

    try {
      const uploadPromises = Array.from(files)
        .slice(0, 5 - uploadedPhotos.length)
        .map(async (file, index) => {
          console.log(`Uploading file ${index + 1}:`, file.name, file.size)

          // Create form data for edge function
          const formData = new FormData()
          formData.append("photo", file)
          formData.append("is_profile", (uploadedPhotos.length === 0 && index === 0).toString())
          formData.append("order", (uploadedPhotos.length + index).toString())

          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.access_token) {
            throw new Error("No valid session found")
          }

          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-profile-photo`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Upload failed")
          }

          const result = await response.json()
          console.log(`File ${index + 1} uploaded successfully:`, result.photo.url)
          return { 
            url: result.photo.url, 
            path: result.photo.storage_path, 
            id: result.photo.id 
          }
        })

      const newPhotos = await Promise.all(uploadPromises)
      console.log("All photos uploaded:", newPhotos)

      // Update state immediately to show the photos
      const updatedPhotos = [...uploadedPhotos, ...newPhotos].slice(0, 5)
      setUploadedPhotos(updatedPhotos)
      console.log("Updated photo state:", updatedPhotos)

      toast({
        title: "Photos uploaded!",
        description: `${newPhotos.length} photo(s) uploaded successfully.`,
      })
    } catch (error) {
      console.error("Photo upload error:", error)
      let errorMessage = "Failed to upload photos. Please try again."

      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes("size")) {
        errorMessage = "File too large. Please choose images under 10MB."
      } else if (errorMsg.includes("image")) {
        errorMessage = "Please select valid image files (JPG, PNG, WebP)."
      } else if (errorMsg.includes("logged in")) {
        errorMessage = "Please sign in to upload photos."
      } else if (errorMsg) {
        errorMessage = errorMsg
      }

      setError(`Photo upload failed: ${errorMessage}`)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      // Reset file input
      if (e.target) e.target.value = ""
    }
  }

  const removePhoto = async (index: number) => {
    const photo = uploadedPhotos[index]
    if (photo.id) {
      try {
        // Delete from database using Supabase client
        const { error } = await supabase
          .from('profile_photos')
          .delete()
          .eq('id', photo.id)

        if (error) throw error
      } catch (error) {
        console.error("Error deleting photo from database:", error)
      }
    }
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Validate current step before proceeding
  const validateCurrentStep = (): boolean => {
    const data = form.getValues()
    let isValid = true
    let errorMessage = ""

    switch (currentStep) {
      case 1:
        if (!data.accountType) {
          errorMessage = "Please select an account type"
          isValid = false
        }
        break
      case 2:
        if (!data.displayName || !data.gender || !data.sexuality || !data.age || !data.relationshipStatus) {
          errorMessage = "Please fill in all required fields"
          isValid = false
        }
        if (data.age < 18) {
          errorMessage = "You must be 18 or older"
          isValid = false
        }
        break
      case 3:
        if (!data.headline || data.headline.length < 10) {
          errorMessage = "Headline must be at least 10 characters"
          isValid = false
        }
        if (!data.bio || data.bio.length < 50) {
          errorMessage = "Bio must be at least 50 characters"
          isValid = false
        }
        break
      case 4:
        if (!data.city || !data.state || !data.country) {
          errorMessage = "Please fill in all location fields"
          isValid = false
        }
        break
      case 5:
        if (isCoupleAccount) {
          if (!data.partner1Name || !data.partner1Gender || !data.partner1Sexuality || !data.partner1Bio) {
            errorMessage = "Please fill in all partner 1 information"
            isValid = false
          }
          if (!data.partner2Name || !data.partner2Gender || !data.partner2Sexuality || !data.partner2Bio) {
            errorMessage = "Please fill in all partner 2 information"
            isValid = false
          }
        }
        break
      case 6:
        if (!data.seekingGenders?.length || !data.seekingAccountTypes?.length) {
          errorMessage = "Please select your dating preferences"
          isValid = false
        }
        if (!data.ageRangeMin || !data.ageRangeMax || data.ageRangeMin > data.ageRangeMax) {
          errorMessage = "Please set a valid age range"
          isValid = false
        }
        break
    }

    if (!isValid) {
      setStepErrors({ ...stepErrors, [currentStep]: errorMessage })
      setError(errorMessage)
    } else {
      const newStepErrors = { ...stepErrors }
      delete newStepErrors[currentStep]
      setStepErrors(newStepErrors)
      setError("")
    }

    return isValid
  }

  const saveCurrentStepData = async () => {
    const data = form.getValues()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Save different data based on current step
    if (currentStep >= 2 && currentStep <= 4) {
      // Steps 2-4: Basic profile data
      await callEdgeFunction("create-profile", {
        display_name: data.displayName,
        bio: data.bio,
        account_type: data.accountType,
        profile_type: data.profileType,
        gender: data.gender,
        gender_other: data.genderOther,
        sexuality: data.sexuality,
        sexuality_other: data.sexualityOther,
        age: data.age,
        city: data.city,
        state: data.state,
        country: data.country,
        relationship_status: data.relationshipStatus,
        relationship_status_other: data.relationshipStatusOther,
        headline: data.headline,
      })
    }

    if (currentStep === 5 && isCoupleAccount) {
      // Step 5: Couple profile data
      await callEdgeFunction("create-couple-profile", {
        partner1_name: data.partner1Name,
        partner1_gender: data.partner1Gender,
        partner1_gender_other: data.partner1GenderOther,
        partner1_sexuality: data.partner1Sexuality,
        partner1_sexuality_other: data.partner1SexualityOther,
        partner1_bio: data.partner1Bio,
        partner2_name: data.partner2Name,
        partner2_gender: data.partner2Gender,
        partner2_gender_other: data.partner2GenderOther,
        partner2_sexuality: data.partner2Sexuality,
        partner2_sexuality_other: data.partner2SexualityOther,
        partner2_bio: data.partner2Bio,
      })
    }

    if (currentStep === 6) {
      // Step 6: Preferences
      await callEdgeFunction("save-profile-preferences", {
        seeking_genders: data.seekingGenders,
        seeking_account_types: data.seekingAccountTypes,
        age_range_min: data.ageRangeMin,
        age_range_max: data.ageRangeMax,
      })
    }

    if (currentStep === 7) {
      // Step 7: Interests
      if (data.interests?.length) {
        await callEdgeFunction("save-profile-interests", {
          interests: data.interests,
          custom_interests: data.customInterests,
        })
      }
    }

    if (currentStep === 9) {
      // Step 9: Boundaries
      if (data.boundaries?.length) {
        await callEdgeFunction("save-profile-boundaries", {
          boundaries: data.boundaries,
          custom_boundaries: data.customBoundaries,
        })
      }
    }

    if (currentStep === 10) {
      // Step 10: Safe sex practices
      if (data.safeSexPractices?.length) {
        await callEdgeFunction("save-profile-safe-sex", {
          practices: data.safeSexPractices,
          custom_practices: data.customSafeSexPractices,
        })
      }
    }
  }

  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return
    }

    // Save current step data before moving to next step
    try {
      setLoading(true)
      await saveCurrentStepData()

      if (currentStep === 4 && !isCoupleAccount) {
        setCurrentStep(6) // Skip partner info for singles
      } else if (currentStep < maxSteps) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error: any) {
      console.error("Error saving step data:", error)
      setError(`Failed to save: ${error.message}`)
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 6 && !isCoupleAccount) {
        setCurrentStep(currentStep - 2) // Skip partner info for singles when going back
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  // Handle profile completion when "Complete Profile" button is clicked
  const handleCompleteProfile = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Starting profile completion...")

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      await saveCurrentStepData()

      console.log("Marking profile as complete...")

      // Mark profile as complete using edge function
      await callEdgeFunction("complete-profile", {})

      console.log("Profile completion successful")

      setSuccess("Profile created successfully! Welcome to SPICE!")
      setShowSuccessDialog(true)

      // Show success toast
      toast({
        title: "Profile Complete! 🎉",
        description: "Welcome to SPICE! Your profile has been created successfully.",
        duration: 5000,
      })

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false)
        onComplete()
      }, 3000)
    } catch (error: any) {
      console.error("Profile completion error:", error)
      setError(error.message || "Failed to complete profile")
      toast({
        title: "Profile Completion Failed",
        description: error.message || "Failed to complete profile. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileSetupData) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Submitting profile data:", data)

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Submit profile data using edge functions
      await callEdgeFunction("create-profile", {
        display_name: data.displayName,
        bio: data.bio,
        account_type: data.accountType,
        profile_type: data.profileType,
        gender: data.gender,
        gender_other: data.genderOther,
        sexuality: data.sexuality,
        sexuality_other: data.sexualityOther,
        age: data.age,
        city: data.city,
        state: data.state,
        country: data.country,
        relationship_status: data.relationshipStatus,
        relationship_status_other: data.relationshipStatusOther,
        headline: data.headline,
      })

      // If couple account, save couple profile data
      if (data.accountType === "couple") {
        await callEdgeFunction("create-couple-profile", {
          partner1_name: data.partner1Name,
          partner1_gender: data.partner1Gender,
          partner1_gender_other: data.partner1GenderOther,
          partner1_sexuality: data.partner1Sexuality,
          partner1_sexuality_other: data.partner1SexualityOther,
          partner1_bio: data.partner1Bio,
          partner2_name: data.partner2Name,
          partner2_gender: data.partner2Gender,
          partner2_gender_other: data.partner2GenderOther,
          partner2_sexuality: data.partner2Sexuality,
          partner2_sexuality_other: data.partner2SexualityOther,
          partner2_bio: data.partner2Bio,
        })
      }

      // Save preferences
      if (data.seekingGenders?.length || data.seekingAccountTypes?.length) {
        await callEdgeFunction("save-profile-preferences", {
          seeking_genders: data.seekingGenders,
          seeking_account_types: data.seekingAccountTypes,
          age_range_min: data.ageRangeMin,
          age_range_max: data.ageRangeMax,
        })
      }

      // Save interests
      if (data.interests?.length) {
        await callEdgeFunction("save-profile-interests", {
          interests: data.interests,
          custom_interests: data.customInterests,
        })
      }

      // Save boundaries
      if (data.boundaries?.length) {
        await callEdgeFunction("save-profile-boundaries", {
          boundaries: data.boundaries,
          custom_boundaries: data.customBoundaries,
        })
      }

      // Save safe sex practices
      if (data.safeSexPractices?.length) {
        await callEdgeFunction("save-profile-safe-sex", {
          practices: data.safeSexPractices,
          custom_practices: data.customSafeSexPractices,
        })
      }

      setSuccess("Profile saved! Complete your profile to start connecting.")
      setShowSuccessDialog(false)

      // Show success toast
      toast({
        title: "Profile Saved!",
        description: "Your profile has been saved. Click 'Complete Profile' to start connecting!",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Profile setup error:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
      })

      let errorMessage = "Failed to save profile. Please try again."

      if (error?.message?.includes("authentication") || error?.message?.includes("password authentication failed")) {
        errorMessage =
          "Database connection failed. The server is experiencing issues. Please try again in a few minutes."
      } else if (error?.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error?.message?.includes("validation")) {
        errorMessage = "Please check all required fields are filled correctly."
      } else if (error?.message) {
        errorMessage = error.message
      }

      setError(errorMessage)

      // Show a more user-friendly toast message
      toast({
        title: "Profile Creation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const renderCheckboxGroup = (
    options: string[],
    selectedValues: string[],
    onValueChange: (values: string[]) => void,
    customValue?: string,
    onCustomChange?: (value: string) => void,
    customLabel = "Other (please specify)",
  ) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onValueChange([...selectedValues, option])
                } else {
                  onValueChange(selectedValues.filter((v) => v !== option))
                }
              }}
              className="border-pink-500/50"
              data-testid={`checkbox-${option.toLowerCase().replace(/\s+/g, "-")}`}
            />
            <Label htmlFor={option} className="text-sm text-white">
              {option}
            </Label>
          </div>
        ))}
      </div>
      {onCustomChange && (
        <div className="space-y-2">
          <Label className="text-sm text-white">{customLabel}</Label>
          <Textarea
            placeholder="Specify any other items not listed above..."
            value={customValue || ""}
            onChange={(e) => onCustomChange(e.target.value)}
            rows={2}
            className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
          />
        </div>
      )}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Choose Your Account Type</h2>
              <p className="text-white/80">This determines how your profile will be displayed</p>
            </div>

            <div className="space-y-4">
              <Label className="text-white">Account Type</Label>
              <RadioGroup
                value={form.watch("accountType")}
                onValueChange={(value) => {
                  form.setValue("accountType", value as "single" | "couple")
                  form.setValue("profileType", value === "couple" ? "couple_profile" : "single_profile")
                }}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border border-pink-500/50 rounded-lg hover:border-pink-500 bg-black/30">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-pink-400" />
                      <div>
                        <div className="font-medium text-white">Single</div>
                        <div className="text-sm text-white/70">Individual profile</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-pink-500/50 rounded-lg hover:border-pink-500 bg-black/30">
                  <RadioGroupItem value="couple" id="couple" />
                  <Label htmlFor="couple" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-pink-400" />
                      <div>
                        <div className="font-medium text-white">Couple</div>
                        <div className="text-sm text-white/70">Joint profile for couples</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Basic Information</h2>
              <p className="text-white/80">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  placeholder="How you'd like to be known on your profile"
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("displayName")}
                />
                {form.formState.errors.displayName && (
                  <p className="text-sm text-red-400">{form.formState.errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Confirm your age"
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("age", { valueAsNumber: true })}
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-red-400">{form.formState.errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Gender *</Label>
                <Select onValueChange={(value) => form.setValue("gender", value as any)}>
                  <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non_binary">Non-binary</SelectItem>
                    <SelectItem value="transgender">Transgender</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch("gender") === "other" && (
                  <Input
                    placeholder="Please specify"
                    className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                    {...form.register("genderOther")}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sexuality *</Label>
                <Select onValueChange={(value) => form.setValue("sexuality", value as any)}>
                  <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                    <SelectValue placeholder="Select your sexuality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="gay">Gay</SelectItem>
                    <SelectItem value="lesbian">Lesbian</SelectItem>
                    <SelectItem value="bisexual">Bisexual</SelectItem>
                    <SelectItem value="pansexual">Pansexual</SelectItem>
                    <SelectItem value="asexual">Asexual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch("sexuality") === "other" && (
                  <Input
                    placeholder="Please specify"
                    className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                    {...form.register("sexualityOther")}
                  />
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Relationship Status *</Label>
                <Select onValueChange={(value) => form.setValue("relationshipStatus", value as any)}>
                  <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                    <SelectValue placeholder="Select your relationship status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="in_relationship">In a relationship</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch("relationshipStatus") === "other" && (
                  <Input
                    placeholder="Please specify"
                    className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                    {...form.register("relationshipStatusOther")}
                  />
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Introduce Yourself</h2>
              <p className="text-white/80">Create an engaging profile that represents you</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline" className="text-white">
                  Headline *
                </Label>
                <Input
                  id="headline"
                  placeholder="A catchy headline that describes your interests"
                  maxLength={100}
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("headline")}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {form.watch("headline")?.length || 0}/100
                </div>
                {form.formState.errors.headline && (
                  <p className="text-sm text-red-400">{form.formState.errors.headline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">
                  Bio *
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your personality, interests, and what you're looking for in potential partners. Be authentic and engaging!"
                  maxLength={1000}
                  rows={6}
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("bio")}
                />
                <div className="text-xs text-muted-foreground text-right">{form.watch("bio")?.length || 0}/1000</div>
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-400">{form.formState.errors.bio.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Location</h2>
              <p className="text-white/80">Help others find you in their area</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white">
                  City *
                </Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-400">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white">
                  State/Province *
                </Label>
                <Input
                  id="state"
                  placeholder="Your state or province"
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("state")}
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-red-400">{form.formState.errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country" className="text-white">
                  Country *
                </Label>
                <Input
                  id="country"
                  placeholder="Your country"
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("country")}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-400">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        if (!isCoupleAccount) return null
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Partner Information</h2>
              <p className="text-white/80">Tell us about both partners in your relationship</p>
            </div>

            <div className="space-y-8">
              {/* Partner 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Partner 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Partner 1 name"
                    className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                    {...form.register("partner1Name")}
                  />
                  <Select onValueChange={(value) => form.setValue("partner1Gender", value as any)}>
                    <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                      <SelectValue placeholder="Partner 1 gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-binary</SelectItem>
                      <SelectItem value="transgender">Transgender</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select onValueChange={(value) => form.setValue("partner1Sexuality", value as any)}>
                  <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                    <SelectValue placeholder="Partner 1 sexuality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="gay">Gay</SelectItem>
                    <SelectItem value="lesbian">Lesbian</SelectItem>
                    <SelectItem value="bisexual">Bisexual</SelectItem>
                    <SelectItem value="pansexual">Pansexual</SelectItem>
                    <SelectItem value="asexual">Asexual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Partner 1 bio"
                  rows={3}
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("partner1Bio")}
                />
              </div>

              {/* Partner 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Partner 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Partner 2 name"
                    className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                    {...form.register("partner2Name")}
                  />
                  <Select onValueChange={(value) => form.setValue("partner2Gender", value as any)}>
                    <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                      <SelectValue placeholder="Partner 2 gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-binary</SelectItem>
                      <SelectItem value="transgender">Transgender</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select onValueChange={(value) => form.setValue("partner2Sexuality", value as any)}>
                  <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-500">
                    <SelectValue placeholder="Partner 2 sexuality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="gay">Gay</SelectItem>
                    <SelectItem value="lesbian">Lesbian</SelectItem>
                    <SelectItem value="bisexual">Bisexual</SelectItem>
                    <SelectItem value="pansexual">Pansexual</SelectItem>
                    <SelectItem value="asexual">Asexual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Partner 2 bio"
                  rows={3}
                  className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  {...form.register("partner2Bio")}
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Dating Preferences</h2>
              <p className="text-white/80">What are you looking for?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-white">Seeking (Gender) *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Male", "Female", "Non-binary", "Transgender", "Any"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox
                        id={`seeking-${gender.toLowerCase()}`}
                        onCheckedChange={(checked) => {
                          const current = form.watch("seekingGenders") || []
                          if (checked) {
                            form.setValue("seekingGenders", [...current, gender.toLowerCase()])
                          } else {
                            form.setValue(
                              "seekingGenders",
                              current.filter((g) => g !== gender.toLowerCase()),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={`seeking-${gender.toLowerCase()}`} className="text-white">
                        {gender}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Seeking (Account Type) *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Single male",
                    "Single female",
                    "Couple (male/female)",
                    "Couple (male/male)",
                    "Couple (female/female)",
                    "Group",
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`seeking-type-${type.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        onCheckedChange={(checked) => {
                          const current = form.watch("seekingAccountTypes") || []
                          if (checked) {
                            form.setValue("seekingAccountTypes", [...current, type.toLowerCase()])
                          } else {
                            form.setValue(
                              "seekingAccountTypes",
                              current.filter((t) => t !== type.toLowerCase()),
                            )
                          }
                        }}
                      />
                      <Label
                        htmlFor={`seeking-type-${type.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        className="text-white"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Age Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageRangeMin" className="text-sm text-white">
                      Min Age
                    </Label>
                    <Input
                      id="ageRangeMin"
                      type="number"
                      min="18"
                      max="100"
                      className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                      {...form.register("ageRangeMin", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ageRangeMax" className="text-sm text-white">
                      Max Age
                    </Label>
                    <Input
                      id="ageRangeMax"
                      type="number"
                      min="18"
                      max="100"
                      className="bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                      {...form.register("ageRangeMax", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Interests & Kinks</h2>
              <p className="text-white/80">What interests you? Select all that apply</p>
            </div>

            {renderCheckboxGroup(
              INTEREST_OPTIONS,
              form.watch("interests") || [],
              (values) => form.setValue("interests", values),
              form.watch("customInterests"),
              (value) => form.setValue("customInterests", value),
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Preferred Activities</h2>
              <p className="text-white/80">What activities are you interested in?</p>
            </div>

            {renderCheckboxGroup(
              PREFERENCE_OPTIONS,
              form.watch("preferences") || [],
              (values) => form.setValue("preferences", values),
              form.watch("customPreferences"),
              (value) => form.setValue("customPreferences", value),
            )}
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Boundaries & Limits</h2>
              <p className="text-white/80">What activities are you not interested in or uncomfortable with?</p>
            </div>

            {renderCheckboxGroup(
              BOUNDARY_OPTIONS,
              form.watch("boundaries") || [],
              (values) => form.setValue("boundaries", values),
              form.watch("customBoundaries"),
              (value) => form.setValue("customBoundaries", value),
            )}
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Safe Sex Practices</h2>
              <p className="text-white/80">What safety practices are important to you?</p>
            </div>

            {renderCheckboxGroup(
              SAFE_SEX_OPTIONS,
              form.watch("safeSexPractices") || [],
              (values) => form.setValue("safeSexPractices", values),
              form.watch("customSafeSexPractices"),
              (value) => form.setValue("customSafeSexPractices", value),
            )}
          </div>
        )

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Profile Photos</h2>
              <p className="text-white/80">Add photos to make your profile stand out</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-pink-500/25 rounded-lg p-8 text-center bg-black/30">
                <Camera className="mx-auto h-12 w-12 text-pink-400 mb-4" />
                <p className="text-white/80 mb-4">Upload your profile photos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={loading}
                />
                <Button
                  variant="outline"
                  className="bg-black/50 border-pink-500/50 text-white hover:border-pink-500 disabled:opacity-50"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                  disabled={loading || uploadedPhotos.length >= 5}
                  data-testid="button-choose-photos"
                >
                  {loading ? "Uploading..." : "Choose Photos"}
                </Button>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={`${photo.url}-${index}`} className="relative">
                      <div className="w-full h-32 bg-black/50 rounded-lg overflow-hidden border border-pink-500/30">
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt={`Uploaded photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`Photo ${index + 1} loaded:`, photo.url)}
                          onError={(e) => {
                            console.error(`Photo ${index + 1} failed to load:`, photo.url)
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik04MCA2NEMxMTAuOTI4IDY0IDEzNiA4OS4wNzIxIDEzNiAxMjBIMjRDMjQgODkuMDcyMSA0OS4wNzIxIDY0IDgwIDY0WiIgZmlsbD0iIzM3Mzc0MSIvPgo8Y2lyY2xlIGN4PSI3MCIgY3k9IjQ0IiByPSIxNiIgZmlsbD0iIzM3Mzc0MSIvPgo8cGF0aCBkPSJNNTYgMTA0TDE0NCAxNiIgc3Ryb2tlPSIjRkY2QkI0IiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2Zz4K"
                          }}
                          crossOrigin="anonymous"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                        title="Remove photo"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded shadow">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-white/60 text-center">
                You can upload up to 5 photos. First photo will be your main profile picture.
              </p>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 text-center">
                <p className="text-sm text-pink-300 font-medium">✨ Photos are completely optional!</p>
                <p className="text-xs text-white/70 mt-1">
                  You can skip this step and add photos later from your profile settings. Click "Complete Profile" below
                  to finish setup.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/attached_assets/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png)",
          filter: "blur(2px)",
        }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl mx-auto p-8 bg-black/70 rounded-2xl border-2 border-pink-500/60 shadow-lg shadow-pink-500/20 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 20px rgba(255, 20, 147, 0.5)",
              }}
            >
              SPICE
            </h1>
            <div
              className="w-16 h-1 mx-auto rounded-full mb-4"
              style={{
                background: "linear-gradient(90deg, #ff1493, #ff69b4)",
                boxShadow: "0 0 10px rgba(255, 20, 147, 0.8)",
              }}
            />

            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {STEPS.filter((_, index) => isCoupleAccount || index !== 4).map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = step.id === currentStep
                  const isCompleted = step.id < currentStep

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0 ${
                        isActive
                          ? "bg-pink-500 text-white"
                          : isCompleted
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-white/20 text-white/60"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Profile Setup Progress</span>
                <span className="text-sm text-white/70">
                  Step {currentStep} of {maxSteps}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
              <DialogContent className="bg-black/90 border-pink-500/50">
                <DialogHeader>
                  <DialogTitle className="text-center text-white text-2xl">🎉 Profile Complete!</DialogTitle>
                  <DialogDescription className="text-center text-white/80 text-lg pt-4">
                    Welcome to SPICE! Your premium lifestyle profile has been created successfully.
                    <br />
                    <br />
                    You can now start connecting with other verified members in your area.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => {
                      setShowSuccessDialog(false)
                      onComplete()
                    }}
                    className="py-3 px-8 bg-gray-900 text-white font-bold text-lg rounded-full border-3 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow"
                    data-testid="button-continue-to-app"
                  >
                    Continue to App
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                <AlertDescription data-testid="text-error">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/50 border-green-500/50 text-white">
                <AlertDescription data-testid="text-success">{success}</AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons - Only show for steps 1-10, step 11 has its own complete button */}
            {currentStep < maxSteps && (
              <div className="flex justify-between pt-4 gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 py-3 px-6 bg-black/50 border-2 border-pink-500/50 text-white font-medium rounded-full transition-all duration-300 hover:border-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-previous"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-3 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow"
                  data-testid="button-next"
                >
                  Next
                </button>
              </div>
            )}

            {/* Complete Profile Button - Only show on final step */}
            {currentStep === maxSteps && (
              <div className="flex justify-between pt-4 gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 py-3 px-6 bg-black/50 border-2 border-pink-500/50 text-white font-medium rounded-full transition-all duration-300 hover:border-pink-500"
                  data-testid="button-previous"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleCompleteProfile}
                  disabled={loading}
                  className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-3 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-complete-profile"
                  title="Photos are optional - you can complete your profile without them"
                >
                  {loading ? "Completing Profile..." : "Complete Profile"}
                </button>
              </div>
            )}
          </form>

          {/* Custom CSS for animations */}
          <style>{`
            @keyframes glow {
              0%, 100% {
                box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
                border-color: rgba(255, 20, 147, 0.5);
              }
              50% {
                box-shadow: 0 0 16px rgba(255, 20, 147, 1);
                border-color: rgba(255, 20, 147, 1);
              }
            }
            
            .animate-glow {
              animation: glow 2.4s ease-in-out infinite;
            }
          `}</style>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-pink-500/30 text-center">
            <p className="text-xs text-pink-400 mb-2">
              🔞 <strong>Adults Only Platform</strong>
            </p>
            <p className="text-xs text-white/70">
              Premium lifestyle community for 18+ verified members only. Your privacy and discretion are our top
              priorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}