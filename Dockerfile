# Use the nginx base image
FROM node:18

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Update the apt mirror source to Tencent Cloud
RUN rm -r /etc/apt
COPY apt /etc/apt
RUN apt-get update && apt-get install -y nginx

# Install npm dependencies
RUN npm config set registry https://mirrors.tencent.com/npm/
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the npm project
RUN npm run build

# Expose the port
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
RUN rm /etc/nginx/sites-enabled/default
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]