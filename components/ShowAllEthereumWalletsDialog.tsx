import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye, Clipboard, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ethers, formatEther } from "ethers";  // Updated import for version 6

export default function ShowAllEthereumWalletsDialog({
  ethereumWallets,
  deleteWallet,
  copyToClipboard,
}: {
  ethereumWallets: { address: string; privateKey: string }[];
  deleteWallet: (index: number) => void;
  copyToClipboard: (content: string) => void;
}) {
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>(new Array(ethereumWallets.length).fill(false));
  const [balances, setBalances] = useState<string[]>(new Array(ethereumWallets.length).fill("Loading..."));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to toggle private key visibility
  const togglePrivateKeyVisibility = (index: number) => {
    setVisiblePrivateKeys((prevState) => {
      const updatedVisibility = [...prevState];
      updatedVisibility[index] = !updatedVisibility[index];
      return updatedVisibility;
    });
  };

  // Fetch balances using Alchemy
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/C5ZIyduVqHreg9IxHty9ChQ1ntRZrv3E`);

    // Function to fetch and update balances for each wallet
    const fetchBalances = async () => {
      const updatedBalances = await Promise.all(
        ethereumWallets.map(async (wallet) => {
          const balance = await provider.getBalance(wallet.address);
          return formatEther(balance); // Convert balance to Ether
        })
      );
      setBalances(updatedBalances);
    };

    if (isDialogOpen) {
      fetchBalances();
    }
  }, [ethereumWallets]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Show All Etherem Wallets</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
        <DialogTitle>All Etherem Wallets</DialogTitle>
        <DialogDescription>Scroll to view all wallets</DialogDescription>
        <ScrollArea className="h-[60vh]">
          {ethereumWallets.length === 0 ? (
            <p>No wallets available.</p>
          ) : (
            ethereumWallets.map((wallet, index) => (
              <Card key={index} className="w-full mb-4">
                <CardContent className="flex flex-col gap-3">
                  <h2 className="font-bold py-2">Wallet {index + 1} - Balance: {`${balances[index]} ETH`} </h2>

                  <div className="mb-4">
                    <Label htmlFor={`address-${index}`} className="text-gray-400">
                      Address
                    </Label>
                    <div className="relative">
                      <Input
                        id={`address-${index}`}
                        value={wallet.address}
                        readOnly
                        className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-11 py-2 rounded-lg w-full"
                      />
                      <Clipboard
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                        onClick={() => copyToClipboard(wallet.address)}
                      />
                    </div>
                  </div>

                  {/* <div className="mb-4">
                    <Label htmlFor={`balance-${index}`} className="text-gray-400">
                      Balance
                    </Label>
                    <div className="relative">
                      <Input
                        id={`balance-${index}`}
                        value={balances[index] ? `${balances[index]} ETH` : "Loading..."}
                        readOnly
                        className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-16 py-2 rounded-lg w-full"
                      />
                    </div>
                  </div> */}

                  <div className="mb-4">
                    <Label htmlFor={`privateKey-${index}`} className="text-gray-400">
                      Private Key
                    </Label>
                    <div className="relative">
                      <Input
                        id={`privateKey-${index}`}
                        value={visiblePrivateKeys[index] ? wallet.privateKey : "********************************"}
                        readOnly
                        className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-16 py-2 rounded-lg w-full"
                      />
                      {visiblePrivateKeys[index] ? (
                        <Eye
                          className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                          onClick={() => togglePrivateKeyVisibility(index)}
                        />
                      ) : (
                        <EyeOff
                          className="absolute right-10 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                          onClick={() => togglePrivateKeyVisibility(index)}
                        />
                      )}
                      <Clipboard
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                        onClick={() => copyToClipboard(wallet.privateKey)}
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => deleteWallet(index)}
                  >
                    <Trash className="w-5 h-5" />
                    Delete Wallet
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
