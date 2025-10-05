export default interface list {
    response?:{
        games?: { appid:string,name: string, img_icon_url : string,playtime_forever:string}[] 
    }
}