# Basic AWS Lambda Function - Implementation
Repository for the basic relationships of AWS Services: Lambda Functions - API Gateway - DynamoDB.

## Requirements
1. AWS Account
1. AWS Lambda Function
1. AWS API Gateway
1. AWS DynamoDB
1. Postman

## Getting Started
1. Create an empty Lambda Function.

1. Create a Role for the AWS Services to consume.  If an existing role is available that covers all AWS Services, use it.

1. Go to API Gateway and create the resources structure and methods (http request: GET, POST, PATCH, DELETE), and then map the created empty Lambda Function.

1.  Go back to the empty Lambda Function, and apply the code implementations per methods.

### Note
To test the script locally, make sure to install AWS SDK.

## Reminders
1. While creating a method in the API Gateway, do not forget to mark the "Use Lambda Proxy Integration" checkbox.

1. Map the Lambda Function to the created method in the API Gateway by typing the Lamba Function Name in the search field.

1. The number of triggers reflected under the Lambda Function overview are the number of API methods created inside the API Gateway.

1. Enviroment Variables can be added under "Configuration > Environment variables" section.

1. As a good practice, always create a "health" resource to check the AWS Cloudwatch status.