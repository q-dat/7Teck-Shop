'use client';
import React from 'react';
import Link from 'next/link';
import { IoIosArrowForward } from 'react-icons/io';

interface BreadcrumbLink {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  links: BreadcrumbLink[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ links }) => {
  return (
    <nav className="mb-4 flex w-1/2 items-center gap-2 bg-gradient-to-t text-xs font-light text-black">
      {links.map((link, index) => (
        <div key={index} className="flex items-center font-semibold">
          <Link
            href={link.href}
            aria-label={link.label}
            title={link.label}
            className="line-clamp-1 hover:scale-105 hover:text-blue-700 hover:underline"
          >
            {link.label}
          </Link>
          {index < links.length - 1 && (
            <span className="flex items-center justify-center">
              <IoIosArrowForward className="text-lg" />
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
