import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "@/styles/SideBar.module.css";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarState", JSON.stringify(newState));
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    localStorage.setItem("sidebarState", JSON.stringify(false));
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { name: "Routing", icon: "/sidebar/maps.png", route: "/monitoring" },
    { name: "Vehicles", icon: "/sidebar/deliveries.png", route: "/vehicles" },
    { name: "Packaging", icon: "/sidebar/box.png", route: "/routing" },
  ];

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.logoContainer}>
        <Image
          src="/LogoZenti.png"
          alt="Zenti Logo"
          width={isOpen ? 60 : 40} // Tamaño del logo ajustado
          height={isOpen ? 60 : 40} // Tamaño del logo ajustado
          onClick={toggleSidebar}
          className={styles.logo}
        />
        {isOpen && <h1>ZENTI</h1>}
      </div>
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`${item.route === pathname ? styles.active : ""} ${
              isOpen ? styles.openMenuItem : styles.closedMenuItem
            }`}
          >
            <a href={item.route} onClick={handleMenuItemClick}>
              <Image
                src={item.icon}
                alt={`${item.name} Icon`}
                width={isOpen ? 40 : 30}
                height={isOpen ? 40 : 30}
              />
              {isOpen && (
                <span className={styles.menuItemText}>{item.name}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
