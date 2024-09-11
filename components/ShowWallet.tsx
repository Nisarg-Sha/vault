import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface WalletListProps {
  walletType: 'Solana' | 'Ethereum';
  addresses: string[];
  privateKeys: string[];
  showPrivateKey: boolean;
  toggleShowPrivateKey?: () => void;
};

const WalletList: React.FC<WalletListProps> = ({
  walletType,
  addresses,
  privateKeys,
  showPrivateKey,
  toggleShowPrivateKey,
}) => {

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
    };  

    return (
        <div className="mt-5">
            <h3>All {walletType} Wallets:</h3>
            {addresses.map((address, index) => (
                <div key={index} className="mb-4">
                <Label htmlFor={`${walletType}-address-${index}`} className="text-gray-400">
                    Address {index + 1}
                </Label>
                <div className="relative">
                    <Input
                    id={`${walletType}-address-${index}`}
                    value={address}
                    readOnly
                    className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-11 py-2 rounded-lg w-full"
                    />
                    <Clipboard
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                        onClick={() => copyToClipboard(address)}
                    />
                </div>

                <div className="mt-2">
                    <Label htmlFor={`${walletType}-privateKey-${index}`} className="text-gray-400">
                    Private Key {index + 1}
                    </Label>
                    <div className="relative">
                    <Input
                        id={`${walletType}-privateKey-${index}`}
                        value={showPrivateKey ? privateKeys[index] : '********************************'}
                        readOnly
                        className="bg-white-700 dark:bg-gray-700 text-black dark:text-white border-black dark:border-none pl-4 pr-16 py-2 rounded-lg w-full"
                    />
                    <Clipboard
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer text-gray-400 dark:hover:text-white hover:text-black"
                        onClick={() => copyToClipboard(privateKeys[index])}
                    />
                    </div>
                </div>
                </div>
            ))}

            {/* Button to toggle visibility of private keys */}
            <Button onClick={toggleShowPrivateKey}>
                {showPrivateKey ? `Hide ${walletType} Private Keys` : `Show ${walletType} Private Keys`}
            </Button>
        </div>
    );
};

export default WalletList;
