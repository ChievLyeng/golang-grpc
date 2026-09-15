# golang-grpc

Practice project exploring gRPC and HTTP communication across services:

- `KITCHEN/` — Go services (`orders`, `kitchen`) communicating over gRPC, with an HTTP endpoint on Orders for direct testing
- `node-gateway/` — Node.js/Express REST gateway that calls the Go Orders service over gRPC
- `proto/` — shared `.proto` contract used by both the Go and Node sides
