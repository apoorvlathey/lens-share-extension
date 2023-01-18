import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useSignMessage,
  useSignTypedData,
} from "wagmi";
import { ethers } from "ethers";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { urlSource } from "ipfs-http-client";
import { config } from "../config";
import LensHubABI from "../abi/LensHub.json";
import { omit, prettyJSON } from "../utils/helpers";
import { Metadata } from "../interfaces/publication";
import { TweetMedia } from "../interfaces/TweetMedia";

const fetchViaContentScript = (msgObj: {
  type: string;
  msg: any;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    // send message to content_script (inject.ts)
    window.postMessage(msgObj, "*");

    // receive from content_script (inject.ts)
    const controller = new AbortController();
    window.addEventListener(
      "message",
      (e: any) => {
        // only accept messages from us
        if (e.source !== window) {
          return;
        }

        if (!e.data.type) {
          return;
        }

        switch (e.data.type) {
          case `res_${msgObj.type}`: {
            const res = e.data.msg.res;

            // remove this listener to avoid duplicates in future
            controller.abort();

            resolve(res);
            break;
          }
        }
      },
      { signal: controller.signal } as AddEventListenerOptions
    );
  });
};

const getDefaultProfile = (ethereumAddress: string): Promise<any> => {
  return fetchViaContentScript({
    type: "GET_DEFAULT_PROFILES",
    msg: {
      ethereumAddress,
    },
  });
};

const getProfiles = (ethereumAddress: string) => {
  return fetchViaContentScript({
    type: "GET_PROFILES",
    msg: {
      ethereumAddress,
    },
  });
};

const generateChallenge = (address: string) => {
  return fetchViaContentScript({
    type: "GET_CHALLENGE",
    msg: {
      address,
    },
  });
};

const authenticate = (address: string, signature: string) => {
  return fetchViaContentScript({
    type: "AUTHENTICATION",
    msg: {
      address,
      signature,
    },
  });
};

const createPostTypedData = (createPostTypedDataRequest: any) => {
  return fetchViaContentScript({
    type: "CREATE_POST_TYPED_DATA",
    msg: {
      createPostTypedDataRequest,
    },
  });
};

// NOTE: keeping ipfs logic in the same file or else build throws error
const uploadIpfs = async (data: any) => {
  const cid = await fetchViaContentScript({
    type: "UPLOAD_IPFS",
    msg: {
      data,
    },
  });

  console.log("upload result ipfs", cid);
  return "ipfs://" + cid;
};

const uploadFromURLToIpfs = async (url: string) => {
  const cid = await fetchViaContentScript({
    type: "UPLOAD_IPFS_FROM_URL",
    msg: {
      url,
    },
  });

  console.log("upload result ipfs", cid);
  return "ipfs://" + cid;
};

// get rendered text from html code
const extractContent = (s: string) => {
  var span = document.createElement("span");
  span.innerHTML = s;
  return span.textContent || span.innerText;
};

type LensContextType = {
  isFetchingProfile: boolean;
  lensHandle?: string;
  lensAvatar?: string;
  profileId?: string;
  createPost: Function;
  postingText?: string;
  isPosting: boolean;
};

export const LensContext = createContext<LensContextType>({
  createPost: () => {},
  isPosting: false,
  isFetchingProfile: false,
});

export const LensProvider = ({ children }: { children?: React.ReactNode }) => {
  const [lensHandle, setLensHandle] = useState<string>();
  const [lensAvatar, setLensAvatar] = useState<string>();
  const [profileId, setProfileId] = useState<string>();

  const toast = useToast();

  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>();
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const { address } = useAccount();

  const { signMessageAsync: signMessage } = useSignMessage({
    onError(error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        position: "bottom-right",
        isClosable: true,
        duration: 4000,
      });
    },
  });
  const { signTypedDataAsync: signTypedData, isLoading: isSigningTypedData } =
    useSignTypedData({
      onSettled(data) {
        setIsPosting(false);
      },
      onError(error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          position: "bottom-right",
          isClosable: true,
          duration: 4000,
        });
      },
    });
  const { writeAsync: postWithSig, isLoading: postTxnIsLoading } =
    useContractWrite({
      mode: "recklesslyUnprepared",
      address: config.lensHubProxy,
      abi: LensHubABI,
      functionName: "postWithSig",
      onError(error, variables, context) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          position: "bottom-right",
          isClosable: true,
          duration: 4000,
        });
      },
      async onSuccess(data, variables, context) {
        toast({
          title: "Transaction initiated",
          status: "info",
          position: "bottom-right",
          isClosable: true,
          duration: 5000,
        });
        await data.wait();
        toast({
          title: "Posted Successfully",
          status: "success",
          position: "bottom-right",
          isClosable: true,
          duration: 5000,
        });
      },
    });

  const login = async () => {
    if (localStorage.getItem("accessToken")) {
      console.log("login: already logged in");
      return;
    }

    console.log("login: address", address);

    // request a challenge from the server
    const challengeResponse = await generateChallenge(address!);
    const signature = await signMessage({
      message: challengeResponse.data.challenge.text,
    });

    const tokens = await authenticate(address!, signature);
    prettyJSON("login: result", tokens.data);
    localStorage.setItem("accessToken", tokens.data.authenticate.accessToken);
    localStorage.setItem("refreshToken", tokens.data.authenticate.refreshToken);
  };

  const createPost = async () => {
    if (!lensHandle) {
      console.log("createPost: no lens handle");
      return;
    }
    await login();

    setLoadingText("Uploading to IPFS");

    const article = document.querySelectorAll("article")[0]; // current tweet (with quotedTweet)
    const tweetText = extractContent(
      article.querySelectorAll('div[data-testid="tweetText"]')![0].innerHTML
    );
    // inclues photos of quotedTweets as well
    const allTweetPhotos = article.querySelectorAll(
      'div[data-testid="tweetPhoto"]'
    );
    const quotedTweet = article.querySelectorAll(
      'div[tabIndex="0"][role="link"]'
    )[0];
    let tweetPhotoUrls: { url: string; mimeType: string }[] = [];
    // filter out current tweet's photos
    for (let i = 0; i < allTweetPhotos.length; i++) {
      if (!quotedTweet.contains(allTweetPhotos[i])) {
        // src is of the following format: https://pbs.twimg.com/media/xxxxxxxxxxx?format=jpg&name=360x360
        let src = allTweetPhotos[i].querySelector("img")!.src;
        // we need to remove the `name` parameter to get image with original size
        const url = new URL(src);
        url.searchParams.delete("name");

        const mimeType = new URLSearchParams(url.search).get("format")!;

        tweetPhotoUrls.push({
          url: url.toString(),
          mimeType: mimeType,
        });
      }
    }

    let image: null | string = null;
    let imageMimeType: null | string = null;
    let media: {
      item: string;
      type: string;
    }[] = [];
    if (tweetPhotoUrls.length > 0) {
      for (let i = 0; i < tweetPhotoUrls.length; i++) {
        media.push({
          item: await uploadFromURLToIpfs(tweetPhotoUrls[i].url),
          type: tweetPhotoUrls[i].mimeType,
        });
      }

      image = media[0].item;
      imageMimeType = media[0].type;
    }

    const ipfsResult = await uploadIpfs({
      version: "1.0.0",
      metadata_id: uuidv4(),
      description: tweetText,
      content: tweetText,
      external_url: null,
      image,
      imageMimeType,
      name: `Post by @${lensHandle}`,
      attributes: [
        {
          traitType: "string",
          value: "post",
        },
      ],
      media,
      appId: "lens-share",
    });
    console.log("create post: ipfs result", ipfsResult);

    const createPostRequest = {
      profileId,
      contentURI: ipfsResult,
      collectModule: {
        freeCollectModule: { followerOnly: false },
      },
    };

    const result = await createPostTypedData(createPostRequest);
    console.log("create post: createPostTypedData", result);

    const typedData = result.data.createPostTypedData.typedData;
    console.log("create post: typedData", typedData);

    const signature = await signTypedData({
      domain: omit(typedData.domain, "__typename"),
      types: omit(typedData.types, "__typename"),
      value: omit(typedData.value, "__typename"),
    });
    const { v, r, s } = ethers.utils.splitSignature(signature);
    await postWithSig!({
      recklesslySetUnpreparedArgs: [
        {
          profileId: typedData.value.profileId,
          contentURI: typedData.value.contentURI,
          collectModule: typedData.value.collectModule,
          collectModuleInitData: typedData.value.collectModuleInitData,
          referenceModule: typedData.value.referenceModule,
          referenceModuleInitData: typedData.value.referenceModuleInitData,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        },
      ],
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetchingProfile(true);

      const res = await getDefaultProfile(address!);
      const defaultProfile = res.data.defaultProfile;

      let profile: any;
      if (defaultProfile) {
        profile = defaultProfile;
      } else {
        const res = await getProfiles(address!);
        profile = res.data.profiles.items[0];
      }

      if (profile) {
        setLensHandle(profile.handle);
        setProfileId(profile.id);
        if (profile.picture) {
          setLensAvatar(profile.picture.original.url);
        }
      } else {
        setLensHandle(undefined);
        setLensHandle(undefined);
      }

      setIsFetchingProfile(false);
    };

    if (address) {
      fetchProfile();
    }
  }, [address]);

  useEffect(() => {
    if (lensHandle) {
      login();
    }
  }, [lensHandle]);

  useEffect(() => {
    if (isSigningTypedData) {
      setLoadingText("Signing");
    }
  }, [isSigningTypedData]);

  useEffect(() => {
    if (postTxnIsLoading) {
      setLoadingText("Posting");
    } else {
      setLoadingText(undefined);
    }
  }, [postTxnIsLoading]);

  useEffect(() => {
    if (loadingText) {
      setIsPosting(true);
    } else {
      setIsPosting(false);
    }
  }, [loadingText]);

  return (
    <LensContext.Provider
      value={{
        isFetchingProfile,
        lensHandle,
        lensAvatar,
        profileId,
        createPost,
        postingText: loadingText,
        isPosting,
      }}
    >
      {children}
    </LensContext.Provider>
  );
};

export const useLens = () => useContext(LensContext);
