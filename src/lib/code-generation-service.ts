export interface CodeGenerationOptions {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body?: string;
}

export type CodeLanguage = 'curl' | 'javascript' | 'python' | 'axios';

export const codeGenerationService = {
  /**
   * Generate cURL command
   */
  generateCurl(options: CodeGenerationOptions): string {
    const { method, url, headers, body } = options;
    
    let curl = `curl -X ${method.toUpperCase()} '${url}'`;
    
    // Add headers
    const enabledHeaders = headers.filter(h => h.enabled && h.key.trim());
    if (enabledHeaders.length > 0) {
      curl += ' \\\n';
      enabledHeaders.forEach((header, index) => {
        const isLast = index === enabledHeaders.length - 1 && !body;
        curl += `  -H '${header.key}: ${header.value}'${isLast ? '' : ' \\\n'}`;
      });
    }
    
    // Add body
    if (body && body.trim()) {
      curl += ' \\\n';
      // Escape single quotes in the body
      const escapedBody = body.replace(/'/g, "'\\''");
      curl += `  -d '${escapedBody}'`;
    }
    
    return curl;
  },

  /**
   * Generate JavaScript Fetch code
   */
  generateJavaScript(options: CodeGenerationOptions): string {
    const { method, url, headers, body } = options;
    
    let code = `fetch('${url}', {\n`;
    code += `  method: '${method.toUpperCase()}',\n`;
    
    // Add headers
    const enabledHeaders = headers.filter(h => h.enabled && h.key.trim());
    if (enabledHeaders.length > 0) {
      code += `  headers: {\n`;
      enabledHeaders.forEach((header, index) => {
        const comma = index < enabledHeaders.length - 1 ? ',' : '';
        code += `    '${header.key}': '${header.value}'${comma}\n`;
      });
      code += `  }`;
      if (body && body.trim()) {
        code += ',\n';
      } else {
        code += '\n';
      }
    }
    
    // Add body
    if (body && body.trim()) {
      // Try to parse as JSON, if it fails, treat as string
      try {
        JSON.parse(body);
        code += `  body: JSON.stringify(${body})\n`;
      } catch {
        code += `  body: '${body.replace(/'/g, "\\'")}'\n`;
      }
    }
    
    code += `})\n`;
    code += `  .then(response => response.json())\n`;
    code += `  .then(data => console.log(data))\n`;
    code += `  .catch(error => console.error('Error:', error));`;
    
    return code;
  },

  /**
   * Generate Python requests code
   */
  generatePython(options: CodeGenerationOptions): string {
    const { method, url, headers, body } = options;
    
    let code = `import requests\n\n`;
    
    code += `url = '${url}'\n`;
    
    // Add headers
    const enabledHeaders = headers.filter(h => h.enabled && h.key.trim());
    if (enabledHeaders.length > 0) {
      code += `headers = {\n`;
      enabledHeaders.forEach((header, index) => {
        const comma = index < enabledHeaders.length - 1 ? ',' : '';
        code += `    '${header.key}': '${header.value}'${comma}\n`;
      });
      code += `}\n`;
    }
    
    // Add body
    if (body && body.trim()) {
      // Try to parse as JSON
      try {
        JSON.parse(body);
        code += `data = ${body}\n`;
      } catch {
        code += `data = '''${body}'''\n`;
      }
    }
    
    code += `\n`;
    
    // Make request
    const methodLower = method.toLowerCase();
    code += `response = requests.${methodLower}(url`;
    
    if (enabledHeaders.length > 0) {
      code += `, headers=headers`;
    }
    
    if (body && body.trim()) {
      // If it's JSON, use json parameter, otherwise use data
      try {
        JSON.parse(body);
        code += `, json=data`;
      } catch {
        code += `, data=data`;
      }
    }
    
    code += `)\n\n`;
    code += `print(response.json())`;
    
    return code;
  },

  /**
   * Generate Node.js Axios code
   */
  generateAxios(options: CodeGenerationOptions): string {
    const { method, url, headers, body } = options;
    
    let code = `const axios = require('axios');\n\n`;
    
    code += `const config = {\n`;
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}'`;
    
    // Add headers
    const enabledHeaders = headers.filter(h => h.enabled && h.key.trim());
    if (enabledHeaders.length > 0) {
      code += `,\n  headers: {\n`;
      enabledHeaders.forEach((header, index) => {
        const comma = index < enabledHeaders.length - 1 ? ',' : '';
        code += `    '${header.key}': '${header.value}'${comma}\n`;
      });
      code += `  }`;
    }
    
    // Add body
    if (body && body.trim()) {
      code += `,\n  data: `;
      // Try to parse as JSON
      try {
        JSON.parse(body);
        code += body;
      } catch {
        code += `'${body.replace(/'/g, "\\'")}'`;
      }
    }
    
    code += `\n};\n\n`;
    code += `axios(config)\n`;
    code += `  .then(response => console.log(response.data))\n`;
    code += `  .catch(error => console.error('Error:', error));`;
    
    return code;
  },

  /**
   * Generate code based on language
   */
  generate(language: CodeLanguage, options: CodeGenerationOptions): string {
    switch (language) {
      case 'curl':
        return this.generateCurl(options);
      case 'javascript':
        return this.generateJavaScript(options);
      case 'python':
        return this.generatePython(options);
      case 'axios':
        return this.generateAxios(options);
      default:
        return '';
    }
  }
};
