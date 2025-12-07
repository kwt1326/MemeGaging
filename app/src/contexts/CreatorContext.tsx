"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCreatorDetailByAddress } from '@/lib/api';
import { useQueryEffects } from '@/hooks/useQueryEffects';
import { useWalletConnection } from '@/hooks/useWalletConnection';

interface CreatorContextValue {
  creator: Creator | null;
  user: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const CreatorContext = createContext<CreatorContextValue | undefined>(undefined);

interface CreatorProviderProps {
  children: ReactNode;
}

export function CreatorProvider({ children }: CreatorProviderProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const { address, isConnected } = useWalletConnection();

  const creatorDetailQuery = useQuery({
    queryKey: ["creatorDetailByAddress", address],
    queryFn: () => fetchCreatorDetailByAddress(address),
    enabled: isConnected && !!address,
  });

  useQueryEffects(creatorDetailQuery, {
    onSuccess: (data) => {
      setCreator(data.creator);
      setUser(data.user);
    },
  });

  const value: CreatorContextValue = {
    creator,
    user,
    isLoading: creatorDetailQuery.isLoading,
    isError: creatorDetailQuery.isError,
    error: creatorDetailQuery.error,
    refetch: creatorDetailQuery.refetch,
  };

  return (
    <CreatorContext.Provider value={value}>
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreatorContext() {
  const context = useContext(CreatorContext);
  if (context === undefined) {
    throw new Error('useCreatorContext must be used within a CreatorProvider');
  }
  return context;
}

export function withCreatorContext<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithCreatorContext(props: P) {
    return (
      <CreatorProvider>
        <Component {...props} />
      </CreatorProvider>
    );
  };
}
