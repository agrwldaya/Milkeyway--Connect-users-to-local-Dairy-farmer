"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({});
  const [profileForm, setProfileForm] = useState({});
  
  // Password data
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({});
  const [platformForm, setPlatformForm] = useState({});
  
  // Preferences
  const [preferences, setPreferences] = useState({});
  const [preferencesForm, setPreferencesForm] = useState({});
  const [initializing, setInitializing] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch admin profile
  const fetchAdminProfile = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/profile", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch profile");
      
      const data = await response.json();
      setProfile(data.admin);
      setProfileForm(data.admin);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };

  // Fetch platform settings
  const fetchPlatformSettings = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/platform", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch platform settings");
      
      const data = await response.json();
      setPlatformSettings(data.settings);
      setPlatformForm(data.settings);
      setSettingsLoaded(true);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      toast.error("Failed to load platform settings");
      setSettingsLoaded(false);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/preferences", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch preferences");
      
      const data = await response.json();
      setPreferences(data.preferences);
      setPreferencesForm(data.preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load preferences");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAdminProfile(),
        fetchPlatformSettings(),
        fetchPreferences()
      ]);
      setLoading(false);
    };
    
    fetchAllData();
  }, []);

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.admin);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // Update platform settings
  const handleUpdatePlatformSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/platform", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(platformForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update platform settings");
      }

      const data = await response.json();
      setPlatformSettings(data.settings);
      setPlatformForm(data.settings);
      toast.success("Platform settings updated successfully");
    } catch (error) {
      console.error("Error updating platform settings:", error);
      toast.error(error.message || "Failed to update platform settings");
    } finally {
      setSaving(false);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(preferencesForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences);
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  // Initialize platform settings
  const handleInitializeSettings = async () => {
    try {
      setInitializing(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/settings/platform/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize settings");
      }

      toast.success("Platform settings initialized successfully");
      // Refresh the settings
      await fetchPlatformSettings();
    } catch (error) {
      console.error("Error initializing settings:", error);
      toast.error(error.message || "Failed to initialize settings");
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-5">
          <div className="text-center py-8">
            <div className="text-gray-500">Loading settings...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-3 sm:py-4 md:py-6 lg:py-8 px-3 sm:px-4 md:px-5">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Settings
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Manage your profile, platform settings, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Platform</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Admin Profile Image Display */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {profileForm.profile_image_url ? (
                        <img
                          src={profileForm.profile_image_url}
                          alt="Admin Profile"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center ${profileForm.profile_image_url ? 'hidden' : 'flex'}`}
                      >
                        <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {profileForm.name || "Admin User"}
                    </h3>
                    <p className="text-sm text-gray-600">{profileForm.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Role: {profileForm.role || "Admin"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name || ""}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email || ""}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone || ""}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile_image" className="text-sm font-medium">Profile Image URL</Label>
                    <Input
                      id="profile_image"
                      value={profileForm.profile_image_url || ""}
                      onChange={(e) => setProfileForm({...profileForm, profile_image_url: e.target.value})}
                      placeholder="Enter profile image URL"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleUpdateProfile} disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="current_password" className="text-sm font-medium">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="current_password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new_password" className="text-sm font-medium">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirm_password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleChangePassword} disabled={saving} className="w-full sm:w-auto">
                    <Shield className="h-4 w-4 mr-2" />
                    {saving ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  Platform Settings
                </CardTitle>
                <div className="text-xs sm:text-sm text-gray-600 mt-2">
                  Configure platform-wide settings that affect all users. Changes are saved to the database.
                </div>
                {settingsLoaded && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
                    <CheckCircle className="h-3 w-3" />
                    Settings loaded from database
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="platform_name" className="text-sm font-medium">Platform Name</Label>
                    <Input
                      id="platform_name"
                      value={platformForm.platform_name || ""}
                      onChange={(e) => setPlatformForm({...platformForm, platform_name: e.target.value})}
                      placeholder="Enter platform name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email" className="text-sm font-medium">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={platformForm.contact_email || ""}
                      onChange={(e) => setPlatformForm({...platformForm, contact_email: e.target.value})}
                      placeholder="Enter contact email"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="platform_description" className="text-sm font-medium">Platform Description</Label>
                  <Textarea
                    id="platform_description"
                    value={platformForm.platform_description || ""}
                    onChange={(e) => setPlatformForm({...platformForm, platform_description: e.target.value})}
                    placeholder="Enter platform description"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="contact_phone" className="text-sm font-medium">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={platformForm.contact_phone || ""}
                      onChange={(e) => setPlatformForm({...platformForm, contact_phone: e.target.value})}
                      placeholder="Enter contact phone"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="support_email" className="text-sm font-medium">Support Email</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={platformForm.support_email || ""}
                      onChange={(e) => setPlatformForm({...platformForm, support_email: e.target.value})}
                      placeholder="Enter support email"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="max_farmers" className="text-sm font-medium">Max Farmers</Label>
                    <Input
                      id="max_farmers"
                      type="number"
                      value={platformForm.max_farmers || ""}
                      onChange={(e) => setPlatformForm({...platformForm, max_farmers: parseInt(e.target.value)})}
                      placeholder="Enter max farmers"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_consumers" className="text-sm font-medium">Max Consumers</Label>
                    <Input
                      id="max_consumers"
                      type="number"
                      value={platformForm.max_consumers || ""}
                      onChange={(e) => setPlatformForm({...platformForm, max_consumers: parseInt(e.target.value)})}
                      placeholder="Enter max consumers"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="terms_and_conditions" className="text-sm font-medium">Terms & Conditions URL</Label>
                    <Input
                      id="terms_and_conditions"
                      value={platformForm.terms_and_conditions || ""}
                      onChange={(e) => setPlatformForm({...platformForm, terms_and_conditions: e.target.value})}
                      placeholder="Enter terms and conditions URL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="privacy_policy" className="text-sm font-medium">Privacy Policy URL</Label>
                    <Input
                      id="privacy_policy"
                      value={platformForm.privacy_policy || ""}
                      onChange={(e) => setPlatformForm({...platformForm, privacy_policy: e.target.value})}
                      placeholder="Enter privacy policy URL"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="farmer_approval" className="text-sm font-medium">Farmer Approval Required</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Require admin approval for new farmers</p>
                    </div>
                    <Switch
                      id="farmer_approval"
                      checked={platformForm.farmer_approval_required || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, farmer_approval_required: checked})}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="consumer_verification" className="text-sm font-medium">Consumer Verification Required</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Require verification for new consumers</p>
                    </div>
                    <Switch
                      id="consumer_verification"
                      checked={platformForm.consumer_verification_required || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, consumer_verification_required: checked})}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="email_notifications" className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Enable email notifications</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={platformForm.email_notifications_enabled || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, email_notifications_enabled: checked})}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="sms_notifications" className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Enable SMS notifications</p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={platformForm.sms_notifications_enabled || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, sms_notifications_enabled: checked})}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="maintenance_mode" className="text-sm font-medium">Maintenance Mode</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Put platform in maintenance mode</p>
                    </div>
                    <Switch
                      id="maintenance_mode"
                      checked={platformForm.maintenance_mode || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, maintenance_mode: checked})}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Label htmlFor="registration_enabled" className="text-sm font-medium">Registration Enabled</Label>
                      <p className="text-xs sm:text-sm text-gray-500">Allow new user registrations</p>
                    </div>
                    <Switch
                      id="registration_enabled"
                      checked={platformForm.registration_enabled || false}
                      onCheckedChange={(checked) => setPlatformForm({...platformForm, registration_enabled: checked})}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                  <Button 
                    onClick={handleInitializeSettings} 
                    disabled={initializing || saving} 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {initializing ? "Initializing..." : "Initialize Default Settings"}
                  </Button>
                  <Button onClick={handleUpdatePlatformSettings} disabled={saving || initializing} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                    <Select
                      value={preferencesForm.theme || "light"}
                      onValueChange={(value) => setPreferencesForm({...preferencesForm, theme: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                    <Select
                      value={preferencesForm.language || "en"}
                      onValueChange={(value) => setPreferencesForm({...preferencesForm, language: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                    <Select
                      value={preferencesForm.timezone || "Asia/Kolkata"}
                      onValueChange={(value) => setPreferencesForm({...preferencesForm, timezone: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_format" className="text-sm font-medium">Date Format</Label>
                    <Select
                      value={preferencesForm.date_format || "DD/MM/YYYY"}
                      onValueChange={(value) => setPreferencesForm({...preferencesForm, date_format: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="time_format" className="text-sm font-medium">Time Format</Label>
                  <Select
                    value={preferencesForm.time_format || "24h"}
                    onValueChange={(value) => setPreferencesForm({...preferencesForm, time_format: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-medium text-sm sm:text-base">Notification Preferences</h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <Label htmlFor="email_notifications" className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={preferencesForm.notifications?.email || false}
                      onCheckedChange={(checked) => setPreferencesForm({
                        ...preferencesForm, 
                        notifications: {...preferencesForm.notifications, email: checked}
                      })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Smartphone className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <Label htmlFor="sms_notifications" className="text-sm font-medium">SMS Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={preferencesForm.notifications?.sms || false}
                      onCheckedChange={(checked) => setPreferencesForm({
                        ...preferencesForm, 
                        notifications: {...preferencesForm.notifications, sms: checked}
                      })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Bell className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <Label htmlFor="push_notifications" className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-500">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={preferencesForm.notifications?.push || false}
                      onCheckedChange={(checked) => setPreferencesForm({
                        ...preferencesForm, 
                        notifications: {...preferencesForm.notifications, push: checked}
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-medium text-sm sm:text-base">Dashboard Preferences</h4>
                  
                  <div>
                    <Label htmlFor="default_view" className="text-sm font-medium">Default Dashboard View</Label>
                    <Select
                      value={preferencesForm.dashboard?.default_view || "overview"}
                      onValueChange={(value) => setPreferencesForm({
                        ...preferencesForm, 
                        dashboard: {...preferencesForm.dashboard, default_view: value}
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="farmers">Farmers</SelectItem>
                        <SelectItem value="consumers">Consumers</SelectItem>
                        <SelectItem value="connections">Connections</SelectItem>
                        <SelectItem value="requests">Requests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="refresh_interval" className="text-sm font-medium">Auto Refresh Interval (seconds)</Label>
                    <Input
                      id="refresh_interval"
                      type="number"
                      value={preferencesForm.dashboard?.refresh_interval || 30}
                      onChange={(e) => setPreferencesForm({
                        ...preferencesForm, 
                        dashboard: {...preferencesForm.dashboard, refresh_interval: parseInt(e.target.value)}
                      })}
                      placeholder="Enter refresh interval"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleUpdatePreferences} disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
