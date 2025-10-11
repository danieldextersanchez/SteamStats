export default interface list {
    response?:{
        games?: Game[] 
    }
}

export interface Game {
    appid: number;
    name: string;
    img_icon_url: string;
    playtime_forever: string;
}