const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.LEADERBOARD_TABLE || 'coder-web-leaderboard';

exports.handler = async (event) => {
    console.log('Processing leaderboard data:', JSON.stringify(event, null, 2));
    
    try {
        const { playerName, finalScore, timeCompleted, stagesCompleted } = JSON.parse(event.body);
        
        // Calculate leaderboard score (70% accuracy, 30% speed)
        const accuracyScore = (stagesCompleted / 4) * 100;
        const speedScore = Math.max(0, 100 - (timeCompleted / 30)); // 30 minutes max
        const leaderboardScore = Math.round((accuracyScore * 0.7) + (speedScore * 0.3));
        
        const item = {
            id: Date.now().toString(),
            playerName,
            finalScore,
            leaderboardScore,
            timeCompleted,
            stagesCompleted,
            gameMode: 'escape-room',
            createdAt: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
        };
        
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: item
        }).promise();
        
        // Get top 10 scores
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'gameMode = :mode',
            ExpressionAttributeValues: {
                ':mode': 'escape-room'
            }
        }).promise();
        
        const topScores = result.Items
            .sort((a, b) => b.leaderboardScore - a.leaderboardScore)
            .slice(0, 10);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                leaderboard: topScores,
                playerRank: topScores.findIndex(score => score.id === item.id) + 1
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
                error: 'Failed to process leaderboard data'
            })
        };
    }
};

