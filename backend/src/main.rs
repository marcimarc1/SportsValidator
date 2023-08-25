use axum::{
    body::Bytes,
    extract::{DefaultBodyLimit, Multipart, Path},
    http::StatusCode,
    response::Redirect,
    routing::{get, get_service, post},
    BoxError, Json, Router, Extension
};
use futures::{Stream, TryStreamExt};
use std::{io, net::SocketAddr};
use tokio::{fs::File, io::BufWriter};
use tokio_util::io::StreamReader;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;

use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use serde::de::Error;

// Base : https://medium.com/@lindblomdev/beginning-rust-by-exploring-a-very-basic-axum-web-api-in-detail-1f4c87e422e0
// Upload file streaming : https://github.com/tokio-rs/axum/blob/main/examples/stream-to-file/src/main.rs
// Deployment and connection to database : https://github.com/letsgetrusty/api-deployment-example/tree/master

const UPLOADS_DIRECTORY: &str = "uploads";

#[derive(sqlx::FromRow)]
#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct PlayerAnnotationRecord {
    #[serde(rename = "FrameNo")]
    #[serde(deserialize_with = "string_to_i32")]
    frame_number: i32,

    #[serde(rename = "PlayerKey")]
    #[serde(deserialize_with = "string_to_i32")]
    track_id: i32,

    #[serde(deserialize_with = "string_to_f64")]
    x: f64,

    #[serde(deserialize_with = "string_to_f64")]
    y: f64,

    #[serde(deserialize_with = "string_to_f64")]
    w: f64,

    #[serde(deserialize_with = "string_to_f64")]
    h: f64,

    #[serde(deserialize_with = "string_to_f64")]
    x2: f64,

    #[serde(deserialize_with = "string_to_f64")]
    y2: f64,

    #[serde(deserialize_with = "string_to_f64")]
    x1: f64,

    #[serde(deserialize_with = "string_to_f64")]
    y1: f64,

    #[serde(deserialize_with = "string_to_f64")]
    x_trans: f64,

    #[serde(deserialize_with = "string_to_f64")]
    y_trans: f64,
}

// https://stackoverflow.com/questions/66230715/make-my-own-error-for-serde-json-deserialize
fn string_to_i32<'de, D>(deserializer: D) -> Result<i32, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let float_value = string_to_f64(deserializer)?;
    return Ok(float_value as i32);
}

fn string_to_f64<'de, D>(deserializer: D) -> Result<f64, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let str_value: &str = serde::Deserialize::deserialize(deserializer)?;
    return str_value.parse::<f64>().map_err(D::Error::custom);
}



// Using anyhow::Result to be able to handle error that might be returned by `sqlx::migrate!` call
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set.");
    println!("DATABASE_URL : {}", &url);

    // Connecting to the database
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url) // Switch to &url if url becomes a String
        .await
        .unwrap_or_else(|_| panic!("Failed to create Postgres connection pool! URL: {}", url));

    //// Applying the migrations if not previously applied
    // For each new migrationm, create a sql file using `sqlx migrate add <description>` and then edit that file
    // sqlx cli : https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
    // sqlx migrations doc : https://docs.rs/sqlx/latest/sqlx/migrate/trait.MigrationSource.html
    sqlx::migrate!("./migrations").run(&pool).await?;
    println!("Applied database migrations");

    match save_annotations_for_video(199, "./assets/processed_players.csv", &pool).await {
        Ok(_) => {
            println!("Successfully saved annotations")
        }
        Err(err) => {
            eprintln!("Error saving annotation: {}", err);
        }
    }

    //// Creating the routes of the server
    // Careful : doesn't handle client side routing, meaning if you manually type a url in the React app it will not work
    let app = Router::new()
        .route("/foo", get(|| async { "Hi from /foo" })) // Simplest route for demonstration purposes
        .route("/api/annotations/:video_id", get(handle_annotations_request))
        .route("/api/upload", post(upload))
        .nest_service("/assets", get_service(ServeDir::new("./assets"))) // If need be
        .nest_service("/uploads", get_service(ServeDir::new("./uploads")))
        .nest_service("/", get_service(ServeDir::new("./react-app")))
        .layer(DefaultBodyLimit::max(1 << 30))
        .layer(CorsLayer::permissive())
        .layer(Extension(pool));

    //// Binding the routes to a http server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3030));
    println!("Server started, listening on {addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("Failed to start server");

    Ok(())
}

async fn save_annotations_for_video(
    video_id: i32,
    annotations_file_path: &str,
    pool: &Pool<Postgres>
) -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::File::open(annotations_file_path)?;
    let mut csv_reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_reader(file);

    let mut transaction = pool.begin().await?;

    for result in csv_reader.deserialize() {
        let record: PlayerAnnotationRecord = result?;
        let _ = sqlx::query("INSERT INTO annotations (video_id, frame_number, track_id, x, y, w, h, x2, y2, x1, y1, x_trans, y_trans) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)")
            .bind(video_id)
            .bind(record.frame_number)
            .bind(record.track_id)
            .bind(record.x)
            .bind(record.y)
            .bind(record.w)
            .bind(record.h)
            .bind(record.x2)
            .bind(record.y2)
            .bind(record.x1)
            .bind(record.y1)
            .bind(record.x_trans)
            .bind(record.y_trans)
            .execute(&mut transaction)
            .await?;
    }

    transaction.commit().await?;

    println!("Batch insertion completed successfully");

    // See also https://github.com/jmoiron/sqlx/blob/master/README.md

    Ok(())
}


// Why unwrap() after await ?
async fn upload(mut multipart: Multipart) -> Result<Redirect, (StatusCode, String)> {
    println!("Received multipart file");
    while let Some(field) = multipart.next_field().await.unwrap() {
        if let Some(file_name) = field.file_name() {
            println!("File name : {}", file_name);
            println!("Field name : {}", field.name().unwrap().to_string());
            let file_name = file_name.to_owned();
            stream_to_file(&file_name, field).await?;
        }
    }

    Ok(Redirect::to("/"))
}

async fn stream_to_file<S, E>(path: &str, stream: S) -> Result<(), (StatusCode, String)>
where
    S: Stream<Item = Result<Bytes, E>>,
    E: Into<BoxError>,
{
    println!("Path : {}", path);

    if !is_path_valid(path) {
        println!("Invalid path");
        return Err((StatusCode::BAD_REQUEST, "Invalid path".to_owned()));
    }

    async {
        // Convert the stream into an `AsyncRead`.
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        println!("Before creating body reader");
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        // Create the file. `File` implements `AsyncWrite`.
        let path = std::path::Path::new(UPLOADS_DIRECTORY).join(path);
        let mut file_writer = BufWriter::new(File::create(path).await?);
        println!("Created file path");

        // Copy the body into the file.
        tokio::io::copy(&mut body_reader, &mut file_writer).await?;

        println!("Copied file");

        Ok::<_, io::Error>(())
    }
    .await
    .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))
}

// to prevent directory traversal attacks we ensure the path consists of exactly one normal
// component
fn is_path_valid(path: &str) -> bool {
    let path = std::path::Path::new(path);
    let mut components = path.components().peekable();

    if let Some(first) = components.peek() {
        if !matches!(first, std::path::Component::Normal(_)) {
            return false;
        }
    }

    components.count() == 1
}

// About obscure errors : https://docs.rs/axum/latest/axum/handler/index.html
#[axum::debug_handler]
async fn handle_annotations_request(state: Extension<Pool<Postgres>>, Path(video_id): Path<i32>) -> Json<Vec<PlayerAnnotationRecord>> {
    let Extension(pool) = state;

    let records = sqlx::query_as::<_, PlayerAnnotationRecord>("SELECT * FROM annotations WHERE video_id = $1 ORDER BY frame_number")
        .bind(video_id)
        .fetch_all(&pool)
        .await
        .expect("failed to fetch users");
    Json(records)
}
