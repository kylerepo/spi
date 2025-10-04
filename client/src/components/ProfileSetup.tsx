import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  onComplete: () => void;
}

const INTERESTS = [
  'Wine Tasting', 'Yoga', 'Travel', 'Fine Dining', 'Art', 'Dancing',
  'Hiking', 'Photography', 'Music', 'Fitness', 'Cooking', 'Reading',
  'Movies', 'Theater', 'Sports', 'Gaming', 'Fashion', 'Meditation',
  'Nightlife', 'Beach'
];

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { createProfile, uploadPhoto } = useProfile();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    profile_type: 'single' as 'single' | 'couple',
    name: '',
    age: '',
    bio: '',
    location: '',
    gender: '',
    orientation: '',
    interests: [] as string[],
    photos: [] as string[],
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) {
      toast({
        title: 'Too many photos',
        description: 'You can upload a maximum of 6 photos',
        variant: 'destructive',
      });
      return;
    }
    setPhotoFiles([...photoFiles, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== interest),
      });
    } else {
      if (formData.interests.length >= 10) {
        toast({
          title: 'Maximum interests reached',
          description: 'You can select up to 10 interests',
          variant: 'destructive',
        });
        return;
      }
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload photos first
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const { url, error } = await uploadPhoto(file);
        if (error) throw new Error(error);
        if (url) photoUrls.push(url);
      }

      // Create profile
      const { error } = await createProfile({
        ...formData,
        age: parseInt(formData.age),
        photos: photoUrls,
      });

      if (error) throw new Error(error);

      toast({
        title: 'Profile created!',
        description: 'Welcome to SPICE',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.name && formData.age && parseInt(formData.age) >= 18;
  const canProceedStep2 = formData.bio && formData.location;
  const canProceedStep3 = formData.interests.length >= 3;
  const canSubmit = photoFiles.length >= 2;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPICE
          </h1>
          <p className="text-white/80">Complete your profile</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? 'bg-pink-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-black/70 rounded-2xl border-2 border-pink-500/60 p-8 shadow-lg shadow-pink-500/20">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>
              
              <div>
                <Label className="text-white mb-2">Profile Type</Label>
                <RadioGroup
                  value={formData.profile_type}
                  onValueChange={(value: 'single' | 'couple') =>
                    setFormData({ ...formData, profile_type: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="text-white">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="couple" id="couple" />
                    <Label htmlFor="couple" className="text-white">Couple</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-white">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Must be 18+"
                  min="18"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-white">Gender (Optional)</Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  placeholder="e.g., Male, Female, Non-binary"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">About You</h2>

              <div>
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="orientation" className="text-white">Orientation (Optional)</Label>
                <Input
                  id="orientation"
                  value={formData.orientation}
                  onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                  placeholder="e.g., Straight, Gay, Bisexual"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Interests</h2>
              <p className="text-white/80 text-sm">Select at least 3 interests</p>

              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Add Photos</h2>
              <p className="text-white/80 text-sm">Upload at least 2 photos (max 6)</p>

              <div className="grid grid-cols-3 gap-4">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photoFiles.length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <span className="text-white/60 text-4xl">+</span>
                  </label>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}