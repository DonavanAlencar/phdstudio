const https = require('https');

const token = "EAALiGcJMMZB4BQbsxMjNnqncZCCMwMFMhEz5ZAkDFynO2sZCrn1Jh9bvCmCvo8Ba8TZCBVBrtqZBB2DLHcpXERQwO8DOhdTdgXgrIg96VzQtTen3tgXbfphhWuTRT5YNXe6KmZBDSjbJ50IXU7ZCprW0llyZBYHKDft1QZAdbXcCZC9WHl6khWlPgr2XLx2hZAl25o75ZArAH9aaJouEIUzBBWZAL2k65jJkGB6tV0eSUoPxQNX08ZA8YzsAIkcF0DBWDxXmLy5efkFmEuQAwV6OzcPSZBQllFM9sarZBejprludnnMd2EODo2I6mPpM8PPRApFkZC8HZA9E8XZCspSToGoVvZBdRqoIZD";
const userId = "17841403453191047";
const url = `https://graph.facebook.com/v19.0/${userId}/media?fields=id&access_token=${token}`;

console.log("Testing URL:", url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Body:", data);
    });
}).on("error", (err) => {
    console.log("Error:", err.message);
});
