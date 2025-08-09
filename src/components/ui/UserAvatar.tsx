import React from "react";

interface UserAvatarProps {
  user: {
    full_name: string | null;
    profile_image_url: string | null;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
}) => {
  const getInitials = (name: string | null) => {
    if (!name) return "?";

    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-5 h-5 text-xs";
      case "lg":
        return "w-8 h-8 text-sm";
      default:
        return "w-6 h-6 text-xs";
    }
  };

  const getBackgroundColor = (name: string | null) => {
    if (!name) return "bg-gray-200";

    // Use minimal gray variations for a clean look
    const colors = ["bg-neutral-100"];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (user.profile_image_url) {
    return (
      <img
        src={user.profile_image_url}
        alt={user.full_name || "User"}
        className={`${getSizeClasses()} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${getSizeClasses()} rounded-full flex items-center justify-center text-gray-700 font-medium border border-gray-300 ${getBackgroundColor(
        user.full_name
      )} ${className}`}
    >
      {getInitials(user.full_name)}
    </div>
  );
};

export default UserAvatar;
