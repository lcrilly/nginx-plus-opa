# nginx-plus-opa

Demonstration of NGINX Plus as an Open Policy Agent enforcement point

## Description

This repository provides a demo environment for NGINX Plus in an [Open Policy Agent](https://www.openpolicyagent.org/) environment. It is based on the [HTTP API tutorial](https://www.openpolicyagent.org/docs/latest/http-api-authorization/).

Demo
----

### Prerequisites

 - Docker runtime and docker-compose
 - NGINX Plus Docker image with `njs` module loaded (tagged as nginx-plus:latest)

### Environment

NGINX Plus is configured as an API gateway for 2 different backend APIs.

 - Finance API at `/finance/`: private, protected by authentication and OPA policy
 - Warehouse API at `/warehouse/`: public, no protection

 NGINX Plus communicates directly to an [Open Policy Agent daemon](https://www.openpolicyagent.org/docs/latest/#running-opa) on the local network.
```
                                           +-----------------+
                                       +---|   Finance API   |
                                       |   +-----------------+
+--------+          +--------------+   |
| Client |-----:9000|  nginx_plus  |---|   +-----------------+
+--------+          +-------+------+   +---|  Warehouse API  |
                       :8181|              +-----------------+
                    +-------+------+                        
                    |  OPA daemon  |
                    +--------------+
```

### Installation and Preparation

1. Clone this repo and `cd` into it
2. Start the Docker containers (this will pull `openpolicyagent/opa:latest`)
```shell
docker-compose up -d
```
3. Apply the finance-salaries policy to the OPA daemon
```shell
curl -X PUT --data-binary @salaries.rego localhost:8181/v1/policies/example
```
4. Configure NGINX Plus so that it knows how to make a policy query for salaries
```shell
curl -d '{"/finance/salary/":"httpapi.authz"}' localhost:8080/api/6/http/keyvals/opa_package

curl -d '{"/finance/salary/":"method=request_method path=request_uri user=remote_user"}' localhost:8080/api/6/http/keyvals/opa_query
```

### Demo Steps

1. Make a test API call to the unprotected Warehouse API
```shell
curl -i localhost:9000/warehouse/inventory
```
2. Check that Alice can make an API call for her own Salary, observe OPA decision ID in response headers
```shell
curl -i --user alice:password localhost:9000/finance/salary/alice
```
3. Check that Alice cannot see Bob's salary (with OPA decision)
```shell
curl -i --user alice:password localhost:9000/finance/salary/bob
```

Experiment with other requests as per the policy defined in `salaries.rego`.
