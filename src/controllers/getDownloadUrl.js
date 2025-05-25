async function checkDownloadStatus(baseUrl) {
    let checkAdded = false;
    let waitingForResponse = false;
    let intervalId;
    let url = baseUrl;

    async function makeRequest(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'X-Referer': 'https://mp3beast.cc/download/I5WBp6IzonQ6ynyjIqxlfQ/',
                    'Origin': 'https://mp3beast.cc',
                    'Referer': 'https://mp3beast.cc/download/I5WBp6IzonQ6ynyjIqxlfQ/',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'cross-site'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error making request:', error);
            throw error;
        }
    }

    async function updateStatus() {
        if (waitingForResponse) return;
        waitingForResponse = true;

        try {
            const response = await makeRequest(url);
            
            switch (response.status) {
                case "finished":
                    console.log('Status: Ссылка получена');
                    clearInterval(intervalId);
                    return response.download;

                default:
                    if (!checkAdded) {
                        url = baseUrl + "&check";  // Добавление &check только после первого запроса
                        checkAdded = true;
                    }
                    break;
            }
        } catch (error) {
            console.error('Error updating status:', error);
            clearInterval(intervalId);
        } finally {
            waitingForResponse = false;
        }
    }

    return new Promise((resolve, reject) => {
        intervalId = setInterval(async () => {
            try {
                const downloadUrl = await updateStatus();
                if (downloadUrl) {
                    clearInterval(intervalId);
                    resolve(downloadUrl);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error);
            }
        }, 3000); // Check every 3 seconds
    });
}

// Example usage
async function main(baseUrl) {
    try {
        const downloadUrl = await checkDownloadStatus(baseUrl);
        console.log('Final download URL:', downloadUrl);
        return downloadUrl;
    } catch (error) {
        console.error('Error:', error);
    }
}

main('https://cdn.odt-converter.com/download.php?id=Z041ZXhBUDlGdlA&token=fTI0MTQ1MTg0NzE6ImV0YWQiLCIzbmRjIjoibmRjIiwiNTMuMi4wMjEuODcxIjoicGkiLCIvXEFtSmE4NDdHMlpoZmxodHphRzhtRVQvXGRhb2xud29kL1wiOiJpcnUiLCJjYy50c2FlYjNwbSI6InRzb2giew');