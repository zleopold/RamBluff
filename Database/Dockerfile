# Use an official MySQL runtime as a parent image
FROM mysql:latest

# Set the root password
ENV MYSQL_ROOT_PASSWORD=RamBluffRoot

# Create a new database
#ENV MYSQL_DATABASE=rambluff_db

# Copy the SQL script into the docker-entrypoint-initdb.d directory
COPY init.sql /docker-entrypoint-initdb.d/

# Define the port the MySQL server will listen on
EXPOSE 3306
