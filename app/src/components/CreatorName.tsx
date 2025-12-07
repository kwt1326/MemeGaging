type CreatorNameProps = {
  displayName: string;
  userName: string;
  userNameTag?: string | null;
  className?: string;
  usernameClassName?: string;
};

/**
 * Display creator name with username and tag
 * Example: John Doe @johndoe#abc123
 */
export function CreatorName({
  displayName,
  userName,
  userNameTag,
  className = "",
  usernameClassName = "text-xs text-muted-foreground",
}: CreatorNameProps) {
  return (
    <span className={className}>
      {displayName}{" "}
      <span className={usernameClassName}>
        @{userName}
        {userNameTag ? `#${userNameTag}` : ""}
      </span>
    </span>
  );
}
