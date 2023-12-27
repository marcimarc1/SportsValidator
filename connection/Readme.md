## Postgres Setup

For Windows, I have followed this [Tutorial][def]. No configuration changes were made and all the default settings are in place. The tutorial has option for Linux and Mac subsequently. Preferably use "admin" as the password (Or make subsequent changes in the main.rs file for connection)

[def]: https://www.postgresqltutorial.com/install-postgresql/

## To Run Rust Files

I have used the following [Reference][def]

[def]: https://rust-lang-nursery.github.io/rust-cookbook/database/postgres.html

### Cargo TOML file

This file has dependencies needed for rust. The versions of the subsequent dependencies may vary.

### Main.rs

This is the main file. Currently the structure of this file is in the order:
1. Connection to Postgres
2. Create Tables
3. Insert Queries
4. Select Queries
5. Update Queries

#### Create Tables

Be careful of the datatypes used and their subsequent equivalents during integration.
Tables and their usage are explained in the file.

#### Insert Queries

The file contains demo inputs, but upon integration, inputs would be directly used. Typecasting is taken into consideration especially while inserting into the table "Annotations" and "H_keys" (Reading from csvs).

#### Select and Update Queries

Only limited queries are in the file, but more can be added as needed.


#### Testing

Using the above tutorials, Rust and postgres should be setup with default settings (postgres password admin).
This is local database, create a database IDP (if name is changed, update it on line 9 in src/main.rs)
All the files(csvs and videos) are also locally stored. Pass the path of complated Run folder as argument (eg. Cargo run .../Storage/Results/run_0). This folder should contain homographies.csv and processed_players.csv in them
All the other data is also dummy data.