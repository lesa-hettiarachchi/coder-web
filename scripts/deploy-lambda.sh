#!/bin/bash

# Deploy Lambda function for Coder Web
# This script deploys the leaderboard processor Lambda function

set -e

echo "🚀 Deploying Lambda function for Coder Web..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

cd lambda

# Install dependencies
echo "📦 Installing Lambda dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r leaderboard-processor.zip . -x "*.git*" "node_modules/.cache/*"

# Check if Lambda function exists
FUNCTION_NAME="coder-web-leaderboard"
if aws lambda get-function --function-name $FUNCTION_NAME &> /dev/null; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://leaderboard-processor.zip
else
    echo "🆕 Creating new Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
        --handler leaderboard-processor.handler \
        --zip-file fileb://leaderboard-processor.zip \
        --timeout 30 \
        --memory-size 256
fi

# Create DynamoDB table if it doesn't exist
TABLE_NAME="coder-web-leaderboard"
if ! aws dynamodb describe-table --table-name $TABLE_NAME &> /dev/null; then
    echo "🆕 Creating DynamoDB table..."
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --time-to-live-specification \
            AttributeName=ttl,Enabled=true
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{LEADERBOARD_TABLE=$TABLE_NAME}"

# Add API Gateway trigger
echo "🌐 Setting up API Gateway trigger..."
aws apigateway create-rest-api \
    --name coder-web-api \
    --description "API Gateway for Coder Web Lambda functions" \
    --endpoint-configuration types=REGIONAL

echo "✅ Lambda function deployed successfully!"
echo "📊 Function ARN: $(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)"
echo "🌐 API Gateway endpoint will be available after configuration"

