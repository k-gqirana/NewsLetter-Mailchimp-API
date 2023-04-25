require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express();
const mailchimp = require("@mailchimp/mailchimp_marketing");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});
app.post("/", function (req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.secondName;
  var email = req.body.email;

  var data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data);
  const url = process.env.MAIL_CHIMP_LIST_URL;
  const options = {
    method: "POST",
    auth: process.env.MAIL_CHIMP_AUTH,
  };
  const request = https.request(url, options, function (response) {
    mailchimp.setConfig({
      apiKey: process.env.MAIL_CHIMP_API,
      server: "us18",
    });

    async function run() {
      const response = await mailchimp.ping.get();
      console.log(response);
    }

    run();
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});
app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
