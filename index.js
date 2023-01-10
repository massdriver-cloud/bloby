const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');
const { v1: uuidv1 } = require("uuid");
const express = require('express')
require("dotenv").config();

const app = express()
const port = 80

async function main() {
  // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-azure-cli#download-blobs
  console.log("Azure Blob storage v12 - JavaScript quickstart sample ");

  // const AZURE_STORAGE_CONNECTION_STRING =
  //   process.env.AZURE_STORAGE_CONNECTION_STRING;
  // if (!AZURE_STORAGE_CONNECTION_STRING) {
  //   throw Error('Azure Storage Connection string not found');
  // }
  // const blobServiceClient = BlobServiceClient.fromConnectionString(
  //   AZURE_STORAGE_CONNECTION_STRING
  // );

  const credential = new ManagedIdentityCredential(process.env.USER_ASSIGNED_MANAGED_IDENTITY_CLIENT_ID);
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) throw Error('Azure Storage accountName not found');
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );

  // Create a unique name for the container
  const containerName = 'quickstart' + uuidv1();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.create();
  console.log(
    `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
  );

  // Create a unique name for the blob
  const blobName = 'quickstart' + uuidv1() + '.txt';
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  console.log(
    `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
  );

  // https://stackoverflow.com/questions/25707222/print-python-emoji-as-unicode-string
  const data = `Hello, World! \n${blobsToBlobysFriends()}`;
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(
    `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
  );

  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const response = await streamToText(downloadBlockBlobResponse.readableStreamBody)
  return response
}

app.get('/', (req, res) => {
  main()
  .then((response) => res.send(response))
  .catch((ex) => res.send(ex.message));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

async function getFriends(containerClient) {
  const friends = [];

  // dope ... a "for await"... A "for await clover \u clover_emoji"?
  for await (const blob of containerClient.listBlobsFlat()) {
    const blobClient = containerClient.getBlobClient(blob.name);
    const downloadBlockBlobResponse = await blobClient.download();
    const friend = (
      await streamToText(downloadBlockBlobResponse.readableStreamBody)
    );
    friends.push(friend);
  }
  return friends;
}

function blobsToBlobysFriends(containerClient) {
  const friends = getFriends(containerClient)
  return `I'm Bloby and these are my friends. \n ${friends.join("\uD83D\uDE4F")}\nSimply refresh the page if you need help with anything and it will magically appear!`
}

