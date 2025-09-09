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

    /* Historial */
    .history-container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: var(--shadow-hover);
      margin-top: 30px;
    }

    .history-container h2 {
      color: var(--text-color);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-secondary {
      background: var(--gradient-secondary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-bottom: 20px;
      transition: transform 0.3s ease;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .history-item {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      background: #f8f9fa;
      transition: box-shadow 0.3s ease;
    }

    .history-item:hover {
      box-shadow: var(--shadow);
    }

    .history-info {
      margin-bottom: 15px;
    }

    .history-url {
      margin-bottom: 10px;
    }

    .history-url strong {
      color: var(--primary-color);
      font-size: 1.1rem;
    }

    .history-original {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-top: 5px;
      word-break: break-all;
    }

    .history-stats {
      display: flex;
      gap: 20px;
      font-size: 0.9rem;
      color: #666;
    }

    .history-stats span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .history-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .btn-action:hover {
      transform: translateY(-1px);
    }

    .btn-action.edit {
      background: var(--warning-color);
      color: white;
    }

    .btn-action.stats {
      background: var(--accent-color);
      color: white;
    }

    .btn-action.delete {
      background: var(--error-color);
      color: white;
    }

    /* Resultados */
    .result-container {
      margin-top: 20px;
      display: none;
    }

    .result {
      padding: 15px;
      border-radius: 8px;
      font-weight: 500;
    }

    .result.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .result.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .result.loading {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    /* Modal de estadísticas */
    .stats-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .stats-content {
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
      box-shadow: var(--shadow-hover);
    }

    .stats-content h3 {
      color: var(--text-color);
      margin-bottom: 20px;
    }

    .stats-info p {
      margin-bottom: 10px;
      color: var(--text-color);
    }

    .no-data {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 15px;
      }
      
      header h1 {
        font-size: 2rem;
      }
      
      .shorten-container, .history-container {
        padding: 25px;
      }

      .history-actions {
        flex-direction: column;
      }

      .btn-action {
        justify-content: center;
      }

      .history-stats {
        flex-direction: column;
        gap: 10px;
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
