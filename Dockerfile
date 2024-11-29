# Use the nginx base image
FROM nginx

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Create the sources.list file
RUN touch /etc/apt/sources.list

# Update the apt mirror source to Tencent Cloud
RUN sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y npm

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