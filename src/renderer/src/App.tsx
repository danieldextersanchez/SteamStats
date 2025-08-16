import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from "react";

function App(): React.JSX.Element {
  const ipcHandle = (): void =>{ 
     window.electron.ipcRenderer.send('ping')
  }
  interface steamRes{
      "steamid": string,
      "communityvisibilitystate": number,
      "profilestate": number,
      "personaname": ":(",
      "commentpermission": number,
      "profileurl": string,
      "avatar": string,
      "avatarmedium": string,
      "avatarfull": string,
      "avatarhash": string,
      "lastlogoff": number,
      "personastate": number,
      "primaryclanid": "103582791434277245",
      "timecreated": number,
      "personastateflags": number
  }
  const [playerData, setPlayerData] = useState<steamRes | null>(null);
  const [gameList,setGameList] = useState({})

  useEffect(() => {
    (window as any).electronAPI.onSteamAuth((player_data : steamRes) => {
      setPlayerData(player_data);
    });
    (window as any).electronAPI.onGetGames((game_list) => {
      setGameList(game_list);
    });
  }, []);
  return (
    <>
      <div>{playerData ? playerData.personaname : "playerData.personaname"}</div>
        <img alt="logo"className="logo"src={playerData?.avatarfull || electronLogo}/>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={()=>{
            ipcHandle()
            }}>Steam Loginn</a>
        </div>
        <button onClick={()=>{
          let steamid = playerData?.steamid;
          alert(steamid)
          window.electron.ipcRenderer.send("getGames", { steamid });
        }
        }>Get Games</button>
        {JSON.stringify(gameList)}
      <Versions></Versions>
    </>
  )
}

export default App
