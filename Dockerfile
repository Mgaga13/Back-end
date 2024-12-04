# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all files
COPY . .
# Build the app
RUN yarn build

# Expose the app's port
EXPOSE 3337

# Start the app
CMD ["yarn", "start:prod"]
