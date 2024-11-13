export class Game{
    id;
    team1_id;
    team2_id;
    sport_id;
    date_played;
    constructor(data){
        this.id = data.id;
        this.team1_id = data.team1_id;
        this.team2_id = data.team2_id;
        this.sport_id = data.sport_id;
        this.date_played = data.date_played;
    }
}