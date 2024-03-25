
  //Script change url
const { exec } = require('child_process');
const fs = require('fs');

// Chạy ngrok và lắng nghe output
const ngrokProcess = exec('ngrok http 5000');

ngrokProcess.stdout.on('data', (data) => {
    // Tìm và lấy URL forwarding từ output của ngrok
    const forwardingUrl = data.toString().match(/https:\/\/[a-zA-Z0-9]*\.ngrok\.io/);
    
    if (forwardingUrl) {
        // Cập nhật biến URL trong file app.js của project React Native
        const newUrl = forwardingUrl[0];
        const appJsPath = 'path/to/your/app.js'; // Thay đổi đường dẫn tới file app.js
        
        fs.readFile(appJsPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            const updatedData = data.replace(/const serverUrl = '[^']*'/, `const serverUrl = '${newUrl}'`);

            fs.writeFile(appJsPath, updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return;
                }
                
                console.log('URL updated successfully:', newUrl);
            });
        });
    }
});