import styles from '@/styles/card.module.css';

const StatusCard = () => {
  const data = {
    id: "XZLYB3",
    name: "Fernando Balleza",
    status: "Still",
    performance: "Terrible",
    location: "Junco de la Vega",
    contact: "55 2345 2321",
    progress: 30,
    imageUrl: "https://via.placeholder.com/100"
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{data.id} - {data.name}</h3>
      </div>
      <div className={styles.details}>
        <div className={styles.imageContainer}>
          <img src={data.imageUrl} alt={data.name} className={styles.image}/>
        </div>
        <div className={styles.info}>
          <p><strong>Status:</strong> {data.status}</p>
          <p><strong>Performance:</strong> {data.performance}</p>
          <p><strong>Location:</strong> {data.location}</p>
          <p><strong>Contact:</strong> {data.contact}</p>
        </div>
      </div>
      <div className={styles.progressContainer}>
        <p><strong>Daily Progress:</strong></p>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${data.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
