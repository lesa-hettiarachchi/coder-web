export const handler = async (event) => {
    const apiUrl = 'http://ec2-54-204-212-68.compute-1.amazonaws.com/api'; 
    // use the url of your own server here
    
    let tabs = [];
    try {
        const response = await fetch(`${apiUrl}/tabs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        tabs = data.data || [];
  
    } catch (error) {
        console.error('Error fetching tabs:', error);
    }
  
    const tableRows = tabs.map(tab => `
        <tr>
            <td>${tab.id}</td>
            <td>${tab.title}</td>
            <td>${new Date(tab.createdAt).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td>
        </tr>
    `).join('');
  
    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tabs List</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f9; }
        .container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007bff; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        p { color: #666; font-size: 0.9em; text-align: center; margin-top: 20px; }
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
                ${tableRows || '<tr><td colspan="3">No data available.</td></tr>'}
            </tbody>
        </table>
        <p>Generated at: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
    </div>
  </body>
  </html>`;
  
    return {
        statusCode: 200,
        headers: { 
            'Content-Type': 'text/html' 
        },
        body: html
    };
  };