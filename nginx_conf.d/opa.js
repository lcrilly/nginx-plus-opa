export default { packageUri, simpleQuery }

function packageUri(r) {
    return("/v1/data/" + r.variables.opa_package_kv.replace('.', '/'));
}

function simpleQuery(r) {  
    var query = {input: buildQuery(r)};
    r.subrequest("/_send_opa_query", {method: "POST", body: JSON.stringify(query)})
        .then(reply => JSON.parse(reply.responseBody))
        .then(response => {
            r.headersOut['decision-id'] = response.decision_id;
            if (response.result.allow) {
                r.return(204);
            } else {
                r.return(403);
            }

        })
        .catch(e => r.return(401));
}

// Convert name=value pairs into JSON object
function buildQuery(r) {
    var pairs = r.variables.opa_query.split(' ');
    var query = pairs.reduce(function(prev,curr){
        var kv = curr.split('=');
        prev[kv[0]]=r.variables[kv[1]];
        return prev;},{})
    if (typeof(query.path) != "undefined") query.path = query.path.substring(1).split('/'); // Special treatment for 'path': convert to array
    r.log("OPA query builder: " + JSON.stringify(query));
    return(query);
}
