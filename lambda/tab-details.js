const https = require('https');

exports.handler = async (event) => {
    // Fetch tabs from your API
    const apiUrl = process.env.API_BASE_URL || 'https://your-domain.com/api';
    
    let tabs = [];
    try {
        const response = await fetch(`${apiUrl}/tabs`);
        const data = await response.json();
        tabs = data.data || [];
    } catch (error) {
        console.log('Error fetching tabs:', error);
    }

    // Generate table rows
    const tableRows = tabs.map(tab => `
        <tr>
            <td>${tab.id}</td>
            <td>${tab.title}</td>
            <td>${new Date(tab.createdAt).toLocaleString()}</td>
        </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Tabs List</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tabs List</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <p>Generated at: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
    };
};
