export const getAvatarInitials = (username: string) => {
  const parts = username.split(/[ _-]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};
