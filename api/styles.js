// api/styles.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const css = `
    :root {
      --primary-color: #ff6b6b;
      --secondary-color: #4ecdc4;
      --accent-color: #45b7d1;
      --background-color: #f8f9fa;
      --text-color: #2c3e50;
      --border-color: #e9ecef;
      --success-color: #28a745;
      --error-color: #dc3545;
      --warning-color: #ffc107;
      --gradient-primary: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
      --gradient-secondary: linear-gradient(135deg, #45b7d1 0%, #96ceb4 100%);
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --shadow-hover: 0 8px 15px rgba(0, 0, 0, 0.2);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background: var(--gradient-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    header h1 i {
      color: var(--secondary-color);
      margin-right: 10px;
    }

    header p {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .shorten-container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: var(--shadow-hover);
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--text-color);
    }

    .form-group input {
      width: 100%;
      padding: 15px;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    .btn-primary {
      width: 100%;
      padding: 15px;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }

    .btn-primary i {
      margin-right: 8px;
    }

    #out {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid var(--primary-color);
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }

    footer {
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 15px;
      }
      
      header h1 {
        font-size: 2rem;
      }
      
      .shorten-container {
        padding: 25px;
      }
    }
  `;

  return new Response(css, {
    headers: {
      'content-type': 'text/css',
      'cache-control': 'public, max-age=31536000'
    }
  });
}
