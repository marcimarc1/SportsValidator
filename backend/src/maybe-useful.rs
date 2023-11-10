
// async fn save_annotations_for_video_alternative(
//     video_id: i32,
//     annotations_file_path: &str,
//     pool: &Pool<Postgres>
// ) -> Result<(), Box<dyn std::error::Error>> {
//     let file = std::fs::File::open(annotations_file_path)?;
//     let mut csv_reader = csv::ReaderBuilder::new()
//         .has_headers(true)
//         .from_reader(file);

//     let mut tx = pool.begin().await?;
//     let stmt = tx.prepare("INSERT INTO annotations VALUES ($1, $2, $3, $4, $5, $6m $7, $8)").await?;

//     // Would probably be better to read all at once into a vector, and then write all the data
//     for result in csv_reader.deserialize() {
//         let record: PlayerAnnotationRecord = result?;
//         stmt.execute(&mut tx, &(record.frame_number, record.player_id, record.x, record.y, record.w, record.h, record.x_trans, record.y_trans)).await?;
//         println!("{:?}", record);
//     }

//     tx.commit().await?;

//     println!("Batch insertion completed successfully");

//     // See also https://github.com/jmoiron/sqlx/blob/master/README.md

//     Ok(())
// }



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

    // Would probably be better to read all at once into a vector, and then write all the data
    for result in csv_reader.deserialize() {
        let record: PlayerAnnotationRecord = result?;

        sqlx::query!(
            "INSERT INTO annotations VALUES ($1, $2, $3, $4, $5, $6m $7, $8)",
            record.frame_number,
            record.player_id,
            record.x,
            record.y,
            record.w,
            record.h,
            record.x_trans,
            record.y_trans
        )
        .execute(pool)
        .await?;
        println!("{:?}", record);
    }

    transaction.commit().await?;

    println!("Batch insertion completed successfully");

    // See also https://github.com/jmoiron/sqlx/blob/master/README.md

    Ok(())
}







fn save_annotations_for_video_old(
    video_id: i32,
    annotations_file_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {

    let file = std::fs::File::open(annotations_file_path)?;
    let mut csv_reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_reader(file);

    // let headers: &StringRecord = match csv_reader.headers() {
    //     Ok(headers) => {
    //         // Print the header names
    //         for header in headers.iter() {
    //             println!("Header: {}", header);
    //         }
    //         println!("Columns count : {}", headers.len());
    //         headers
    //     }
    //     Err(err) => {
    //         panic!("Error reading headers: {}", err);
    //     }
    // };

    let mut iter = csv_reader.records();
    if let Some(result) = iter.next() {
        let record = result?;
        println!("Before deserialize");
        let row: PlayerAnnotationRecord = record.deserialize(None)?;
        println!("{:?}", row);
        println!("Record len : {}", record.len());
        // assert_eq!(record, vec!["Boston", "United States", "4628910"]);
        // Ok(())
    }

    // for result in csv_reader.records() {
    //     let record = result?;
    //     println!("{:?}", record);
    // }
    Ok(())
}

