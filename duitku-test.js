const crypto = require('crypto');

const merchantCode = 'D27412';
const apiKey = 'ea279c7a1381333794d265d70b55693a';
const baseUrl = 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry';

const merchantOrderId = 'SIMB-' + Date.now();
const paymentAmount = 10000;

const signatureStr = merchantCode + merchantOrderId + paymentAmount + apiKey;
const signature = crypto.createHash('md5').update(signatureStr).digest('hex');

const payload = {
    merchantCode,
    paymentAmount,
    merchantOrderId,
    productDetails: 'Test Plan',
    email: 'test@example.com',
    customerVaName: 'TestUser',
    phoneNumber: '081234567890',
    itemDetails: [{ name: 'Test Plan', price: 10000, quantity: 1 }],
    callbackUrl: 'https://simbisdata.vercel.app/api/payment/webhook',
    returnUrl: 'https://simbisdata.vercel.app/dashboard/subscription?payment=success',
    signature,
    expiryPeriod: 1440
};

fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(r => r.json())
    .then(d => {
        console.log("Response:", d);
    })
    .catch(console.error);
