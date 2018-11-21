const express = require('express');
const WebSocket = require('ws');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = "mongodb+srv://SenneS_Admin:SenneS2018@sennescluster-onimy.mongodb.net/SenneSDB";

// Database name
const dbName = "SenneSDB";

// Create a global variable for database access
var dbClient;

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
        let response = getUpdates(fridge_id, state);
        response.error = null;
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
        let state = addUpdate(fridge_id, update);
        res.send({
            new_state : state,
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
                info : getBarcodeInfo(barcodes[ind])
            });
        }
        res.send(result);
    }
}

// This function should return the response for the get_updates method.
function getUpdates(fridgeId, state) {
    // TODO: Actual database access
    return {
        new_state : state + 1,
        updates : [
            'ABC',
        ]
    };
}

// This function saves the update to the database and should return the new state.
function addUpdate(fridgeId, update) {
    // TODO: Actual save the update and determine new state
    return 1;
}

// This function should query the digit-eyes.com database for the given barcode
function getBarcodeInfo(barcode) {

    // Query for UPCitemdb database
    var query = "https://api.upcitemdb.com/prod/trial/lookup?upc="+barcode;

    const options = {
        url: query,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    };

    // Parse the barcode information
    request(options, function(err, res, body) {
        var barcodeInfo = JSON.parse(body);
        console.log(barcodeInfo);

        // Store the returned JSON object in the Barcodes database
        const collection = dbClient.collection("Barcodes");
        collection.insertOne(barcodeInfo, function(err, res) {
         if (err) throw err;
         console.log("Barcodes DB Updated");

         // ***************************** 
         // I am not sure how to use callback so can't get it to return the barcodeInfo object
         //callback(barcodeInfo);
        });
    });
}

// Start server at port 3000
app.listen(3000);
