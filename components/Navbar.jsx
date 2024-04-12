import {
  Container,
  Box,
  HStack,
  Flex,
  ButtonGroup,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Navbar = () => (
  <Box as="section">
    <Box
      as="nav"
      bg="bg-surface"
      boxShadow={useColorModeValue("sm", "sm-dark")}
    >
      <Container py={{ base: "4", lg: "5" }}>
        <HStack spacing="10" justify="space-between">
          <Flex justify="space-between" flex="1">
            <ButtonGroup variant="link" spacing="8">
              {["Coin NFT Staking"].map((item) => (
                <Button key={item}>{item}</Button>
              ))}
            </ButtonGroup>
            <HStack spacing="3">
              <ConnectButton />
            </HStack>
          </Flex>
        </HStack>
      </Container>
    </Box>
  </Box>
);
