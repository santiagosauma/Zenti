
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "@/styles/SideBar.module.css";
import { usePathname } from "next/navigation";


export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false); // Establecer un valor inicial seguro
  const pathname = usePathname();

  // Ajustar el estado de `isOpen` solo en el cliente después de que el componente se haya montado
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    // Guardar el estado en localStorage
    localStorage.setItem("sidebarState", JSON.stringify(newState));
  };

  const menuItems = [
    { name: "Monitoring", icon: "/sidebar/maps.png", route: "/monitoring" },
    { name: "Vehicles", icon: "/sidebar/deliveries.png", route: "/vehicles" },
    { name: "Routing", icon: "/sidebar/box.png", route: "/routing" },
  ];

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
 <div className={styles.logoContainer}>
        <Image
          src="/LogoZenti.png"
          alt="Zenti Logo"
          width={isOpen ? 100 : 80}
          height={isOpen ? 100 : 80}
          onClick={toggleSidebar} // Mover el evento onClick al logo
          className={styles.logo} // Añadir una clase para el logo si es necesario
        />
        {isOpen && <h1>ZENTI</h1>}
      </div>
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.name} className={`${item.route === pathname ? styles.active : ""} ${isOpen ? styles.openMenuItem : styles.closedMenuItem}`}>
            <a href={item.route}>
              <Image src={item.icon} alt={`${item.name} Icon`} width={isOpen ? 50 : 40} height={isOpen ? 50 : 40} />
              {isOpen && <span className={styles.menuItemText}>{item.name}</span>}
            </a>
          </li>
        ))}
      </ul>


    </div>
  );
}
