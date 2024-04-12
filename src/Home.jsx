import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  useSigner,
  useProvider,
  useAccount,
  useBalance,
  useContract,
} from "wagmi";

import { Navbar } from "../components/Navbar";
import { HeaderStat } from "../components/HeaderStat";
import { Footer } from "../components/Footer";

import {
  Container,
  SimpleGrid,
  Button,
  Divider,
  Heading,
  InputGroup,
  InputRightElement,
  Input,
  Stack,
  Text,
  Box,
  Stat,
  StatLabel,
  useBreakpointValue,
  useColorModeValue,
  Skeleton,
  useToast,
  Image,
  Center,
} from "@chakra-ui/react";

import {
  tokenABI,
  nftABI,
  stakingABI,
  tokenAddress,
  nftAddress,
  stakingAddress,
} from "../helpers/contracts";
import { NFT_KEY } from "../helpers/constants";

const Home = () => {
  const toast = useToast();

  const [address, setAddress] = useState();

  const [totalStakedAmount, setTotalStakedAmount] = useState(); // optional: total staked in contract
  const [priceNFT, setPriceNFT] = useState();

  //user balances
  const [userCeloBalance, setUserCeloBalance] = useState();
  const [userStakedBalance, setUserStakedBalance] = useState();
  const [userPendingRewards, setUserPendingRewards] = useState();
  const [userNFTBalance, setUserNFTBalance] = useState();
  const [userTokenBalance, setUserTokenBalance] = useState();
  const [rewardPool, setRewardPool] = useState();

  const [userAllowanceStakeNFT, setUserAllowanceStakeNFT] = useState();

  // Get provider and signer from wagmi
  const { data: provider } = useProvider();
  const { data: signer } = useSigner();

  // isConnected => address
  const { isConnected } = useAccount();

  // contracts
  const tokenContract = useContract({
    addressOrName: tokenAddress,
    contractInterface: tokenABI,
    signerOrProvider: signer,
  });

  const stakingContract = useContract({
    addressOrName: stakingAddress,
    contractInterface: stakingABI,
    signerOrProvider: signer,
  });

  const nftContract = useContract({
    addressOrName: nftAddress,
    contractInterface: nftABI,
    signerOrProvider: signer,
  });

  const updateUserBalances = async (address) => {
    const celoBalance = ethers.utils.formatEther(await signer.getBalance());

    const tokenBalance = ethers.utils.formatEther(
      await tokenContract.balanceOf(address)
    );
    console.log(tokenBalance);
    const stakedTokens = await stakingContract.totalStakedFor(address);

    const pendingRewards = await stakingContract.earned(address);

    const nft = await nftContract.balanceOf(address, NFT_KEY);
    const _rewardPool = ethers.utils.formatEther(
      await tokenContract.balanceOf(stakingContract.address)
    );

    const allowanceStakedNFT = await nftContract.isApprovedForAll(
      address,
      stakingContract.address
    );

    setUserCeloBalance(celoBalance);
    setUserTokenBalance(tokenBalance);
    setUserStakedBalance(stakedTokens);
    setUserPendingRewards(pendingRewards);
    setUserNFTBalance(nft);
    setRewardPool(_rewardPool);
    setUserAllowanceStakeNFT(allowanceStakedNFT);
  };

  const loadDefaultValues = async () => {
    // Get signer's address
    const _address = await signer.getAddress();
    const priceNFT = await nftContract.getMintPrice();
    const stakedTokens = await stakingContract.totalStaked();

    setAddress(_address);
    setPriceNFT(BigInt(priceNFT).toString());
    setTotalStakedAmount(BigInt(stakedTokens).toString());
  };

  const formatNumber = (number) => {
    const amount = ethers.utils.formatEther(number);
    const calcDec = Math.pow(10, 0);

    return Math.trunc(amount * calcDec) / calcDec;
  };

  const formatNumber6Dec = (number) => {
    const amount = ethers.utils.formatEther(number);
    const calcDec = Math.pow(10, 6);

    return Math.trunc(amount * calcDec) / calcDec;
  };

  const getNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const input = document.querySelector("#inputGetNFT");

    if (
      !Number.isInteger(parseInt(input.value)) ||
      parseInt(input.value) == 0 ||
      input.value.length == 0
    ) {
      toast({
        title: "Only Numbers",
        description: "Please use only round numbers with no decimal places.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const inputValue = input.value * ethers.utils.formatEther(priceNFT);
    const formattedValue = parseInt(
      ethers.utils.parseEther(inputValue.toString())
    );

    if (userCeloBalance < inputValue) {
      toast({
        title: "Not Enough Funds",
        description: "Please make sure you have enough funds to proceed.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const cost = (input.value * priceNFT).toString();
    const approvePurchaseTX = await nftContract.mint(NFT_KEY, input.value, {
      value: cost,
    });

    toast({
      title: "Confirming Transaction",
      description: "Please wait until the transaction is confirmed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    await approvePurchaseTX.wait();

    if (!approvePurchaseTX) {
      toast({
        title: "Transaction Failed",
        description: "Please refresh the page and try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }

    toast({
      title: "Transaction Success!",
      description: "You have successfully purchased the nfts.",
      status: "success",
      duration: 6000,
      isClosable: true,
    });

    input.value = "";
    updateUserBalances(address);
  };

  const stakeNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const input = document.querySelector("#inputStakeNFT");

    if (
      !Number.isInteger(parseInt(input.value)) ||
      parseInt(input.value) == 0 ||
      input.value.length == 0
    ) {
      toast({
        title: "Only Numbers",
        description: "Please use only round numbers with no decimal places.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const inputValue = parseInt(input.value);

    if (parseInt(userNFTBalance) < inputValue) {
      toast({
        title: "Not Enough Funds",
        description: "Please make sure you have enough funds to proceed.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (userAllowanceStakeNFT == false) {
      toast({
        title: "Approve NFTs",
        description: "Please approve the staking contract to use your NFTs.",
        status: "info",
        duration: 6000,
        isClosable: true,
      });
      const approveTX = await nftContract.setApprovalForAll(
        stakingAddress,
        true
      );

      toast({
        title: "Approving NFTs",
        description: "Please wait until the NFTs are approved.",
        status: "info",
        duration: 6000,
        isClosable: true,
      });

      await approveTX.wait();

      if (approveTX) {
        toast({
          title: "Approve Success!",
          description: "You have successfully approved the request.",
          status: "success",
          duration: 6000,
          isClosable: true,
        });
        setUserAllowanceStakeNFT(true);
      }
    }

    toast({
      title: "Confirm Transaction",
      description: "Please confirm the transaction in your wallet to proceed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    const approveStakingTX = await stakingContract.stake(inputValue, "0x0000");

    toast({
      title: "Confirming Transaction",
      description: "Please wait until the transaction is confirmed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    await approveStakingTX.wait();

    if (!approveStakingTX) {
      toast({
        title: "Transaction Failed",
        description: "Please refresh the page and try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }

    toast({
      title: "NFTs Staked!",
      description: "You have successfully staked your nfts.",
      status: "success",
      duration: 6000,
      isClosable: true,
    });
    input.value = "";
    updateUserBalances(address);
  };

  const unstakeNFT = async () => {
    if (!isConnected || !userNFTBalance || !userStakedBalance) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const input = document.querySelector("#inputUnstakeNFT");

    if (
      !Number.isInteger(parseInt(input.value)) ||
      parseInt(input.value) == 0 ||
      input.value.length == 0
    ) {
      toast({
        title: "Only Numbers",
        description: "Please use only round numbers with no decimal places.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    const inputValue = parseInt(input.value);

    if (inputValue > parseInt(userStakedBalance)) {
      toast({
        title: "Not Available",
        description: "You don't have that amount of NFTs staked.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Confirm Transaction",
      description: "Please confirm the transaction in your wallet to proceed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    const approveStakingTX = await stakingContract.unstake(
      inputValue,
      "0x0000"
    );

    toast({
      title: "Confirming Transaction",
      description: "Please wait until the transaction is confirmed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    await approveStakingTX.wait();

    if (!approveStakingTX) {
      toast({
        title: "Transaction Failed",
        description: "Please refresh the page and try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }

    toast({
      title: "NFTs Unstaked!",
      description: "You have successfully unstaked the nfts.",
      status: "success",
      duration: 6000,
      isClosable: true,
    });
    input.value = "";
    updateUserBalances(address);
  };

  const claimRewards = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (userPendingRewards == 0) {
      toast({
        title: "Not Available",
        description: "You don't have any pending rewards.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Confirm Transaction",
      description: "Please confirm the transaction in your wallet to proceed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    const approveClaimTX = await stakingContract.claim();

    toast({
      title: "Confirming Transaction",
      description: "Please wait until the transaction is confirmed.",
      status: "info",
      duration: 6000,
      isClosable: true,
    });

    await approveClaimTX.wait();

    if (!approveClaimTX) {
      toast({
        title: "Transaction Failed",
        description: "Please refresh the page and try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }

    toast({
      title: "Rewards Claimed!",
      description: "You have successfully claimed your rewards.",
      status: "success",
      duration: 6000,
      isClosable: true,
    });
    updateUserBalances(address);
  };

  const getMaxNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }
    document.querySelector("#inputGetNFT").value = parseInt(userCeloBalance);
  };

  const getMaxStakeNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    document.querySelector("#inputStakeNFT").value = parseInt(userNFTBalance);
  };

  const getMaxUnstakeNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet and wait for the page to load.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    document.querySelector("#inputUnstakeNFT").value =
      parseInt(userStakedBalance);
  };

  useEffect(() => {
    if (isConnected) {
      loadDefaultValues();
      updateUserBalances(address);
    }
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        const pendingRewards = await stakingContract.earned(address);
        setUserPendingRewards(pendingRewards);
      }
    }, 10000);
    return () => clearInterval(interval);
  });

  return (
    <div>
      {/* <Head>
        <title>Simple NFT Staking</title>
        <link rel="shortcut icon" href="favicon.ico" />
      </Head> */}

      <Navbar />
      {isConnected && (
        <Box as="section" py={{ base: "4", md: "8" }}>
          <Container>
            <SimpleGrid
              columns={{ base: 1, md: 4 }}
              gap={{ base: "5", md: "6" }}
            >
              <Skeleton isLoaded={!address ? true : userNFTBalance}>
                <HeaderStat
                  label="Your available NFTs"
                  value={userNFTBalance ? parseInt(userNFTBalance) : 0}
                />
              </Skeleton>

              <Skeleton isLoaded={!address ? true : userStakedBalance}>
                <HeaderStat
                  label="Your staked NFTs"
                  value={userStakedBalance ? parseInt(userStakedBalance) : 0}
                />
              </Skeleton>

              <Skeleton isLoaded={!address ? true : userTokenBalance}>
                <HeaderStat
                  label="Your $COIN balance"
                  value={userTokenBalance ? userTokenBalance : 0}
                />
              </Skeleton>
              <Skeleton isLoaded={!address ? true : userTokenBalance}>
                <HeaderStat
                  label="$COIN reward pool"
                  value={rewardPool > 0 ? rewardPool : 0}
                />
              </Skeleton>
            </SimpleGrid>
          </Container>
        </Box>
      )}
      <Container as="section" py={{ base: "2", md: "2" }}>
        <Box
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
          w="100%"
          p={4}
          bg="bg-surface"
          borderRadius="lg"
          boxShadow={useColorModeValue("sm", "sm-dark")}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 5, md: 6 }}>
            <Stack
              spacing="8"
              borderWidth="1px"
              rounded="lg"
              padding="8"
              width="full"
            >
              <Center>
                <Image
                  rounded="lg"
                  borderWidth="1px"
                  htmlHeight="200px"
                  htmlWidth="500px"
                  src="/nft.png"
                  alt="Coin NFT"
                />
              </Center>
              <Heading size="md">Get Coin NFT</Heading>
              <Stack spacing="6">
                <li>You can get as much NFTs as you need.</li>
                <li>Coin NFTs follow the ERC1155 Standard.</li>
                <li>
                  Each NFT cost {priceNFT ? formatNumber(priceNFT) : "1"} CELO.
                </li>
                <li>
                  Get CELO tokens from{" "}
                  <b>
                    <a
                      href="https://faucet.celo.org/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      faucet
                    </a>
                  </b>
                  .
                </li>
              </Stack>
              <Stack
                spacing="8"
                borderWidth="1px"
                rounded="lg"
                padding="8"
                width="full"
              >
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type="text"
                    placeholder="NFT Amount"
                    id="inputGetNFT"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={getMaxNFT}>
                      max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Button
                  colorScheme="linkedin"
                  size="lg"
                  fontSize="md"
                  onClick={getNFT}
                >
                  Buy Coin NFT
                </Button>
              </Stack>
            </Stack>

            <Box>
              <Heading size={useBreakpointValue({ base: "sm", md: "md" })}>
                Stake Coin NFT
              </Heading>
              <Text color="muted" mt="5">
                Here you can stake your Coin NFTs, unstake them, and claim your
                rewards in $COIN tokens.
              </Text>
              <Divider my="5" />
              <Stack
                spacing="8"
                borderWidth="1px"
                rounded="lg"
                padding="8"
                width="full"
                mb="5"
              >
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type="text"
                    placeholder="NFT Amount"
                    id="inputStakeNFT"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={getMaxStakeNFT}>
                      max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Button
                  colorScheme="linkedin"
                  size="lg"
                  fontSize="md"
                  onClick={stakeNFT}
                >
                  Stake NFTs
                </Button>
              </Stack>
              <Stack
                spacing="8"
                borderWidth="1px"
                rounded="lg"
                padding="8"
                width="full"
                mb="5"
              >
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type="text"
                    placeholder="NFT Amount"
                    id="inputUnstakeNFT"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={getMaxUnstakeNFT}>
                      max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Button
                  colorScheme="linkedin"
                  size="lg"
                  fontSize="md"
                  onClick={unstakeNFT}
                >
                  Unstake NFTs
                </Button>
              </Stack>
              <Stack
                spacing="8"
                borderWidth="1px"
                rounded="lg"
                padding="8"
                width="full"
              >
                <Stat>
                  <StatLabel>Your pending $COIN token rewards</StatLabel>

                  <Skeleton
                    isLoaded={
                      (!address && !userPendingRewards) ||
                      userPendingRewards == 0
                        ? true
                        : userPendingRewards
                    }
                  >
                    <Heading
                      size={useBreakpointValue({ base: "sm", md: "md" })}
                    >
                      {userPendingRewards
                        ? formatNumber6Dec(userPendingRewards)
                        : 0}
                    </Heading>
                  </Skeleton>
                </Stat>

                <Button
                  colorScheme="linkedin"
                  size="lg"
                  fontSize="md"
                  onClick={claimRewards}
                >
                  Claim rewards
                </Button>
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
