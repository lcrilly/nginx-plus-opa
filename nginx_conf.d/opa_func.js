export default { simpleQuery }

function simpleQuery(r) {
    var query = {};
    query.input = {
        method: r.variables.request_method,
        path: r.variables.request_uri.substring(1).split('/'),
        user: "alice"
    };
    r.log("OPA query: " + JSON.stringify(query));

    var subreqOptions = {
        method: "POST",
        body: JSON.stringify(query)
    };

    r.subrequest("/_send_opa_query", subreqOptions,
        function(reply) {
            r.log("OPA response: " + reply.responseBody);
            if (reply.status == 200) {
                var response = JSON.parse(reply.responseBody);
                if (response.result.allow == true) {
                    r.return(204);
                } else {
                    r.return(403);
                }
            } else {
                r.return(401); // Unexpected response, return 'auth required'
            }
        }
    );
}
