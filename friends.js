import { faces } from './faces.js';
import { streamToText } from './utils.js';

async function getFriends(containerClient) {
  const friends = [];

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

async function blobsToBlobysFriends(containerClient) {
  let friends = [faces[0], faces[1]];
  try {
    friends = await getFriends(containerClient);
  } catch (error) {
    console.error(error);
  }

  const friendString = friends.join("\uD83D\uDE4F");
  return `<h3>I'm Bloby \ud83e\udd21 and these are my friends.<h3> <div>${friendString}</div> <div>Simply refresh the page if you need help with anything and it will magically appear!</div>`
}

function findAFriend() {
  const newFriendFaceIndex = Math.floor(Math.random() * faces.length);
  return faces[newFriendFaceIndex];
}

export {
  blobsToBlobysFriends,
  findAFriend,
};
