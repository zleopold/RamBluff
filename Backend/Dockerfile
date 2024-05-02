# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire current directory into the container
COPY . .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the backend server
CMD ["node", "server.js"]
