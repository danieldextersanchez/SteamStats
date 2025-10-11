import React,{useState} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import list,{Game} from '../types/owned_games';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { usePlayer } from '../store/playerContext';
import Dota from './dota';
import  DotaMatchListProps  from '../types/dota_match';

const OwnedGames: React.FC<list> = ({ response }) => {
    const { playerData } = usePlayer();
    const steamid = playerData?.steamid;
    const [open, setOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(<div>Game Details Here</div>);
    const gameClick =(game:Game) => {
        switch(game.appid) {
            case 570:
                (window as any).electronAPI.getDotaHistory({ steamid }).then((res : {result :DotaMatchListProps}) => {
                    console.log(res.result);
                    setModalContent(<Dota matches={res.result.matches} />);
                    setOpen(true);
                });
                break;
        }
    }

    if(response?.games === undefined){
        return <div>No games found.</div>;
    }
    let sortedGames = response?.games?.sort((a, b) => {
        return (parseInt(b.playtime_forever) - parseInt(a.playtime_forever));
    });
    response!.games = sortedGames;
    return <div>
    <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Modal Title</DialogTitle>
        <DialogContent>
            {modalContent}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
    </Dialog>
    <List component="nav" sx={{ width: '100%', maxWidth: 360, maxHeight: 300, overflowY: 'auto' }}>
        {response?.games?.map((game) => {
        return <ListItem key={game.appid}>
            <ListItemAvatar>
            <Avatar src={`https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} />
            </ListItemAvatar>
            <ListItemButton sx={{'&:hover': { backgroundColor: 'primary.main', }}} onClick={() => {gameClick(game)}}>
            <ListItemText primary={game.name}
            secondary={game.playtime_forever ? `Playtime: ${(parseInt(game.playtime_forever) / 60).toFixed(1)} hours` : 'No playtime recorded'}
            sx={{'& .MuiListItemText-secondary': {color: 'white' },'& .MuiListItemText-primary': { color: 'white' },}}/>
            </ListItemButton>
        </ListItem>
        })}
    </List>
    </div>
}

export default OwnedGames;