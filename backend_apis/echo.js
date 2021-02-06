export default {echo}

function echo(r) {
    var headers = {};
    for (var h in r.headersIn) {
        headers[h] = r.headersIn[h];
    }

    var req = { "client": r.variables.remote_addr, "port": Number(r.variables.server_port), "host": r.variables.host, "method": r.variables.request_method, "uri": r.uri, "httpVersion": r.httpVersion, "headers": headers, "body": r.variables.request_body }
    var res = { "status": Number(r.variables.return_code), "timestamp": r.variables.time_iso8601 }

    r.return(Number(r.variables.return_code), JSON.stringify({ "request": req, "response": res }) + '\n');
}
