import React from "react";
import { ModeToggle } from "./ui/theme-button";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-4">
          <span className="tracking-tighter text-3xl font-extrabold text-primary flex gap-2 items-center">
            <Image 
                src="/vault.jpeg"
                alt="vault"
                width={50}
                height={50}
            />
          </span>
        </div>
      </div>
      <ModeToggle />
    </nav>
  );
};

export default Navbar;