const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Shared contract, owned by no single service — every consumer points here.
const PROTO_PATH = path.join(__dirname, "..", "proto", "orders.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDef);

// One connection to the Go Orders gRPC server, created once and reused
// for every request (same idea as Kitchen's NewGRPCClient(":9000")).
const ordersClient = new proto.OrderService(
  process.env.ORDERS_GRPC_ADDR || "localhost:9000",
  grpc.credentials.createInsecure(),
);

const app = express();
app.use(express.json());

app.post("/orders", (req, res) => {
  const { customerID, productID, quantity } = req.body;

  ordersClient.CreateOrder(
    { customerID, productID, quantity },
    (err, response) => {
      if (err) {
        return res.status(502).json({ error: err.message });
      }
      res.status(201).json(response);
    },
  );
});

app.get("/orders", (req, res) => {
  const customerID = Number(req.params.customerID);

  ordersClient.GetOrders({ customerID }, (err, response) => {
    console.log("response.orders", response.orders);
    if (err) {
      return res.status(502).json({ error: err.message });
    }
    res.json(response.orders ?? []);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Node REST gateway listening on :${PORT}`);
  console.log(
    `Forwarding to Orders gRPC at ${process.env.ORDERS_GRPC_ADDR || "localhost:9000"}`,
  );
});
