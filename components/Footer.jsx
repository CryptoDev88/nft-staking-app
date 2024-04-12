import { Container, Divider, Stack, Text } from "@chakra-ui/react";

export const Footer = () => (
  <Container as="footer" role="contentinfo">
    <Divider />
    <Stack
      pt="8"
      pb="12"
      justify="space-between"
      direction={{
        base: "column-reverse",
        md: "row",
      }}
      align="center"
    ></Stack>
  </Container>
);
