import { create, urlSource } from "ipfs-http-client";

const auth =
  "Basic " +
  Buffer.from(
    process.env.REACT_APP_INFURA_ID +
      ":" +
      process.env.REACT_APP_INFURA_SECRET_KEY
  ).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const uploadIpfs = async <T>(data: T) => {
  const result = await client.add(JSON.stringify(data));

  console.log("upload result ipfs", result);
  return "ipfs://" + result.path;
};

export const uploadFromURLToIpfs = async (url: string) => {
  const result = await client.add(urlSource(url));

  console.log("upload result ipfs", result);
  return "ipfs://" + result.cid.toString();
};
