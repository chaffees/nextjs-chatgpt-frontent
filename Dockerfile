# Use the official Node.js 18.17.1 image from Docker Hub
FROM node:18.17.1

# Set the working directory
WORKDIR /app

# Set the Node.js environment to production
ENV NODE_ENV production

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the application's dependencies
RUN npm install --only=production --silent

# Copy the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]