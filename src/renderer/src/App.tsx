import OwnedGames from './components/owned_games';
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from "react";
import list from './interface/owned_games';
import steamRes from './interface/player_info';

function App(): React.JSX.Element {
  const ipcHandle = (): void =>{ 
     window.electron.ipcRenderer.send('ping')
  }
  const [playerData, setPlayerData] = useState<steamRes | null>(null);
  const [gameList, setGameList] = useState<list>({});

  useEffect(() => {
    (window as any).electronAPI.onSteamAuth((player_data : steamRes) => {
      setPlayerData(player_data);
    });
    (window as any).electronAPI.onGetGames((game_list) => {
      setGameList(game_list);
    });
  }, []);
  useEffect(() => { 
    console.log(gameList)
  },[gameList])
  return (
    <main>
      <div>{playerData ? playerData.personaname : "playerData.personaname"}</div>
        <img alt="logo"className="logo"src={playerData?.avatarfull || electronLogo}/>
        {!playerData && (
          <div className="action">
          <a target="_blank" rel="noreferrer" onClick={()=>{
            ipcHandle()
            }}>Steam Login</a>
        </div>
        )}
        <button onClick={()=>{
          let steamid = playerData?.steamid;
          window.electron.ipcRenderer.send("getGames", { steamid });
        }
        }>Get Games</button>
        <OwnedGames {...gameList}/>
    </main>
  )
}

export default App
