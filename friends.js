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
  return `${styleBlock}<div ${weArentCaveBlobs}><h2>Hello World!</h2><h3>I'm Bloby \ud83e\udd21 and these are my friends.</h3> <div ${friendStyles}>${friendString}</div> <div>Simply refresh the page if you need help with anything and it will magically appear!</div></div>`
}

function findAFriend() {
  const newFriendFaceIndex = Math.floor(Math.random() * faces.length);
  return faces[newFriendFaceIndex];
}

export {
  blobsToBlobysFriends,
  findAFriend,
};

// TODO: hack until / if I add page-wide styles (PRs welcome!)
const weArentCaveBlobs = "style=\"font-family:Roboto;\""
const styleBlock = "<style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');</style>"
const friendStyles = "style=\"margin-bottom:20px;\""
