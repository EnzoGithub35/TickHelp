import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import "../../styles/ProfilePage.css"; // Assuming you have a CSS file for styles

const ProfilePage = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatarUrl: user.avatarUrl || "",
      });
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: avatarPreview || undefined,
      };

      const result = await updateProfile(profileData);

      if (result.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      // Modifier ici : passer les deux arguments séparément
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        toast.success("Password updated successfully");
        setIsChangingPassword(false);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            )}
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatar-input" className="avatar-label">
                  Change Photo
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
              </div>
            )}
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <h2>
                  {user.firstName} {user.lastName}
                </h2>
                <p className="profile-role">{user.role}</p>
                <p className="profile-email">{user.email}</p>
                <button
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmitProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email (read-only)</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFormData((prev) => ({
                          ...prev,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        }));
                        setAvatarPreview(user.avatarUrl || null);
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {isChangingPassword && (
          <div className="password-change-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Change Password</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsChangingPassword(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Update Password
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
