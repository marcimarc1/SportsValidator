-- Add migration script here

CREATE TABLE users (
	username VARCHAR (50) UNIQUE NOT NULL PRIMARY KEY,
    email VARCHAR (255) UNIQUE NOT NULL,
	password VARCHAR (50) NOT NULL
);

CREATE TABLE videos (
    video_id INT UNIQUE PRIMARY KEY,
    video_path VARCHAR (255) UNIQUE NOT NULL,
    uploaded_by VARCHAR(50),
    FOREIGN KEY (uploaded_by)
        REFERENCES users (username)
);

CREATE TABLE IF NOT EXISTS annotations (
    id SERIAL PRIMARY KEY,
    video_id INT NOT NULL,
    track_id INT NOT NULL,
    frame_number INT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    w FLOAT NOT NULL,
    h FLOAT NOT NULL,
    x_trans FLOAT NOT NULL,
    y_trans FLOAT NOT NULL
);
