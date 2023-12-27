use postgres::{Client, NoTls};
use std::error::Error;
use std::{fs, path::Path};
use std::fs::File;
use std::any::type_name;

    // This file is only for autopopulating the annotations

fn main() -> Result<(), Box<dyn Error>> {

    let mut folder_path = std::env::args().nth(1).expect("no path given");
    println!("Rust Test!");

    // CONNECT TO POSTGRES
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

    let sport_id = 1;
    let sport_name = "Football";

    //Sports Insert
    client.execute(
            "insert into sports values ($1,$2)",
            &[&sport_id, &sport_name],
    )?;

    // access roles to verify if user has admin rights  
    // Access Roles Insert
    client.execute(
            "insert into access_roles values ($1,$2,$3)",
            &[&username, &role_id, &team1_id],
    )?;

    for n in 0..=2000 {
        let player_id = n;
        let player_name = "Player".to_owned() + &n.to_string();
        let team_id = 1;
        client.execute(
                "insert into players values ($1,$2,$3)",
                &[&player_id, &player_name, &team_id],
        )?;
    }

    

    // Iterate through folder and add video paths from logfile
    // Add your own local file path for folder iteration
    // let mut folder_path = "D:\\IDP_Data\\Storage\\compressed\\results";
    let folders = std::fs::read_dir(folder_path.clone())?.collect::<Result<Vec<_>, _>>()?;
    let mut video_id = 0;
    for folder in folders{
        let temp_path = folder_path.to_owned() + "/" + folder.file_name().to_str().unwrap() + "/log.txt";
        let contents = fs::read_to_string(temp_path).expect("Should have been able to read the file");
        let uploaded_by = "Marc";
        for content in contents.lines(){
            if content.contains("Video Path:"){
                let path = content.replace("Video Path: ","");
                video_id = video_id + 1;
                client.execute(
                        "insert into videos values ($1,$2,$3)",
                        &[&video_id, &path, &uploaded_by],
                )?;
                break;
            }
        }
    }

    // Iterate through folder and add video paths from logfile (Change folder Path same as line 246)
    // let mut folder_path = "D:\\IDP_Data\\Storage\\compressed\\results";
    let folders = std::fs::read_dir(folder_path.clone())?.collect::<Result<Vec<_>, _>>()?;
    for folder in folders{
        let temp_path1 = folder_path.to_owned() + "/" + folder.file_name().to_str().unwrap() + "/log.txt";
        let mut video_id = 0;
        let contents = fs::read_to_string(temp_path1).expect("Should have been able to read the file");
        for content in contents.lines(){
            if content.contains("Video Path:"){
                let path = content.replace("Video Path: ","");
                for row in client.query("SELECT video_id FROM videos where video_path = $1", &[&path])? {
                    video_id = row.get(0);
                }
                break;
            }
        }

        // Find corresponding homographies
        let temp_path2 = folder_path.to_owned() + "/" + folder.file_name().to_str().unwrap() + "/homographies.csv";
        let mut rdr = csv::Reader::from_path(
                temp_path2,
            )?;
        let mut counter1:i64 = 0;
        for row in client.query("SELECT COUNT(*) FROM h_keys ", &[])? {
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

        // Find corresponding annotations 
        let temp_path1 = folder_path.to_owned() + "/" + folder.file_name().to_str().unwrap() + "/processed_players.csv";
        let mut rdr = csv::Reader::from_path(
                temp_path1,
            )?;
        let mut counter:i64 = 0;
        for row in client.query("SELECT COUNT(*) FROM annotations ", &[])? {
            counter = row.get(0);
        }
        for result in rdr.records() {
            let record = result?;
            let aid1 = &record[0].parse::<i32>().unwrap();
            let aid = aid1 + counter as i32;
            let a_player_id1 = &record[1].parse::<f64>().unwrap();
            let a_player_id = *a_player_id1 as i32;
            let a_frame_id1 = &record[2].parse::<f64>().unwrap();
            let a_frame_id = *a_frame_id1 as i32;
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
                    &[&aid, &video_id, &a_player_id, &a_frame_id, &x, &y, &w, &h, &x2, &y2, &x1, &y1, &x_trans, &y_trans],
            )?;
        }
    }

    println!("Complete");
   
    

    Ok(())

}
