export interface DotaPlayer {
    account_id: number,
    player_slot: number,
    team_number: number,
    team_slot: number,
    hero_id: number,
    hero_variant: number
}

export interface DotaMatch {
    match_id: number,
    match_seq_num: number,
    start_time: number,
    lobby_type: number,
    radiant_team_id: number,
    dire_team_id: number,
    players: DotaPlayer[];
}
export default interface DotaMatchListProps {
  matches: DotaMatch[];
}
