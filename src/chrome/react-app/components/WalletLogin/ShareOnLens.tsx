import { useState } from "react";
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
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Connector,
  useConnect,
  useAccount,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { supportedChains } from "../../config";
import useSupportedChain from "../../hooks/useSupportedChain";
import { useLens } from "../../contexts/LensContext";
import slicedAddress from "../../utils/slicedAddress";
import Identicon from "./Identicon";

function ShareOnLens() {
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

  const [shareContainer, setShareContainer] = useState<any>(null);

  const checkIfTwitterLoaded = () => {
    const _shareContainer = document.querySelector('[role="group"]');
    if (_shareContainer) {
      clearInterval(btnGroupCheckTimer);

      setShareContainer(_shareContainer);
    }
  };

  // wait for our target element to load
  var btnGroupCheckTimer = setInterval(checkIfTwitterLoaded, 200);

  const handleConnectWallet = (connector: Connector) => {
    connect({ connector });
  };

  return (
    <>
      {
        // Inject "Share on Lens" button into Twitter
        shareContainer &&
          createPortal(
            <Box pb={"1rem"}>
              <Button
                backgroundColor={"green.500"}
                _hover={{
                  backgroundColor: "green.700",
                }}
                color={"white"}
                onClick={openModal}
                isLoading={isLoading}
                loadingText="Connecting"
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
          <ModalBody>
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
                </Box>
                {!isSupportedChain ? (
                  <Box>
                    <Heading>🔁 Switch Network</Heading>
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
                  </Box>
                ) : !lensHandle ? (
                  !isFetchingProfile && (
                    <VStack pt="2rem">
                      <Text
                        fontWeight={"bold"}
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
                    onClick={() => alert("tweet posted")}
                    isLoading={isPosting}
                    loadingText={loadingText}
                    disabled={!lensHandle}
                  >
                    POST 🌿
                  </Button>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ShareOnLens;
