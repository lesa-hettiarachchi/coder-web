const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
// Ensure your environment variable is set in your Lambda configuration
const TABLE_NAME = process.env.LEADERBOARD_TABLE || 'coder-web-leaderboard'; 

exports.handler = async (event) => {
    // It's good practice to handle pre-flight OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    console.log('Received leaderboard data:', event.body);
    
    try {
        const { 
            playerName, 
            finalScore,         // This is the base points from stages
            leaderboardScore,   // The score calculated on the frontend
            timeCompleted, 
            stagesCompleted,
            gameMode 
        } = JSON.parse(event.body);
        

        // Basic validation
        if (!playerName || typeof leaderboardScore !== 'number' || typeof finalScore !== 'number') {
            throw new Error('Missing or invalid required fields: playerName, finalScore, leaderboardScore.');
        }
        
        const item = {
            id: `${Date.now()}-${playerName.replace(/\s+/g, '-')}`, // More unique ID
            playerName,
            finalScore,         // Storing base points
            leaderboardScore,   // Storing the calculated leaderboard score
            timeCompleted,
            stagesCompleted,
            gameMode: gameMode || 'escape-room', // Use provided gameMode or default
            createdAt: new Date().toISOString(),
            // Set item to expire after 30 days
            ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) 
        };
        
        console.log('Saving item to DynamoDB:', JSON.stringify(item, null, 2));

        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: item
        }).promise();
        
        // A DynamoDB Scan is inefficient for large tables. 
        // For production, consider using a Global Secondary Index (GSI) on 'leaderboardScore'.
        // However, for a small leaderboard, Scan is acceptable.
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'gameMode = :mode',
            ExpressionAttributeValues: {
                ':mode': item.gameMode
            }
        }).promise();
        
        const topScores = result.Items
            .sort((a, b) => b.leaderboardScore - a.leaderboardScore)
            .slice(0, 10);
            
        // Find the new player's rank among the top scores.
        const playerRank = topScores.findIndex(score => score.id === item.id) + 1;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Adjust for production if needed
            },
            body: JSON.stringify({
                success: true,
                message: 'Score saved successfully.',
                leaderboard: topScores,
                // If player is not in top 10, rank will be 0, which is a clear indicator.
                playerRank: playerRank 
            })
        };
        
    } catch (error) {
        console.error('Error processing leaderboard:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to process leaderboard data.',
                message: error.message
            })
        };
    }
};