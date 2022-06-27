const express = require('express')
const crypto = require('crypto');
let { products } = require('./data')
//const exphdbs = require('express-handlebars');
//var path = require('path');
const handlebars = require('express-handlebars');
//app.set('view engine', 'handlebars');
const app = express()
app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'index',
}));
app.use(express.static('public'))


//app.set('views', path.join(__dirname, "views"));
//app.engine('handlebars', exphdbs.engine({defaultLayout: 'main'}));
//app.set('view engine', 'handlebars');
//app.use(express.static('./views'))


app.get('/', (req, res) => {
    res.render('main', {"products": products});
})

app.post('/', (req, res) => {
    res.render('main', {"products": products});
})

app.get('/returnUrl', (req, res) => {
    
    var {resultCode} = req.query;
    if (resultCode == 0)
    {
        res.render('return', {layout: 'result', "message": "thành công"});
    }
    else
    {
        res.render('return', {layout: 'result', "message": "thất bại"});
    }
    
})

/*app.post('/returnUrl', (req, res) => {
    console.log('user hit the returnUrl')
    res.render('return', {layout: 'result'});
})*/

app.get('/notifyUrl', (req, res) => {
    
    res.status(200).send('Thanh toan thanh cong')
})

app.post('/notifyUrl', (req, res) => {
   
    res.status(200).send("ok")
})


app.post('/payment', (req, res) => {
    
    var {price, info} = req.query;
    console.log(price);
    var partnerCode = "MOMO6ORU20220626";
    var accessKey = "gEHSezk7hvD38i7Q";
    var secretkey = "KXvXWPusKEfT89o74PIXi2ZicX1Wfgou";
    var requestId = partnerCode + new Date().getTime();
    var orderId = requestId;
    var orderInfo = "Thanh toan momo san pham " + info;
    var redirectUrl = "https://momo-ec09.herokuapp.com//returnUrl";
    var ipnUrl = "https://momo-ec09.herokuapp.com//notifyUrl";
    // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    var amount = price;
    var requestType = "captureWallet"
    var extraData = ""; //pass empty value if your merchant does not have stores
    
    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId+"&requestType=" + requestType
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    var signature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
        lang: 'en'
    });
    //Create the HTTPS objects
    const https = require('https');
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    }
    //Send the request and get the response
    
    req = https.request(options, res2 => {
        console.log(`Status: ${res2.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res2.headers)}`);
        res2.setEncoding('utf8');
        res2.on('data', (body) => {
            console.log('Body: ');
            console.log(body);
            console.log('payUrl: ');
            console.log(JSON.parse(body).payUrl);
            res.redirect(JSON.parse(body).payUrl);
            
        });
        res2.on('end', () => {
            console.log('No more data in response.');
            
        });
    })

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        
    });
    // write data to request body
    
    console.log("Sending.....")
    req.write(requestBody);
    
    req.end();
    
    
})

app.listen(process.env.PORT, () => {
    
})

