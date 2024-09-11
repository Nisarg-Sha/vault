"use client"
import React, { useState, useEffect } from "react";
import MnemonicDisplay from "./MnemonicDisplay";
import { Button } from "./ui/button";
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card"

import { EyeOff, Eye, Clipboard } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Wallet, HDNodeWallet } from "ethers";

import ShowAllSolanaWalletsDialog from "./ShowAllSolanaWalletsDialog";
import ShowAllEthereumWalletsDialog from "./ShowAllEthereumWalletsDialog";

export default function Hero() {
  const [mnemonic, setMnemonic] = useState("");
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  const [currentSolanaIndex, setCurrentSolanaIndex] = useState(0);
  const [publicSolanaKeys, setPublicSolanaKeys] = useState<string[]>([]);
  const [solanaPrivateKeys, setSolanaPrivateKeys] = useState<string[]>([]);
  const [showAllSolanaWallets, setShowAllSolanaWallets] = useState(false);
  const [showSolanaPrivateKey, setShowSolanaPrivateKey] = useState<boolean>(false); // Solana visibility toggle

  const [currentEthereumIndex, setCurrentEthereumIndex] = useState(0);
  const [ethereumAddresses, setEthereumAddresses] = useState<string[]>([]);
  const [ethereumPrivateKeys, setEthereumPrivateKeys] = useState<string[]>([]);
  const [showAllEthereumWallets, setShowAllEthereumWallets] = useState(false);
  const [showEthereumPrivateKey, setShowEthereumPrivateKey] = useState<boolean>(false); // Ethereum visibility toggle

  const toggleSolanaPrivateKeyVisibility = () => {
    setShowSolanaPrivateKey(!showSolanaPrivateKey);
  };

  const toggleEthereumPrivateKeyVisibility = () => {
    setShowEthereumPrivateKey(!showEthereumPrivateKey);
  };
  
  const generateSecretPhrase = () => {
    const mnemonicPhrase = generateMnemonic();
    setMnemonic(mnemonicPhrase);
    setShowMnemonic(true);
  };

  const generateSolanaWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentSolanaIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
    setCurrentSolanaIndex((prev) => prev + 1);
    setPublicSolanaKeys((prevKeys) => [...prevKeys, keypair.publicKey.toString()]);
    setSolanaPrivateKeys((prev) => [...prev, bs58.encode(secret)]);
  }

  const generateEthereumWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentEthereumIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);
    setCurrentEthereumIndex((prev) => prev + 1);
    setEthereumAddresses((prevAddresses) => [...prevAddresses, wallet.address]);
    setEthereumPrivateKeys((prev) => [...prev, privateKey]);
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <main className="p-8 pt-0 flex flex-col items-center justify-center">
      <div className="p-8 pt-0 items-center justify-center">
        <h1 className="text-2xl font-bold text-black-300 mb-4 ml-4">
          Secret Phrase
        </h1>
        <Button variant="secret" onClick={generateSecretPhrase}>
          Generate Secret Phrase
        </Button>
      </div>

      <div>
        {mnemonic && (
          <MnemonicDisplay 
            mnemonic={mnemonic} 
            showMnemonic={showMnemonic} 
            setShowMnemonic={setShowMnemonic} 
            copyToClipboard={(content) => copyToClipboard(content)} 
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-around items-center p-10 gap-7">
        <Card className="w-[350px]">
          <CardContent className="flex flex-col p-5 gap-3"> 
            <Button onClick={generateSolanaWallet} disabled={!mnemonic}>
              Generate SOLANA Wallet
            </Button>
            <div className="mb-4">
              <Label htmlFor="address" className="text-gray-400">
                Address
              </Label>
              <div className="relative">
                <Input
                  id="address"
                  value={publicSolanaKeys[currentSolanaIndex - 1] || ''}
                  readOnly
                  className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-11 py-2 rounded-lg w-full"
                />
                <Clipboard
                  className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                  onClick={() => copyToClipboard(publicSolanaKeys[currentSolanaIndex - 1] || '')}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="privateKey" className="text-gray-400">
                Private Key
              </Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  value={solanaPrivateKeys[currentSolanaIndex - 1] 
                    ? showSolanaPrivateKey  
                      ? solanaPrivateKeys[currentSolanaIndex - 1]
                      : '********************************'
                    : ''}
                  readOnly
                  className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-16 py-2 rounded-lg w-full"
                />
                {showSolanaPrivateKey ? (
                  <Eye
                    className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                    onClick={toggleSolanaPrivateKeyVisibility}
                  /> 
                ) :
                  <EyeOff
                    className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                    onClick={toggleSolanaPrivateKeyVisibility}
                  />
                }
                
                <Clipboard
                  className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                  onClick={() => copyToClipboard(solanaPrivateKeys[currentSolanaIndex - 1] || '')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-[350px]">
          <CardContent className="flex flex-col p-5 gap-3">
            <Button onClick={generateEthereumWallet} disabled={!mnemonic}>
              Generate ETHEREUM Wallet
            </Button>
            <div className="mb-4">
              <Label htmlFor="address" className="text-gray-400">
                Address
              </Label>
              <div className="relative">
                <Input
                  id="address"
                  value={ethereumAddresses[currentEthereumIndex - 1] || ''}
                  readOnly
                  className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-11 py-2 rounded-lg w-full"
                />
                <Clipboard
                  className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                  onClick={() => copyToClipboard(ethereumAddresses[currentEthereumIndex - 1] || '')}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="privateKey" className="text-gray-400">
                Private Key
              </Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  // value={showEthereumPrivateKey ? ethereumPrivateKeys[currentEthereumIndex - 1] || '' : '********************************'}
                  value={ethereumPrivateKeys[currentEthereumIndex - 1] 
                    ? showEthereumPrivateKey  
                      ? ethereumPrivateKeys[currentEthereumIndex - 1]
                      : '********************************'
                    : ''}
                  readOnly
                  className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-16 py-2 rounded-lg w-full"
                />
                {showEthereumPrivateKey ? (
                  <Eye
                    className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                    onClick={toggleEthereumPrivateKeyVisibility}
                  /> 
                ) :
                  <EyeOff
                    className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                    onClick={toggleEthereumPrivateKeyVisibility}
                  />
                }
                
                <Clipboard
                  className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                  onClick={() => copyToClipboard(ethereumPrivateKeys[currentEthereumIndex - 1] || '')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="flex flex-col md:flex-row gap-7">
          <ShowAllSolanaWalletsDialog
            solanaWallets={publicSolanaKeys.map((address, index) => ({
              address,
              privateKey: solanaPrivateKeys[index],
            }))}
            deleteWallet={(index) => {
              setPublicSolanaKeys((prev) => prev.filter((_, i) => i !== index));
              setSolanaPrivateKeys((prev) => prev.filter((_, i) => i !== index));
            }}
            copyToClipboard={copyToClipboard}
          />

          <ShowAllEthereumWalletsDialog
            ethereumWallets={ethereumAddresses.map((address, index) => ({
              address,
              privateKey: ethereumPrivateKeys[index],
            }))}
            deleteWallet={(index) => {
              setEthereumAddresses((prev) => prev.filter((_, i) => i !== index));
              setEthereumPrivateKeys((prev) => prev.filter((_, i) => i !== index));
            }}
            copyToClipboard={copyToClipboard}
          />
        </div>
      
    </main>
  );
}