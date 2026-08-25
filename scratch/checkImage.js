const https = require('https');
const url = 'https://pdf-storage-prime.s3.eu-north-1.amazonaws.com/ecommerce/1739818817342-men%20black%20tee.jpg'; // example URL from typical product
https.get(url, (res) => {
    console.log('Size:', res.headers['content-length'] / 1024 / 1024, 'MB');
});
