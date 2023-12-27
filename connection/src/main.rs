use postgres::{Client, NoTls};
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {

    let file_path = std::env::args().nth(1).expect("no path given");
    println!("Rust Test!");

    // CONNECT TO POSTGRES (database name IDP)
    let mut client = Client::connect("postgresql://postgres:admin@localhost/test", NoTls)?;

    println!("Connected!");

    // CREATE TABLES

    //Roles: 1 - admin (can upload/delete videos), 2 - manager (annotate), 3 - player (only view)
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS roles(
            role_id INT UNIQUE NOT NULL ,
            role_name VARCHAR (255) UNIQUE NOT NULL,
            PRIMARY KEY (role_id)
        )
    ")?;

    //For future authentication
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS users(
            username VARCHAR (50) UNIQUE NOT NULL PRIMARY KEY,
            email VARCHAR (255) UNIQUE NOT NULL,
            password VARCHAR (50) NOT NULL
        )
    ")?;

    //List of teams
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS teams(
            team_id INT UNIQUE PRIMARY KEY,
            team_name VARCHAR (255) UNIQUE NOT NULL
        )
    ")?;

    //List of players
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS players(
            player_id INT UNIQUE PRIMARY KEY,
            player_name VARCHAR (255) NOT NULL,
            team_id INT NOT NULL,
            FOREIGN KEY (team_id)
                REFERENCES teams (team_id)
        )
    ")?;

    //List of sports. For future usage in case of multiple sports.
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS sports(
            sport_id INT UNIQUE PRIMARY KEY,
            sport_name VARCHAR (255) UNIQUE NOT NULL
        )
    ")?;

    //List of videos and their path
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS videos(
            video_id INT UNIQUE PRIMARY KEY,
            video_path VARCHAR (255) UNIQUE NOT NULL,
            uploaded_by VARCHAR(50),
            FOREIGN KEY (uploaded_by)
                REFERENCES users (username)
        )
    ")?;

    //Access roles: To check if user has specific role to perform an action. Only admin can upload/delete etc
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS access_roles(
            username VARCHAR(50) NOT NULL,
            role_id INT NOT NULL,
            team_id INT NOT NULL,
            PRIMARY KEY (username, role_id, team_id),
            FOREIGN KEY (role_id)
                REFERENCES roles (role_id),
            FOREIGN KEY (username)
                REFERENCES users (username),
            FOREIGN KEY (team_id)
                REFERENCES teams (team_id)
        )
    ")?;

    //Transformation Matrix
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS H_keys(
            id INT UNIQUE PRIMARY KEY,
            video_id INT NOT NULL,
            frame_id INT NOT NULL,
            h11 FLOAT NOT NULL,
            h12 FLOAT NOT NULL,
            h13 FLOAT NOT NULL,
            h21 FLOAT NOT NULL,
            h22 FLOAT NOT NULL,
            h23 FLOAT NOT NULL,
            h31 FLOAT NOT NULL,
            h32 FLOAT NOT NULL,
            h33 FLOAT NOT NULL,
            FOREIGN KEY (video_id)
                REFERENCES videos (video_id)
        )
    ")?;

    //Annotations
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS annotations(
            id INT UNIQUE PRIMARY KEY,
            video_id INT NOT NULL,
            player_id INT NOT NULL,
            frame_id INT NOT NULL,
            x FLOAT NOT NULL,
            y FLOAT NOT NULL,
            w FLOAT NOT NULL,
            h FLOAT NOT NULL,
            x2 FLOAT NOT NULL,
            y2 FLOAT NOT NULL,
            x1 FLOAT NOT NULL,
            y1 FLOAT NOT NULL,
            x_trans FLOAT NOT NULL,
            y_trans FLOAT NOT NULL,
            FOREIGN KEY (video_id)
                REFERENCES videos (video_id),
            FOREIGN KEY (player_id)
                REFERENCES players (player_id)
        )
    ")?;

    //List and history of games. For searching and sorting purposes based on multiple options such as by team, by game etc
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS games_history (
            game_id INT NOT NULL,
            team1_id INT NOT NULL,
            team2_id INT NOT NULL,
            sport_id INT NOT NULL,
            date_played VARCHAR(255) NOT NULL,
            video_id INT NOT NULL,
            video_order INT NOT NULL,
            PRIMARY KEY (game_id, video_id),
            FOREIGN KEY (team1_id)
                REFERENCES teams (team_id),
            FOREIGN KEY (team2_id)
                REFERENCES teams (team_id),
            FOREIGN KEY (sport_id)
                REFERENCES sports (sport_id),
            FOREIGN KEY (video_id)
                REFERENCES videos (video_id)    
        )
    ")?;

    //Dummy table to store player aggregations from the annotated games, such as how much distance player covered etc in that game.
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS player_history (
            game_id INT NOT NULL,
            team_id INT NOT NULL,
            player_id INT NOT NULL,
            games_played INT NOT NULL,
            minutes_played FLOAT NOT NULL,
            injury_status VARCHAR (255) NOT NULL,
            distance_covered FLOAT NOT NULL,
            PRIMARY KEY (game_id, team_id, player_id),
            FOREIGN KEY (team_id)
                REFERENCES teams (team_id),
            FOREIGN KEY (player_id)
                REFERENCES players (player_id)    
        )
    ")?;

    println!("Create Done!");

    // Currently has dummy variables. Have to be replaced from input stream
    // INSERT QUERIES

    let role_id = 1;
    let role_name = "admin";

    //Roles Insert
    client.execute(
            "insert into roles values ($1,$2)",
            &[&role_id, &role_name],
    )?;

    let username = "Marc";
    let email = "marc@tum.de";
    let password = "Marc123";

    //Users Insert
    client.execute(
            "insert into users values ($1,$2,$3)",
            &[&username, &email, &password],
    )?;

    let team1_id = 1;
    let team2_id = 2;
    let team1_name = "Bayern Munich";
    let team2_name = "1860 Munich";

    //Teams Insert
    client.execute(
            "insert into teams values ($1,$2)",
            &[&team1_id, &team1_name],
    )?;

    client.execute(
            "insert into teams values ($1,$2)",
            &[&team2_id, &team2_name],
    )?;

    let player_id = 0;
    let player_name = "Harry Kane";

    //Players Insert
    client.execute(
            "insert into players values ($1,$2,$3)",
            &[&player_id, &player_name, &team1_id],
    )?;

    let sport_id = 1;
    let sport_name = "Football";

    //Sports Insert
    client.execute(
            "insert into sports values ($1,$2)",
            &[&sport_id, &sport_name],
    )?;

    // Dummy Video Path. Has to be replaced by the storage Path.
    let video_id = 1;
    let video_path = "path";
    let uploaded_by = "Marc";

    // access roles to verify if user has admin rights  
    // Access Roles Insert
    client.execute(
            "insert into access_roles values ($1,$2,$3)",
            &[&username, &role_id, &team1_id],
    )?;

    //Video Insert (only if user has admin rights)
    client.execute(
            "insert into videos values ($1,$2,$3)",
            &[&video_id, &video_path, &uploaded_by],
    )?;

    //Replace path of csv.
    //Important to parse the data in accurate datatype.
    let mut temp_path2 = file_path.to_owned() + "/homographies.csv";
        let mut rdr = csv::Reader::from_path(
                temp_path2,
            )?;
        let mut counter1:i64 = 0;
        for row in client.query("SELECT COUNT(*) FROM H_keys ", &[])? {
            counter1 = row.get(0);
        }
        println!("{}", video_id);
        let mut id1 = 0 ;
        for result in rdr.records() {
            let record = result?;
            let id = id1 + counter1 as i32;
            id1 = id1 + 1;
            let frame_id1 = &record[0].parse::<f64>().unwrap();
            let frame_id = *frame_id1 as i32;
            let h11 = &record[1].parse::<f64>().unwrap();
            let h12 = &record[2].parse::<f64>().unwrap();
            let h13 = &record[3].parse::<f64>().unwrap();
            let h21 = &record[4].parse::<f64>().unwrap();
            let h22 = &record[5].parse::<f64>().unwrap();
            let h23 = &record[6].parse::<f64>().unwrap();
            let h31 = &record[7].parse::<f64>().unwrap();
            let h32 = &record[8].parse::<f64>().unwrap();
            let h33 = &record[9].parse::<f64>().unwrap();
            //Annotations Insert
            client.execute(
                    "insert into H_keys values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
                    &[&id, &video_id, &frame_id, &h11, &h12, &h13, &h21, &h22, &h23, &h31, &h32, &h33],
            )?;
        }

    //Replace path of csv.
    //Important to parse the data in accurate datatype.

    let mut temp_path3 = file_path.to_owned() + "/processed_players.csv";
    let mut rdr = csv::Reader::from_path(
            temp_path3,    
        )?;
        let mut a_video_id = 1 ;
        for result in rdr.records() {
            let record = result?;
            let aid = &record[0].parse::<i32>().unwrap();
            let a_player_id = &record[1].parse::<i32>().unwrap();
            let a_frame_id = &record[2].parse::<i32>().unwrap();
            let x = &record[3].parse::<f64>().unwrap();
            let y = &record[4].parse::<f64>().unwrap();
            let w = &record[5].parse::<f64>().unwrap();
            let h = &record[6].parse::<f64>().unwrap();
            let x2 = &record[7].parse::<f64>().unwrap();
            let y2 = &record[8].parse::<f64>().unwrap();
            let x1 = &record[9].parse::<f64>().unwrap();
            let y1 = &record[10].parse::<f64>().unwrap();
            let x_trans = &record[11].parse::<f64>().unwrap();
            let y_trans = &record[12].parse::<f64>().unwrap();
            //Annotations Insert
            client.execute(
                    "insert into annotations values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
                    &[&aid, &a_video_id, &a_player_id, &a_frame_id, &x, &y, &w, &h, &x2, &y2, &x1, &y1, &x_trans, &y_trans],
            )?;
        }

    let game_id = 1;
    let date_played = "12.12.2021";
    let video_order = 1;

    //Game history Insert
    client.execute(
            "insert into games_history values ($1,$2,$3,$4,$5,$6,$7)",
            &[&game_id, &team1_id, &team2_id, &sport_id, &date_played, &video_id, &video_order],
    )?;

    // Currently dummy values, but can be calculated from the csvs (minutes played and distance covered) 
    let games_played = 1;
    let minutes_played = 60.0;
    let injury_status = "Fit";
    let distance_covered = 10.57;

    //Player History Insert
    client.execute(
            "insert into player_history values ($1,$2,$3,$4,$5,$6,$7)",
            &[&game_id, &team1_id, &player_id, &games_played, &minutes_played, &injury_status, &distance_covered],
    )?;

    println!("Inserts Done!");
    
    // SELECT QUERIES
    // Users

    for row in client.query("SELECT * FROM users", &[])? {
        let username:String = row.get(0);
        let email:String = row.get(1);
        let password:String = row.get(2);
        println!("{} {} {} ", username, email, password);
    }

    // Annotations

    for row in client.query("SELECT * FROM annotations where frame_id = 2", &[])? {
        let a_id:i32 = row.get(0);
        let a_video_id:i32 = row.get(1);
        let a_player_id:i32 = row.get(2);
        let a_frame_id:i32 = row.get(3);
        let x:f64 = row.get(4);
        let y:f64 = row.get(5);
        let w:f64 = row.get(6);
        let h:f64 = row.get(7);
        let x2:f64 = row.get(8);
        let y2:f64 = row.get(9);
        let x1:f64 = row.get(10);
        let y1:f64 = row.get(11);
        let x_trans:f64 = row.get(12);
        let y_trans:f64 = row.get(13);
        println!("{} {} {} {} {} {} {} {} {} {} {} {} {} {}", a_id,a_video_id, a_player_id, a_frame_id, x, y, w, h, x2, y2, x1, y1, x_trans, y_trans);
    }
    
    // player history

    for row in client.query("SELECT * FROM player_history", &[])? {
        let game_id:i32 = row.get(0);
        let team_id:i32 = row.get(1);
        let player_id:i32 = row.get(2);
        let games_played:i32 = row.get(3);
        let minutes_played:f64 = row.get(4);
        let injury_status:String = row.get(5);
        let distance_covered:f64 = row.get(6);
        println!("{} {} {} {} {} {} {} ", game_id, team_id, player_id, games_played, minutes_played, injury_status, distance_covered);
    }
    
    // UPDATE QUERIES
    // Annotation
    let new_playerid = 1;
    let frame_id = 2;
    client.execute(
        "Update annotations set player_id = $1 where frame_id = $2",
        &[&new_playerid, &frame_id],
    )?;

    // Player History
    let new_minutes_played = 2;
    let mut player_id1 = 0;
    client.execute(
        "Update player_history set minutes_played = $1 where player_id = $2",
        &[&new_minutes_played, &player_id1],
    )?;

    Ok(())

}