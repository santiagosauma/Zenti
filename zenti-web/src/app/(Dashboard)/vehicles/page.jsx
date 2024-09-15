import React from 'react'
import styles from '@/styles/monitoringPage.module.css'
import TruckFetcher from '@/components/TruckFetcher'


function page() {
  return (
    <div className={styles.page}>
      <div className={styles.header}> 
        <h1 className={styles.pageTitle}>Delivery Vehicles</h1>
      </div>
      <div className={styles.appContainer}>

          <TruckFetcher />



        
      </div>

    

    </div>
  )
}

export default page 