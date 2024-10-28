# Use a Node.js base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 5173 for the Vite dev server
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]
