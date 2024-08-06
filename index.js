
process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 0;
const https = require('https');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Route
const GitlabRoute = require('./routes/GitlabRouter');
const GithubRoute = require('./routes/GithubRouter');

app.use('/webhook', GitlabRoute );
app.use('/github', GithubRoute );

app.get('/', function (req, res) {
  res.json({
    status: 666,
    body: 'Developed by Steve',
    git: 'https://github.com/huuhieu17',
  })
})

app.listen(process.env.PORT || 3002);

console.log("App started")


