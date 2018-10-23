# SenneS Server Application

This repository contains the code for the SenneS server application. 
The server is simplemented in node and uses MongoDB to store its data.
The databaes will only store delta updates of encrypted data.
For communication a REST-API will be implemented.

## Documentation

All requests take place over ```http://<server_url>/api?req=<json_object>```, where ```<json_object>``` is a JSON object that describes the individual request. 
All responses will be in JSON format.
Every request contains a ```fridge_id``` which determins the individual fridge, as well as a ```method``` field, which determines the intended function. 
Since data is stored only in deltas, every delta contains a monotonically increasing ```state```. 

In addition to the fridge data which is stored at the server the server provides access to a barcode database.
The local database will be stored in MongoDB, if an entry is missing it is queried by third-party sources.

To secure the API secret keys should be included in further iterations. 

### Request updates from state ```i```
```
{
    "fridge_id" : <fridge_id>,
    "method" : "get_updates",
    "state" : i
}
```
If no state is provided all updates will be transmitted.

#### Result
```
{
    "fridge_id" : <fridge_id>,
    "method" : "get_delta",
    "prev_state" : <i>,
    "new_state" : <j>,
    "updates" : [
        <BLOB>,
        ...
    ],
    "error" : null
}
```
Where ```j``` is the current ```state```, which should be stored locally.

### Add update to fridge
```
{
    "fridge_id" : <fridge_id>,
    "method" : "add_update",
    "update" : <BLOB>
}
```

#### Result
```
{
    "fridge_id" : <fridge_id>,
    "error" : null
}
```

### Request barcode
```
{
    "method" : "barcode_info",
    "barcodes" : [
        <barcode>,
        ...
    ]
}
```
#### Result
```
{
    "info" : [
        {
            "barcode" : <barcode>,
            "info" : <JSON>
        },
        ...
    ],
    "error" : null
}
```

### Error occurence:
In case of any error the following object will be returned:
```
{
    "error" : <error_code>,
    "error_msg" : <error_message>
}
```
