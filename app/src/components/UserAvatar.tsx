interface UserAvatarProps {
  rank?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ rank, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className="relative flex items-center justify-center">
      {rank && (
        <div className="absolute -left-8 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
          {rank}
        </div>
      )}
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300`} />
    </div>
  );
}
