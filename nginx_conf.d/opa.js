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







/*
function buildQueryWithLoop(r) {
    r.log("OPA $opa_config = " + r.variables.opa_config);
    var c, q = {};
    var kvpairs = r.variables.opa_config.split(' ');

    for (var i = 0; i < kvpairs.length; i++) {
        r.log("OPA config: " + kvpairs[i]);
        c = kvpairs[i].split('=');
        if (c[0].includes("path")) {
            q[c[0]] = r.variables[c[1]].substring(1).split('/'); // Convert path segments to array
        } else {
            q[c[0]] = r.variables[c[1]];
        }
    }
    r.log("OPA query builder: " + JSON.stringify(q));
    return(JSON.stringify(q));
}
*/