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

CREATE TABLE annotations (
    annotation_id INT UNIQUE PRIMARY KEY,
    frame_no INT,
    x FLOAT8,
    y FLOAT8,
    w FLOAT8,
    h FLOAT8,
    confidence FLOAT,
    class INT
);