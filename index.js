// BASIC LAMBDA IMPLEMENTATION USING
// - POSTMAN: SERVING AS FRONTEND
// - API GATEWAY: TO BE CONSUMED BY THE LAMBDA FUNCTION
// - LAMBA FUNCTION: TO SERVCE AS MICROSERVICE
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const dynamo = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'test-product-inventory';
const healthPath = '/health';
const productPath = '/product';
const productsPath = '/products';

exports.handler = async function(event) {
    console.log('Request event: ', event);
    let response;

    switch(true) {
        case event.httpMethod === 'GET' && event.path === healthPath:
            response = buildResponse(200);
            break;
        case event.httpMethod === 'GET' && event.path === productPath:
            response = await getProduct(event.queryStringParameters.productId);
            break;
        case event.httpMethod === 'GET' && event.path === productsPath:
            response = await getProducts();
            break;
        case event.httpMethod === 'POST' && event.path === productPath:
            response = await saveProduct(JSON.parse(event.body));
            break;
        case event.httpMethod === 'PATCH' && event.path === productPath:
            const requestBody = JSON.parse(event.body);
            response = await modifyProduct(requestBody.productId, requestBody.updateKey, requestBody.updateValue);
            break;
        case event.httpMethod === 'DELETE' && event.path === productPath:
            response = await deleteProduct(JSON.parse(event.body).productId)
            break;
    }
    return response;
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }
}

async function getProduct(productId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        }
    }
    return await dynamo.get(params).promise().then((response) => {
        return buildResponse(200, response.Item);
    }, (error) => {
        console.error(error);
    });
}

async function getProducts() {
    const params = {
        TableName: dynamodbTableName
    }
    const allProducts = await scanDynamoRecords(params, []);
    const body = {
        products: allProducts
    }
    return buildResponse(200, body);
}

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamo.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;

    } catch(error) {
        console.error(error)
    }
}

async function saveProduct(requestBody) {
    const params = {
        TableName: dynamodbTableName,
        Item: requestBody
    }
    return await dynamo.put(params).promise().then(() => {
        const body = {
            Operation: 'SAVE',
            Message: 'SUCCESS',
            Item: requestBody
        }
        return buildResponse(200, body);

    }, (error) => {
        console.error(error);
    })
}

async function modifyProduct(productId, updateKey, updateValue) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        },
        UpdateExpression: `set ${updateKey} = :value`,
        ExpressionAttributeValues: {
            ':value': updateValue
        },
        ReturnValues: 'UPDATED_NEW'
    }
    return await dynamo.update(params).promise().then((response) => {
        const body = {
            Operation: 'UPDATE',
            Message: 'SUCCESS',
            Item: response
        }
        return  buildResponse(200, body);

    }, (error) => {
        console.error(error);
    })
}

async function deleteProduct(productId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        },
        ReturnValues: 'ALL_OLD'
    }
    return await dynamo.delete(params).promise().then((response) => {
        const body = {
            Operation: 'DELETE',
            Message: 'SUCCESS',
            Item: response
        }
        return buildResponse(200, body);
    }, (error) => {
        console.error(error);
    })
}