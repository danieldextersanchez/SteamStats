import OwnedGames from './components/owned_games';
import electronLogo from './assets/electron.svg'
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import list from './interface/owned_games';
import steamRes from './interface/player_info';

interface PlayerContextType {
  playerData: steamRes | null;
  setPlayerData: React.Dispatch<React.SetStateAction<steamRes | null>>;
}
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerData, setPlayerData] = useState<steamRes | null>(null);
  return (
    <PlayerContext.Provider value={{ playerData, setPlayerData }}>
      {children}
    </PlayerContext.Provider>
  );
}

function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}

function App(): React.JSX.Element {
  const [gameList, setGameList] = useState<list>({});
  const { playerData, setPlayerData } = usePlayer();
  const login = (): void => { 
    window.electron.ipcRenderer.send('login')
  }
  const logout = (): void => { 
    setPlayerData(null);
    localStorage.removeItem("steamStatsPlayerData");
    setGameList({});
  }

  useEffect(() => {
    (window as any).electronAPI.onSteamAuth((player_data: steamRes) => {
      localStorage.setItem("steamStatsPlayerData", JSON.stringify(player_data));
      setPlayerData(player_data);
    });
    (window as any).electronAPI.onGetGames((game_list) => {
      setGameList(game_list);
    });

    let playerData = localStorage.getItem("steamStatsPlayerData");
    if (playerData) {
      setPlayerData(JSON.parse(playerData));
    }
  }, [setPlayerData]);

  useEffect(() => { 
    console.log(gameList)
  }, [gameList]);

  return (
    <main>
      <div>{playerData ? playerData.personaname : "playerData.personaname"}</div>
      <img alt="logo" className="logo" src={playerData?.avatarfull || electronLogo} />
      {!playerData ? (
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={login}>
            Steam Login
          </a>
        </div>
      ) : (
        <button onClick={logout}>
          Logout
        </button>
      )}
      <button onClick={() => {
        let steamid = playerData?.steamid;
        console.log(steamid)
        window.electron.ipcRenderer.send("getGames", { steamid });
      }}>
        Get Games
      </button>
      <OwnedGames {...gameList} />
    </main>
  );
}

export default function AppWithProvider() {
  return (
    <PlayerProvider>
      <App />
    </PlayerProvider>
  );
}