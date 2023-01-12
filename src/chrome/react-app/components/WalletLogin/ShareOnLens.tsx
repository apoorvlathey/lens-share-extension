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
} from "@chakra-ui/react";
import { Connector, useConnect, useAccount } from "wagmi";

function ShareOnLens() {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { address } = useAccount();
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
      {shareContainer &&
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
              Share on Lens 🌿 {address}
            </Button>
          </Box>,
          shareContainer
        )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} mb="1rem">
              {connectors.map((connector, key) => (
                <Button
                  key={key}
                  mb="0.5rem"
                  isDisabled={!connector.ready}
                  onClick={() => handleConnectWallet(connector)}
                  isLoading={isLoading && connector.id === pendingConnector?.id}
                  loadingText={connector.name}
                >
                  <HStack>
                    <Image
                      src={`${
                        (window as any).lensShareExtensionUrl
                      }/img/connectors/${connector.id}.png`}
                      width="24px"
                      height="24px"
                    />
                    <Text>{connector.name}</Text>
                  </HStack>
                </Button>
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ShareOnLens;
