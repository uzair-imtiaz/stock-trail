#!/bin/bash

EC2_PUBLIC_IP="13.60.208.234"
EC2_USER="ubuntu"
SSH_KEY_PATH="~/Downloads/distro-secret-key.pem"
REMOTE_DIR="stock-trail"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo "📦 Copying necessary files to EC2..."

# Create folder on EC2
ssh -i "$SSH_KEY_PATH" $EC2_USER@$EC2_PUBLIC_IP "mkdir -p $REMOTE_DIR"

# Copy project files (excluding node_modules and other large things)
scp -i "$SSH_KEY_PATH" docker-compose.yml Dockerfile .env package.json package-lock.json deploy.sh $EC2_USER@$EC2_PUBLIC_IP:$REMOTE_DIR

# Copy backend folder recursively
scp -i "$SSH_KEY_PATH" -r ./backend $EC2_USER@$EC2_PUBLIC_IP:$REMOTE_DIR

# SSH into EC2 instance and deploy
ssh -i "$SSH_KEY_PATH" $EC2_USER@$EC2_PUBLIC_IP << EOF
    cd $REMOTE_DIR

    # Stop and remove existing containers (optional)
    docker-compose down

    # Start new containers
    docker-compose up -d
EOF

echo "🚀 Deployment complete."
