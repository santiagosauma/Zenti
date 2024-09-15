import Image from "next/image";
import styles from '@/styles/GeneralCard.module.css';

const GeneralCard = () => {
  const data = {
    name: "Francisco",
    id: "ZSDSXDE",
    status: "In Time",
    contact: "+52 2424252892",
    imageUrl: "/Camiones.png"
  };

  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <div className={styles.imageContainer}>
          <div className={styles.circularProgress}>
            <svg className={styles.progressRing} width="60" height="60">
              <circle className={styles.progressBackground} cx="30" cy="30" r="28" />
              <circle
                className={styles.progressForeground}
                cx="30"
                cy="30"
                r="28"
                style={{
                  strokeDasharray: 2 * Math.PI * 28,
                  strokeDashoffset: 2 * Math.PI * 28 * ((100 - 75) / 100),
                }}
              />
            </svg>
            <div className={styles.imageWrapper}>
              <Image
                src={data.imageUrl}
                alt="Camión"
                width={40}
                height={40}
                className={styles.image}
              />
            </div>
          </div>
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{data.name}</p>
          <p className={styles.id}>{data.id}</p>
          <p className={styles.status}>{data.status}</p>
          <p className={styles.contact}>{data.contact}</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralCard;
