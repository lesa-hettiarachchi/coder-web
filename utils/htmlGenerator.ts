import { Tab } from '@/types/tabs';

export const generateHTMLFromTab = (tab: Tab): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tab.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .instructions {
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .body-content {
            margin-top: 20px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${tab.title}</h1>
        
        <div class="instructions">
            <h3>Instructions</h3>
            <p>${tab.instructions}</p>
        </div>
        
        <div class="body-content">
            ${tab.body}
        </div>
    </div>
</body>
</html>`;
};

export const generateHTMLFromTabs = (tabs: Tab[]): string => {
  const tabSections = tabs.map((tab, index) => `
    <div class="tab-section" id="tab-${tab.id}">
        <h2>${tab.title}</h2>
        
        <div class="instructions">
            <h3>Instructions</h3>
            <p>${tab.instructions}</p>
        </div>
        
        <div class="body-content">
            ${tab.body}
        </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Tabs - ${tabs.length} tabs</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3498db;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
        }
        .tab-count {
            color: #7f8c8d;
            margin-top: 10px;
        }
        .tab-section {
            margin-bottom: 40px;
            padding: 20px;
            border: 1px solid #e1e8ed;
            border-radius: 8px;
            background-color: #fafbfc;
        }
        .tab-section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .instructions {
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .body-content {
            margin-top: 15px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>All Tabs</h1>
            <div class="tab-count">${tabs.length} tabs total</div>
        </div>
        
        ${tabSections}
    </div>
</body>
</html>`;
};
