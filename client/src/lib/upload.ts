import { supabase } from "./supabase"

/**
 * Upload profile photo to Supabase storage via backend API
 * @param file - The image file to upload
 * @param isProfile - Whether this is the main profile photo
 * @param order - Photo order/position
 * @returns Object with photo URL and storage path
 */
export async function uploadProfilePhoto(
  file: File,
  isProfile = false,
  order = 0,
): Promise<{ url: string; path: string; id: string }> {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB")
  }

  console.log("[v0] Starting photo upload:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  })

  // Get auth session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    console.error("[v0] Session error:", sessionError)
    throw new Error("You must be logged in to upload photos")
  }

  console.log("[v0] Session valid, preparing upload")

  // Create form data
  const formData = new FormData()
  formData.append("photo", file)
  formData.append("is_profile", isProfile.toString())
  formData.append("order", order.toString())

  // Upload to backend
  try {
    console.log("[v0] Sending upload request to /api/upload/profile-photo")

    const response = await fetch("/api/upload/profile-photo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    })

    console.log("[v0] Upload response status:", response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      console.error("[v0] Upload failed with error:", error)
      throw new Error(error.error || "Failed to upload photo")
    }

    const result = await response.json()
    console.log("[v0] Upload successful:", result)

    if (!result.success || !result.photo) {
      throw new Error("Upload succeeded but no photo data returned")
    }

    if (!result.photo.url || !result.photo.id) {
      console.error("[v0] Invalid photo data returned:", result.photo)
      throw new Error("Upload succeeded but received invalid photo data")
    }

    return {
      url: result.photo.url,
      path: result.photo.storage_path || "",
      id: result.photo.id,
    }
  } catch (error) {
    console.error("[v0] Upload request failed:", error)
    throw error
  }
}

/**
 * Delete profile photo
 * @param photoId - The photo ID to delete
 */
export async function deleteProfilePhoto(photoId: string): Promise<void> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    console.error("[v0] Session error:", sessionError)
    throw new Error("You must be logged in to delete photos")
  }

  const response = await fetch(`/api/profile-photos/${photoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    console.error("[v0] Delete failed with error:", error)
    throw new Error(error.error || "Failed to delete photo")
  }
}

/**
 * Get all profile photos for the current user
 */
export async function getProfilePhotos(): Promise<any[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    console.error("[v0] Session error:", sessionError)
    throw new Error("You must be logged in to view photos")
  }

  const response = await fetch("/api/profile-photos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    console.error("[v0] Fetch failed with error:", error)
    throw new Error(error.error || "Failed to fetch photos")
  }

  return response.json()
}
