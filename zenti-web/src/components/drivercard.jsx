import styles from '@/styles/card.module.css';

const StatusCard = ({ truck }) => {
  const {
    vehicleId,
    plate,
    startTime,
    status,
    currentLocation,
    conductor,
    routeProgress
  } = truck;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{vehicleId} - {conductor.name}</h3>
      </div>
      <div className={styles.details}>
        <div className={styles.imageContainer}>
          <img src={conductor.image} alt={conductor.name} className={styles.image} />
        </div>
        <div className={styles.info}>
          <p><strong>Plate:</strong> {plate}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Start Time:</strong> {startTime}</p>
          <p><strong>Location:</strong> {currentLocation.lat}, {currentLocation.long}</p>
          <p><strong>Contact:</strong> {conductor.contact}</p>
        </div>
      </div>
      <div className={styles.progressContainer}>
        <p><strong>Daily Progress:</strong></p>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${(routeProgress.delivered / routeProgress.total) * 100}%` }}
          ></div>
        </div>
        <p>{routeProgress.delivered} of {routeProgress.total} packages delivered</p>
      </div>
    </div>
  );
};

export default StatusCard;