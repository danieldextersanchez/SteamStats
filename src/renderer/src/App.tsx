import OwnedGames from './components/owned_games';
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from "react";
import list from './types/owned_games';
import steamRes from './types/player_info';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { usePlayer, PlayerProvider } from './store/playerContext';

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
    <Container maxWidth="xl" sx={{ width:"100vw",height:"100vh" }}>
      <Paper elevation={4} sx={{ p: 10, borderRadius: 3, bgcolor: "#1b2838",width:"100%" }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            alt="logo"
            src={playerData?.avatarfull || electronLogo}
            sx={{ width: 80, height: 80, mb: 1 }}
          />
          <Typography variant="h5" color="white" gutterBottom>
            {playerData ? playerData.personaname : "SteamStats"}
          </Typography>
          {!playerData ? (
            <Button
              variant="contained"
              color="primary"
              onClick={login}
              sx={{ width: "100%" }}
            >
              Steam Login
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              onClick={logout}
              sx={{ width: "100%" }}
            >
              Logout
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              let steamid = playerData?.steamid;
              window.electron.ipcRenderer.send("getGames", { steamid });
            }}
            sx={{ width: "100%" }}
            disabled={!playerData}
          >
            Get Games
          </Button>
          <Box width="100%">
            <div  style={{ marginTop: 16, marginLeft: "auto", marginRight: "auto",border:"1px solid #333",borderRadius:8,padding:16,backgroundColor:"#2a475e" }}>
            <OwnedGames {...gameList} />
            </div>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default function AppWithProvider() {
  return (
    <PlayerProvider>
      <App />
    </PlayerProvider>
  );
}