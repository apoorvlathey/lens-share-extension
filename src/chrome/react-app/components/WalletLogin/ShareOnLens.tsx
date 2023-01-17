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
} from "@chakra-ui/react";
import {
  Connector,
  useConnect,
  useAccount,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import useSupportedChain from "../../hooks/useSupportedChain";
import { supportedChains } from "../../config";
import slicedAddress from "../../utils/slicedAddress";
import Identicon from "./Identicon";

function ShareOnLens() {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isSupportedChain } = useSupportedChain();

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
                    <Identicon />
                    <Text
                      color="white"
                      fontSize="md"
                      fontWeight="medium"
                      mr="2"
                    >
                      {slicedAddress(address)}
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
                ) : (
                  "TODO: fetch lens profile"
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
