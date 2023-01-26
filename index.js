// S01E05
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from "@azure/storage-blob";
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { blobsToBlobysFriends, findAFriend } from './friends.js';

const app = express()
const port = process.env.PORT || 4000

async function main() {
  // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-azure-cli#download-blobs
  console.log("Azure Blob storage v12 - JavaScript quickstart sample ");

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) throw Error('Azure Storage accountName not found');

  // Use The Recommended DefaultAzureCredential()
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerName = 'friend-locker';
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  console.log(
    `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
  );

  // Create a unique name for the blob
  const blobName = 'blob' + uuidv4() + '.friend';
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  console.log(
    `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
  );

  // Upload the blob
  const data = findAFriend();
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(
    `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
  );

  // // Get blob content from position 0 to the end
  // // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  // // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
  // const downloadBlockBlobResponse = await blockBlobClient.download(0);
  // const response = await streamToText(downloadBlockBlobResponse.readableStreamBody)
  const allMyFriends = await blobsToBlobysFriends(containerClient);
  return allMyFriends;
}

app.get('/', (req, res) => {
  main()
    .then((response) => res.send(response))
    .catch((ex) => res.send(ex.message));
})

app.get('/health', (req, res) => {
  res.send('200: OK');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

