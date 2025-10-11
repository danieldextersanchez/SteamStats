import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Box,
  Chip,
} from '@mui/material';
import DotaMatchListProps from '../types/dota_match';
import { usePlayer } from '@renderer/store/playerContext';
import heroes from '../assets/heroes.json';


const STEAM64_BASE = BigInt(76561197960265728);
function steamIdToAccountId(steamId64: number): number {
  return Number(BigInt(steamId64) - STEAM64_BASE);
}
let herolist = {}
for(let i=0;i<heroes.length;i++){
    herolist[heroes[i].id] = heroes[i];
}
const DotaMatchList: React.FC<DotaMatchListProps> = ({ matches }) => {
  const { playerData } = usePlayer();
  if (!matches || matches.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center', boxShadow: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No recent matches found.
          {JSON.stringify(matches)}
        </Typography>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  console.log(matches);
  const account_id = playerData?.steamid ? steamIdToAccountId(playerData.steamid) : playerData?.steamid;
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Dota 2 Matches {playerData?.personaname} {account_id}
        </Typography>

        <List disablePadding>
          {matches.map((match, index) => {
            let my_hero_id = 0;
            for(let i=0; i<match.players.length; i++){
                if(match.players[i].account_id == account_id){
                    my_hero_id = match.players[i].hero_id;
                }
            }
            return (
              <React.Fragment key={match.match_id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                    transition: 'background 0.2s ease',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={`https://steamcdn-a.akamaihd.net/apps/dota2/images/heroes/${herolist[my_hero_id].name.replace(/npc_dota_hero_/g,'')}_lg.png`}
                    >
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Match #{match.match_id}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ flexWrap: 'wrap' }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(match.start_time)}
                          </Typography>
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default DotaMatchList;
