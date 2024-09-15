import React from 'react';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/BackgroundVideo.mp4" type="video/mp4" />
        <source src="/BackgroundVideo.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      <img src="/LogoZenti.png" alt="Logo Zenti" className={styles.logo} />

      <div className={styles.content}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Zenti</h1>
          <p className={styles.description}>
            Bienvenidos a Zenti, donde la creatividad y la tecnología se fusionan para ofrecer soluciones modernas y minimalistas.
          </p>
          <button className={styles.button}>Ingresar</button>
        </div>
      </div>
    </div>
  );
}
