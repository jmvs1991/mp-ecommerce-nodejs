var express = require("express");
var exphbs = require("express-handlebars");
var mercadopago = require("mercadopago");
var url = require("url");

var port = process.env.PORT || 3000;

var app = express();

mercadopago.configure({
  access_token:
    "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.get("/payment/success", function (req, res) {
  console.log(req.query);
  res.send("Pago ok");
});

app.get("/payment/failure", function (req, res) {
  console.log(req.query);
  res.send("Pago fallo");
});

app.get("/payment/pending", function (req, res) {
  console.log(req.query);
  res.send("Pago pendiente");
});

app.post("/detail", async function (req, res) {
  const { title, price, unit, img } = req.body;
  const { host } = req.headers;

  var preference = {
    external_reference: "josevasquez.dev@gmail.com",
    auto_return: "approved",
    notification_url: `${host}/payment/ipn`,
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
    },
    items: [
      {
        id: "1234",
        title: title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number.parseFloat(price),
        picture_url: img,
      },
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333,
      },
      address: {
        street_name: "False",
        street_number: 123,
        zip_code: "1111",
      },
    },
    back_urls: {
      success: `${host}/payment/success`,
      failure: `${host}/payment/failure`,
      pending: `${host}/payment/pending`,
    },
  };
  console.log(preference);

  const result = await mercadopago.preferences.create(preference);
  const { status } = result;
  if (status === 201) {
    const { response } = result;
    const { init_point } = response;
    res.redirect(init_point);
  } else {
    res.render("home");
  }
});

app.post("/payment/ipn", function (req, res) {
  console.log(req.body);
});

app.listen(port);
