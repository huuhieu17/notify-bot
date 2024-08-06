# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --production

# Copy the rest of the application code to the working directory
COPY . .

# Set environment variables (optional, not recommended for sensitive data)
ENV TELEGRAM_TOKEN=${TELEGRAM_TOKEN:-<your-telegram-token>}
ENV APP_URL=${APP_URL:-<your-app-url>}
ENV PORT=${PORT:-<your-app-port>}

# Alternatively, you can set them dynamically during runtime

# Start the application
CMD ["node", "index.js"]
