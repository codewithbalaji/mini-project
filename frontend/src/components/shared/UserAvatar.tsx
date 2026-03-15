interface UserAvatarProps {
  name: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

const getColor = (name: string) => {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
};

const UserAvatar = ({ name, size = "md", className = "" }: UserAvatarProps) => {
  // Guard against undefined/null name (e.g. un-populated refs)
  const safeName = name || "?";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-medium ${SIZE_MAP[size]} ${getColor(safeName)} ${className}`}
      title={safeName}
    >
      {getInitials(safeName)}
    </span>
  );
};

export default UserAvatar;
