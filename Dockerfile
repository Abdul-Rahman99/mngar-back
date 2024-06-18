# Use an official Node.js base image with a specific version
FROM node:18
# Set the working directory in the container
WORKDIR /
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install the application dependencies
RUN npm install
# Copy the application code to the working directory
COPY . .
# Expose the port on which your application will run
EXPOSE 3000
# Define the command to run the application
CMD [ "npm", "start" ]