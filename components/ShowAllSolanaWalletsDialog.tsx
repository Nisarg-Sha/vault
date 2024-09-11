import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye, Clipboard, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function getSolanaBalance(address: string): Promise<number> {
  try {
    const pubKey = new PublicKey(address);
    const balance = await connection.getBalance(pubKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export default function ShowAllSolanaWalletsDialog({
  solanaWallets,
  deleteWallet,
  copyToClipboard,
}: {
  solanaWallets: { address: string; privateKey: string }[];
  deleteWallet: (index: number) => void;
  copyToClipboard: (content: string) => void;
}) {
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>(new Array(solanaWallets.length).fill(false));
  const [walletBalances, setWalletBalances] = useState<number[]>(new Array(solanaWallets.length).fill(0));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch balances when the dialog is opened
  useEffect(() => {
    if (isDialogOpen) {
      fetchBalances();
    }
  }, [isDialogOpen]);

  const fetchBalances = async () => {
    const balances = await Promise.all(solanaWallets.map(wallet => getSolanaBalance(wallet.address)));
    setWalletBalances(balances);
  };

  const togglePrivateKeyVisibility = (index: number) => {
    setVisiblePrivateKeys((prevState) => {
      const updatedVisibility = [...prevState];
      updatedVisibility[index] = !updatedVisibility[index];
      return updatedVisibility;
    });
  };

  return (
    <Dialog onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default">Show All Solana Wallets</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
        <DialogTitle>All Solana Wallets</DialogTitle>
        <DialogDescription>Scroll to view all wallets</DialogDescription>
        <ScrollArea className="h-[60vh]">
          {solanaWallets.length === 0 ? (
            <p>No wallets available.</p>
          ) : (
            solanaWallets.map((wallet, index) => (
              <Card key={index} className="w-full mb-4">
                <CardContent className="flex flex-col gap-3">
                  <h2 className="font-bold py-2">Wallet {index + 1} - Balance: {walletBalances[index]?.toFixed(4)} SOL</h2>

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
