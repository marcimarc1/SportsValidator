use axum::{
    routing::{get, post, get_service},
    Json, Router, extract::{Multipart, DefaultBodyLimit, Path}, response::{IntoResponse, Redirect}, body::{StreamBody, Bytes}, http::StatusCode, BoxError,
};
use futures::{Stream, TryStreamExt};
use tokio::{io::BufWriter, fs::File};
use tokio_util::io::{ReaderStream, StreamReader};
use tower_http::services::ServeDir;
use uuid::Uuid;
use tower_http::cors::{CorsLayer};
use std::{net::SocketAddr, io};

// Base : https://medium.com/@lindblomdev/beginning-rust-by-exploring-a-very-basic-axum-web-api-in-detail-1f4c87e422e0

// Upload file streaming : https://github.com/tokio-rs/axum/blob/main/examples/stream-to-file/src/main.rs

// http://127.0.0.1:3030/assets/form.html

const UPLOADS_DIRECTORY: &str = "uploads";

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/foo", get(|| async { "Hi from /foo" })) // Simplest route for demonstration purposes
        .nest_service("/", get_service(ServeDir::new("./assets")))
        .route("/upload", post(upload))
        .layer(DefaultBodyLimit::max(1 << 30))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    println!("Server started, listening on {addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("Failed to start server");
}

#[derive(serde::Serialize)]
struct Message {
    message: String,
}

// https://docs.rs/axum/latest/axum/extract/struct.Multipart.html#example
// async fn upload(mut multipart: Multipart) {
//     println!("Received multipart file");
//     while let Some(field) = multipart.next_field().await.unwrap() {
//         let name = field.name().unwrap().to_string();
//         let filename = field.file_name().unwrap().to_string();
//         println!("name : {}, filename : {}", name, filename);

//         let data = field.bytes().await.unwrap();
//         println!("Length of `{}` is {} bytes", name, data.len());
//     }
// }


async fn download(Path(path): Path<Uuid>) {

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

    if !path_is_valid(path) {
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
fn path_is_valid(path: &str) -> bool {
    let path = std::path::Path::new(path);
    let mut components = path.components().peekable();

    if let Some(first) = components.peek() {
        if !matches!(first, std::path::Component::Normal(_)) {
            return false;
        }
    }

    components.count() == 1
}
