const express = require('express');
const WebSocket = require('ws');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

// We will also provide a websocket for better communication
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
      messageHandling(message, {
          send : obj => ws.send(JSON.stringify(obj))
      });
  });

  ws.send('something');
});

// Default route for webserver
app.get('/api', function(req, res) {
    // Try to parse the request object
    messageHandling(req.query['request'], res);
});

function messageHandling(requestObjectString, res) {
    let req_obj;
    try {
        req_obj = JSON.parse(requestObjectString);
    } catch (e){
        // Catch errors
        res.send({
            error : 1,
            error_msg : 'Request object not provided or not in JSON format.'
        });
        return;
    }
    // Determin method
    let method = req_obj.method;
    console.log(method);
    if (!(method in methods)) {
        res.send({
            error : 2,
            error_msg : 'No method specified or method not existing.'
        });
    } else {
        // Call method
        methods[method](req_obj, res);
    }
}

// Dictionary containing all methods
let methods = {

    'get_updates' : (req, res) => {
        // Getting fridge id
        let fridge_id = req.fridge_id;
        if (fridge_id === undefined || isNaN(fridge_id)) {
            res.send({
                error : 3,
                error_msg : 'fridge_id not specified.'
            });
            return;
        }
        // Getting the state
        let state = req.state;
        if (isNaN(state) || state === undefined) {
            state = 0;
        }
        // TODO: Change to actual database access
        let response = {
            new_state : state + 1,
            updates : [
                'ABC'
            ],
            error : null
        }
        res.send(response);
    },

    'add_update' : (req, res) => {
        // Getting fridge id
        let fridge_id = req.fridge_id;
        if (fridge_id === undefined || isNaN(fridge_id)) {
            res.send({
                error : 3,
                error_msg : 'fridge_id not specified.'
            });
            return;
        }
        // Gett update BLOB
        let update = req.update;
        if (update === undefined) {
            res.send({
                error : 4,
                error_msg : 'No update blob provided.'
            });
            return;
        }
        // TODO: Saving
        res.send({
            error : null
        });
    },

    'barcode_info' : (req, res) => {
        // Getting barcodes
        let barcodes = req.barcodes;
        console.log(barcodes);
        if (barcodes === undefined || !Array.isArray(barcodes)) {
            res.send({
                error : 5,
                error_msg : 'The barcodes parameter is required and must be an array of barcodes.'
            });
            return;
        }
        // Build response
        let result = {
            info : [],
            error : null
        }
        for (var ind in barcodes) {
            result.info.push({
                barcode : barcodes[ind],
                // Do actual database access to receive informations.
                info : {}
            });
        }
        res.send(result);
    }
}

// Start server at port 3000
app.listen(3000);
