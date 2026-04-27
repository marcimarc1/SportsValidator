## Setup

Follow the Readme file from the connections folder for setup.
This file is the extension of it.

## NOTE

This file is only for iterating through a folder of multiple completed runs and autopopulating the database with their respective homographies and annotations from their corresponding logfiles.
The print statements are purely for testing purposes in the case that the database interface is not userfriendly or if you test it only through CLI.

#### Testing

Using the above tutorials, Rust and postgres should be setup with default settings (postgres password admin).
This is local database, create a database autoannotate (if name is changed, update it on line 14 in src/main.rs)
All the files(csvs and videos) are also locally stored. So paths will all change as per your respective storages.
Since this is an autopopulate simulation, the paths were automatically retrieved from the log files and do not match local video paths.
Pass the path of Results folder as argument (eg. Cargo run .../Storage/Results). This result file will contain all the runs (run_0, run_1 and so on)

Testing in docker should be possible if you keep the server running in the background, and replace the path to "postgres://user:pass@db:5432" on line 15 of main.rs
