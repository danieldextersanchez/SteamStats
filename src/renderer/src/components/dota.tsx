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
  Tabs, Tab, Box
} from '@mui/material';
import DotaMatchListProps from '../types/dota_match';
import { usePlayer } from '@renderer/store/playerContext';
import heroes from '../assets/heroes.json';
import { useState } from 'react';
import LineChart from './linechart';

const STEAM64_BASE = BigInt(76561197960265728);
function steamIdToAccountId(steamId64: number): number {
  return Number(BigInt(steamId64) - STEAM64_BASE);
}
let herolist = {}
for(let i=0;i<heroes.length;i++){
    herolist[heroes[i].id] = heroes[i];
}

type LineChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
};

export function toGamesPerDayChartData(
  data: DotaMatchListProps,
  options?: {
    accountId?: number;
    useLocalTime?: boolean;
    label?: string;
  }
): LineChartData {
  const { accountId, useLocalTime = true, label = 'Games Played' } =
    options || {};

  const gamesPerDay: Record<string, number> = {};

  for (const match of data.matches ?? []) {
    // Optional player filter
    if (accountId) {
      const hasPlayer = match.players?.some(
        (p) => p.account_id === accountId
      );
      if (!hasPlayer) continue;
    }

    const dateObj = new Date(match.start_time * 1000);

    const date = useLocalTime
      ? dateObj.toLocaleDateString('en-CA') // YYYY-MM-DD
      : dateObj.toISOString().split('T')[0];

    gamesPerDay[date] = (gamesPerDay[date] || 0) + 1;
  }

  const sortedDates = Object.keys(gamesPerDay).sort();

  return {
    labels: sortedDates,
    datasets: [
      {
        label,
        data: sortedDates.map((d) => gamesPerDay[d]),
      },
    ],
  };
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
  
  const account_id = playerData?.steamid ? steamIdToAccountId(playerData.steamid) : playerData?.steamid;
 
  const matchCards =(<Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Dota 2 Matches {playerData?.personaname} {account_id}
        </Typography>

        <List disablePadding>
          {matches.map((match) => {
            let my_hero_id = 0;
            for(let i=0; i<match.players.length; i++){
                if(match.players[i].account_id == account_id){
                    my_hero_id = match.players[i].hero_id;
                }
            }
            let logosrc : string;
            if(herolist[my_hero_id] === undefined){
                logosrc = "https://steamcdn-a.akamaihd.net/steam/apps/570/header.jpg"
                console.log(match);
            }else{
              logosrc = `https://steamcdn-a.akamaihd.net/apps/dota2/images/heroes/${herolist[my_hero_id].name.replace(/npc_dota_hero_/g,'')}_lg.png`
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
                      src={logosrc}
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
  let playerList = {}
  matches.map((match) => {
    for(let i=0; i<match.players.length; i++){
      console.log(match.players[i]);
      if(playerList[match.players[i].account_id] === undefined){
        playerList[match.players[i].account_id] = 1;
      }else{
        playerList[match.players[i].account_id] += 1;
      }
    }
  })
  const chartData = toGamesPerDayChartData({ matches: matches, }, { accountId: account_id });
  const listOfPlayers = <LineChart datasets={chartData.datasets} labels={chartData.labels} />;

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs value={value} onChange={handleChange} aria-label="matches and players tabs">
        <Tab label="Match information" />
        <Tab label="Matches Played Chart" />
      </Tabs>

      {value === 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {matchCards}
        </Box>
      )}

      {value === 1 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {listOfPlayers}
        </Box>
      )}
    </Box>
  )
};

export default DotaMatchList;
