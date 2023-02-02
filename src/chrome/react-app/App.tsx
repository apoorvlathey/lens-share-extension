import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  HStack,
  Text,
  Box,
  Image,
  Heading,
  Stack,
  VStack,
  Link,
  Center,
  useBoolean,
  Switch,
  FormControl,
  Input,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightAddon,
  Select,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Connector,
  useConnect,
  useAccount,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { supportedChains, config } from "./config";
import useSupportedChain from "./hooks/useSupportedChain";
import { useLens } from "./contexts/LensContext";
import slicedAddress from "./utils/slicedAddress";
import Identicon from "./components/WalletLogin/Identicon";

function App() {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isSupportedChain } = useSupportedChain();
  const {
    isFetchingProfile,
    lensHandle,
    createPost,
    postingText: loadingText,
    isPosting,
  } = useLens();

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  // twitter dom element container to inject lens share button into
  const [shareContainer, setShareContainer] = useState<any>(null);

  const [canCollect, setCanCollect] = useBoolean(true);
  const [paidCollect, setPaidCollect] = useBoolean();
  const [onlyFollowersCollect, setOnlyFollowersCollect] = useBoolean();
  const [limitedEditionCollect, setLimitedEditionCollect] = useBoolean();
  const [timeLimitCollect, setTimeLimitCollect] = useBoolean();

  const [price, setPrice] = useState(0);
  const [currencyAddress, setCurrencyAddress] = useState<string>(
    config.currencies[0].address
  );
  const [referralFee, setReferralFee] = useState<number>(0);
  const [collectLimit, setCollectLimit] = useState<number>(1);

  const checkIfTwitterLoaded = () => {
    // finding the parent row with Views
    const _shareContainer = document.querySelector(
      '[data-testid="app-text-transition-container"]'
    )?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
      ?.parentElement;

    if (_shareContainer) {
      clearInterval(btnGroupCheckTimer);

      // only inject button if we are on the individual tweet's page
      if (document.location.pathname.split(/\/(?=.)/).includes("status")) {
        setShareContainer(_shareContainer);
      } else {
        setShareContainer(null);
      }
    }
  };

  // wait for our target element to load
  var btnGroupCheckTimer = setInterval(checkIfTwitterLoaded, 200);

  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href;

          // New URL now, so find & set the container again
          btnGroupCheckTimer = setInterval(checkIfTwitterLoaded, 200);
        }
      });
    });
    observer.observe(body!, { childList: true, subtree: true });
  };

  const handleConnectWallet = (connector: Connector) => {
    connect({ connector });
  };

  useEffect(() => {
    observeUrlChange();
  }, []);

  return (
    <>
      {
        // Inject "Share on Lens" button into Twitter
        shareContainer &&
          createPortal(
            <Box display={"flex"} justifyContent="end">
              <Button
                backgroundColor={"green.500"}
                _hover={{
                  backgroundColor: "green.700",
                }}
                color={"white"}
                fontSize={"sm"}
                h={"1.5rem"}
                onClick={openModal}
                rounded={"3xl"}
              >
                Share on Lens 🌿
              </Button>
            </Box>,
            shareContainer
          )
      }
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lens Share 🌿</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={6}>
            {!address ? (
              <Flex flexDir={"column"} mb="1rem">
                {connectors.map((connector, key) => (
                  <Button
                    key={key}
                    mb="0.5rem"
                    isDisabled={!connector.ready}
                    onClick={() => handleConnectWallet(connector)}
                    isLoading={
                      isLoading && connector.id === pendingConnector?.id
                    }
                    loadingText={"Connecting Wallet..."}
                  >
                    <HStack>
                      <Image
                        src={`${
                          (window as any).lensShareExtensionUrl
                        }/img/connectors/${connector.id}.png`}
                        width="24px"
                        height="24px"
                      />
                      <Text>Connect Wallet</Text>
                    </HStack>
                  </Button>
                ))}
              </Flex>
            ) : (
              <>
                <Center>
                  <Box
                    display="flex"
                    alignItems="center"
                    background="gray.700"
                    borderRadius="xl"
                    py="0"
                  >
                    <HStack
                      bg="gray.800"
                      border="1px solid transparent"
                      borderRadius="xl"
                      m="1px"
                      px={3}
                      h="38px"
                    >
                      <Text>Connected:</Text>
                      {/* Can't display lensAvatar here due to Twitter's Content Security Policy directive: "img-src 'self'*/}
                      {lensHandle ? (
                        <Link
                          href={`https://${
                            process.env.REACT_APP_USE_TESTNET === "true"
                              ? "testnet."
                              : ""
                          }lenster.xyz/u/${lensHandle}`}
                          isExternal
                        >
                          <HStack>
                            <Identicon />
                            <Text
                              color="white"
                              fontSize="md"
                              fontWeight="medium"
                              mr="2"
                            >
                              {lensHandle ?? slicedAddress(address)}
                            </Text>
                            <ExternalLinkIcon />
                          </HStack>
                        </Link>
                      ) : (
                        <HStack>
                          <Identicon />
                          <Text
                            color="white"
                            fontSize="md"
                            fontWeight="medium"
                            mr="2"
                          >
                            {lensHandle ?? slicedAddress(address)}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </Box>
                </Center>
                {!isSupportedChain ? (
                  <Center flexDir={"column"} py="1rem">
                    <Heading size="md">🔁 Switch Network:</Heading>
                    <Stack spacing={3} my="1rem" mx="auto" maxW="12rem">
                      {supportedChains.map((_chain, i) => (
                        <Button
                          key={i}
                          bgColor="white"
                          color="black"
                          _hover={
                            chain && _chain.id !== chain.id
                              ? {
                                  bgColor: "gray.400",
                                }
                              : {}
                          }
                          onClick={() => {
                            switchNetwork!(_chain.id);
                          }}
                          isDisabled={chain && _chain.id === chain.id}
                        >
                          <HStack>
                            <Image
                              src={`${
                                (window as any).lensShareExtensionUrl
                              }/img/chains/${_chain.name}.png`}
                              width="24px"
                              height="24px"
                            />
                            <Text>{_chain.name}</Text>
                          </HStack>
                        </Button>
                      ))}
                    </Stack>
                  </Center>
                ) : !lensHandle ? (
                  !isFetchingProfile && (
                    <VStack py="2rem">
                      <Text
                        fontWeight={"extrabold"}
                        color="white"
                        bgColor={"red.400"}
                        py="0.5rem"
                        px="1rem"
                        rounded="lg"
                      >{`⚠️ Lens Profile doesn't exist`}</Text>
                      <Flex
                        flexDir={["column", "row", "row"]}
                        alignItems="center"
                        color="white"
                      >
                        <Text>Claim your profile at</Text>
                        <Link ml="1" href="https://claim.lens.xyz/" isExternal>
                          https://claim.lens.xyz/ <ExternalLinkIcon />
                        </Link>
                      </Flex>
                    </VStack>
                  )
                ) : (
                  <Box mt={4}>
                    <HStack>
                      <Switch
                        isChecked={canCollect}
                        onChange={() => {
                          if (canCollect) {
                            // toggling off so reset other switches
                            setPaidCollect.off();
                            setOnlyFollowersCollect.off();
                            setLimitedEditionCollect.off();
                            setTimeLimitCollect.off();
                            setPrice(0);
                            setCurrencyAddress(config.currencies[0].address);
                            setReferralFee(0);
                            setCollectLimit(1);
                          }

                          setCanCollect.toggle();
                        }}
                      />
                      <Text fontWeight={"bold"}>
                        This post can be collected
                      </Text>
                    </HStack>
                    {canCollect && (
                      <Box mt={4} pl={4}>
                        <Box>
                          <Text fontWeight={"bold"}>
                            💵 Charge for collecting
                          </Text>
                          <HStack mt={2}>
                            <Switch
                              isChecked={paidCollect}
                              onChange={setPaidCollect.toggle}
                            />
                            <Text>
                              Get paid whenever someone collects your post
                            </Text>
                          </HStack>
                          {paidCollect && (
                            <Box mt={4}>
                              <HStack>
                                <FormControl>
                                  <FormLabel fontSize={"sm"}>Price</FormLabel>
                                  <Input
                                    type={"number"}
                                    value={price}
                                    onChange={(e) => {
                                      const _val = e.target.value;
                                      if (_val) {
                                        setPrice(parseFloat(_val));
                                      } else {
                                        setPrice(0);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize={"sm"}>
                                    Select Currency
                                  </FormLabel>
                                  <Select
                                    variant={"filled"}
                                    cursor="pointer"
                                    value={currencyAddress}
                                    onChange={(e) => {
                                      setCurrencyAddress(e.target.value);
                                    }}
                                  >
                                    {config.currencies.map((curr, i) => (
                                      <option value={curr.address} key={i}>
                                        {curr.name}
                                      </option>
                                    ))}
                                  </Select>
                                </FormControl>
                              </HStack>
                              <Box mt={6}>
                                <Text fontWeight={"bold"}>
                                  🔀 Mirror referral reward
                                </Text>
                                <Text fontSize={"sm"}>
                                  Share your collect fee with people who amplify
                                  your content
                                </Text>
                                <FormControl
                                  mt={2}
                                  isInvalid={referralFee > 100}
                                >
                                  <FormLabel fontSize={"sm"}>
                                    Referral fee
                                  </FormLabel>
                                  <InputGroup>
                                    <Input
                                      type={"number"}
                                      value={referralFee}
                                      onChange={(e) => {
                                        const _val = e.target.value;
                                        if (_val) {
                                          setReferralFee(parseFloat(_val));
                                        } else {
                                          setReferralFee(0);
                                        }
                                      }}
                                    />
                                    <InputRightAddon>%</InputRightAddon>
                                  </InputGroup>
                                  {referralFee > 100 && (
                                    <FormErrorMessage>
                                      Please input valid percentage value
                                    </FormErrorMessage>
                                  )}
                                </FormControl>
                              </Box>
                              <Box mt={4}>
                                <Text fontWeight={"bold"}>
                                  ⭐ Limited edition
                                </Text>
                                <HStack mt={2}>
                                  <Switch
                                    isChecked={limitedEditionCollect}
                                    onChange={setLimitedEditionCollect.toggle}
                                  />
                                  <Text>Make the collects exclusive</Text>
                                </HStack>
                              </Box>
                              {limitedEditionCollect && (
                                <FormControl mt={2}>
                                  <FormLabel fontSize={"sm"}>
                                    Collect Limit
                                  </FormLabel>
                                  <Input
                                    type={"number"}
                                    value={collectLimit}
                                    onChange={(e) => {
                                      const _val = e.target.value;
                                      if (_val) {
                                        setCollectLimit(parseInt(_val));
                                      } else {
                                        setReferralFee(1);
                                      }
                                    }}
                                  />
                                </FormControl>
                              )}
                              <Box mt={4}>
                                <Text fontWeight={"bold"}>⌛ Time limit</Text>
                                <HStack mt={2}>
                                  <Switch
                                    isChecked={timeLimitCollect}
                                    onChange={setTimeLimitCollect.toggle}
                                  />
                                  <Text>Limit collecting to the first 24h</Text>
                                </HStack>
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box mt={4}>
                          <Text fontWeight={"bold"}>🫂 Who can collect</Text>
                          <HStack mt={2}>
                            <Switch
                              isChecked={onlyFollowersCollect}
                              onChange={setOnlyFollowersCollect.toggle}
                            />
                            <Text>Only followers can collect</Text>
                          </HStack>
                        </Box>
                      </Box>
                    )}
                    <Center mt={4}>
                      <Button
                        color={"white"}
                        fontWeight="bold"
                        bgColor={"green.600"}
                        border="2px solid"
                        borderColor={"green.600"}
                        _hover={{
                          bgColor: "green.800",
                          color: "white",
                        }}
                        boxShadow="lg"
                        onClick={async () => {
                          await createPost({
                            canCollect,
                            paidCollect,
                            onlyFollowersCollect,
                            limitedEditionCollect,
                            timeLimitCollect,
                            currencyAddress,
                            price,
                            referralFee,
                            collectLimit,
                          });
                          closeModal();
                        }}
                        isLoading={isPosting}
                        loadingText={loadingText}
                        disabled={!lensHandle}
                      >
                        POST 🌿
                      </Button>
                    </Center>
                  </Box>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default App;
