import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo, menu, close } from "../assets";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        styles.paddingX
      } w-full flex items-center py-5 fixed top- z-20 ${
        scrolled ? "bg-primary" : "bg-transparent"
      }`}
    >
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to='/'
          className='flex items-center gap-2'
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <img src={logo} alt='logo' className='w-14 h-14 object-contain' />
          <div>
            <p className='text-white text-[18px] font-bold cursor-pointer'>
              Akiyoshi Yapa
            </p>
            <p className='text-white text-[10px] sm:block hidden'>
              HND in IT & Software Engineering
            </p>
          </div>
        </Link>

        <ul className='list-none hidden sm:flex flex-row gap-10'>
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`${
                active === nav.title ? "text-[#FF9A00]" : "text-white"
              } hover:text-[#FF9A00] text-[18px] font-bold cursor-pointer`}
              onClick={() => setActive(nav.title)}
              >
                    <a href={`#${nav.id}`} className="flex items-center gap-2">
                      {nav.icon && (
                        <img
                          src={nav.icon}
                          alt={`${nav.title} icon`}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      {nav.title}
                    </a>
                  </li>
                ))}
              </ul>

        <div className='sm:hidden flex flex-1 justify-end items-center'>
          <img
            src={toggle ? close : menu}
            alt='menu'
            className='w-[28px] h-[28px] object-contain'
            onClick={() => setToggle(!toggle)}
          />

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-2 mx-4 my-2 z-10 rounded-xl`}
          >
            <ul className='list-none flex justify-end items-start flex-1 flex-col gap-4'>
              {navLinks.map((nav) => (
                <li

                  key={nav.id}
                  className={`font-poppins font-bold cursor-pointer text-[16px] ${
                    active === nav.title ? "text-[#FF9A00]" : "text-secondary"
                  }`}
                  onClick={() => {
                    setToggle(!toggle);
                    setActive(nav.title);
                  }}
                >
                  <a href={`#${nav.id}`} className="flex items-center gap-2">
                    <img src={nav.icon} alt={nav.title} className="w-5 h-5 object-contain" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;