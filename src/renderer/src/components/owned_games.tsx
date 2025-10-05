import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import list from '../interface/owned_games';

const OwnedGames: React.FC<list> = ({ response }) => {
    if(response?.games === undefined){
        return <div>No games found.</div>;
    }
    let sortedGames = response?.games?.sort((a, b) => {
        return (parseInt(b.playtime_forever) - parseInt(a.playtime_forever));
    });
    response!.games = sortedGames;
    return <List sx={{ width: '100%', maxWidth: 360, maxHeight: 300, overflowY: 'auto' }}>
        {response?.games?.map((game) => (
        <ListItem key={game.appid}>
            <ListItemAvatar>
            <Avatar src={`https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} />
            </ListItemAvatar>
            <ListItemText
            primary={game.name}
            secondary={game.playtime_forever ? `Playtime: ${(parseInt(game.playtime_forever) / 60).toFixed(1)} hours` : 'No playtime recorded'}
            sx={{
                    '& .MuiListItemText-secondary': {
                    color: 'white'
                    }
                }}
            />
        </ListItem>
        ))}
    </List>;
}

export default OwnedGames;