import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, utils, Contract } from "ethers";
import { MAVERICK_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const [presaleBegin, setPresaleBegin] = useState(false);

  const [presaleCompleted, setPresaleCompleted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [isOwner, setIsOwner] = useState(false);

  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const web3ModalRef = useRef();

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await mavericksContract.presaleMint({
        value: utils.parseEther("0.002"),
      });
      setLoading(true);
      tx.wait();
      setLoading(false);
      window.alert("You have successfully minted a Maverick");
    } catch (err) {
      console.error(err);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await mavericksContract.mint({
        value: utils.parseEther("0.05"),
      });
      setLoading(true);
      tx.wait();
      setLoading(false);
      window.alert("You have successfully minted a Maverick");
    } catch (err) {
      console.error(err);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _tokenIds = await mavericksContract.tokenIds();
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await mavericksContract.beginPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPreSaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPreSaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _presaleBegin = await mavericksContract.presaleBegin();
      if (!_presaleBegin) {
        await getOwner();
      }
      setPresaleBegin(_presaleBegin);
      return _presaleBegin;
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPreSaleCompleted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _presaleCompleted = await mavericksContract.presaleCompleted();

      const hasEnded = _presaleCompleted.lt(Math.floor(Date.now() / 1000));

      if (hasEnded) {
        setPresaleCompleted(true);
      } else {
        setPresaleCompleted(false);
      }

      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();

      const mavericksContract = new Contract(
        MAVERICK_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _owner = await mavericksContract.owner();

      const signer = await getProviderOrSigner(true);

      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // establish access to the provider/signer from network
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to rinkeby network!");
      throw new Error("Incorrect network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      const _presaleStarted = checkIfPreSaleStarted();
      if (_presaleStarted) {
        checkIfPreSaleCompleted();
      }

      getTokenIdsMinted();

      const presaleCompletedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPreSaleStarted();
        if (_presaleStarted) {
          const _presaleCompleted = await checkIfPreSaleCompleted();
          if (_presaleCompleted) {
            clearInterval(presaleCompletedInterval);
          }
        }
      }, 5 * 1000);

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button  className={styles.button} >Loading🎁...</button>;
    }

    if (isOwner && !presaleBegin) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      );
    }

    if (!presaleBegin) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    if (presaleBegin && !presaleCompleted) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Maverick 🥳
          </div>
          <button onClick={presaleMint} className={styles.button}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    if (presaleBegin && presaleCompleted) {
      return (
        <button onClick={publicMint} className={styles.button}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Maverick Chain</title>
        <meta name="description" content="Maverick-NFT-mint" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Maverick Chain!</h1>
          <div className={styles.description}>
            Its an NFT collection for members of Maverick Chain Defi.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/30 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./onboard.jpg" />
        </div>
      </div>
      <footer className={styles.footer}>Made with ❤ by Bellz</footer>
    </div>
  );
}
