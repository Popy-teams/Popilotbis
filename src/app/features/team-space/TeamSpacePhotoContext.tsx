import { createContext, useContext, type ReactNode } from 'react';

interface TeamSpacePhotoContextValue {
  photos: Record<string, string>;
  setMemberPhoto: (memberId: string, dataUrl: string) => void;
  getPhoto: (memberId: string) => string | undefined;
}

const TeamSpacePhotoContext = createContext<TeamSpacePhotoContextValue | null>(null);

export function TeamSpacePhotoProvider({
  photos,
  setMemberPhoto,
  children,
}: {
  photos: Record<string, string>;
  setMemberPhoto: (memberId: string, dataUrl: string) => void;
  children: ReactNode;
}) {
  const value: TeamSpacePhotoContextValue = {
    photos,
    setMemberPhoto,
    getPhoto: (id) => photos[id],
  };
  return <TeamSpacePhotoContext.Provider value={value}>{children}</TeamSpacePhotoContext.Provider>;
}

export function useTeamSpacePhotos() {
  const ctx = useContext(TeamSpacePhotoContext);
  if (!ctx) throw new Error('useTeamSpacePhotos hors TeamSpacePhotoProvider');
  return ctx;
}
