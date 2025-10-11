import React, { createContext, useContext,useState,ReactNode} from 'react'
import steamRes from '../types/player_info';
interface PlayerContextType {
  playerData: steamRes | null;
  setPlayerData: React.Dispatch<React.SetStateAction<steamRes | null>>;
}
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerData, setPlayerData] = useState<steamRes | null>(null);
  return (
    <PlayerContext.Provider value={{ playerData, setPlayerData }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}