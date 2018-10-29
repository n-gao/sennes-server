const express = require('express');
const app = express();

app.get('/api', function(req, res) {
    let req_obj;
    try {
        req_obj = JSON.parse(req.query['request']);
    } catch (e){
        res.send({
            error : 1,
            error_msg : 'Request object not provided or not in JSON format.'
        });
        return;
    }
    let method = req_obj.method;
    console.log(method);
    if (!(method in methods)) {
        res.send({
            error : 2,
            error_msg : 'No method specified or method not existing.'
        });
    } else {
        methods[method](req_obj, res);
    }
});

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

app.listen(3000);
