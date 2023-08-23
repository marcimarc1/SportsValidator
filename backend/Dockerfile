# Use a base image with Rust pre-installed
FROM rust:latest
ENV SQLX_OFFLINE=true

# Set the working directory inside the container
WORKDIR /app

# Copy your Rust application files into the container
COPY . .

# Build your Rust application
RUN cargo build --release

# Specify the command to run when the container starts
CMD ["./target/release/backend"]
# CMD [ "/bin/ls", "-l" ]