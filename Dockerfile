# Use the nginx base image
FROM nginx

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the npm project
RUN npm run build

# Expose the port
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]