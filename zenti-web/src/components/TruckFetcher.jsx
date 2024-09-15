"use client";

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from '@/styles/TruckFetcher.module.css'; // Asegúrate de ajustar esto a tu archivo de CSS
import StatusCard from '@/components/drivercard';

// Estilos personalizados para los selectores
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    width: '150px',
    borderRadius: '5px',
    borderColor: state.isFocused ? '#FF7F50' : '#ccc', // Border color based on focus
    boxShadow: state.isFocused ? '0 0 0 2px #FF7F50' : 'none', // Shadow when focused
    '&:hover': {
      borderColor: '#FF7F50', // Hover state for border
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#333',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? '#fff' : '#333',
    backgroundColor: state.isSelected ? '#FF7F50' : '#fff',
    '&:hover': {
      backgroundColor: state.isSelected ? '#FF7F50' : '#f0f0f0',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#999', // Color del placeholder
  }),
};

export default function DriverFilter() {
  //filtros
  const [filters, setFilters] = useState({
    plate: '',
    driver: '',
    status: { value: 'All', label: 'All' },
    packages: '',
    location: '',
    orderBy: { value: 'Descending', label: 'Newest First' },
  });

  const [trucksData, setTrucksData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Opciones para los selectores
  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: 'Still', label: 'Still' },
    { value: 'Driving', label: 'Driving' },
    { value: 'Idle', label: 'Idle' }
  ];

  const orderByOptions = [
    { value: 'Descending', label: 'Newest First' },
    { value: 'Ascending', label: 'Oldest First' }
  ];

  const handleFilterChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: selectedOption,
    }));
  };

  const resetFilters = () => {
    setFilters({
      plate: '',
      driver: '',
      status: { value: 'All', label: 'All' },
      packages: '',
      location: '',
      orderBy: { value: 'Descending', label: 'Newest First' },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/getTrucks'); // Asegúrate de que esta API devuelva los datos correctos
        const data = await response.json();
        setTrucksData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trucks:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>

    <div className={styles.filterContainer}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label htmlFor="plateNum">Plate Num</label>
          <input
            type="text"
            id="plateNum"
            placeholder="Plate Num"
            value={filters.plate}
            onChange={(e) => setFilters({ ...filters, plate: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="driver">Driver</label>
          <input
            type="text"
            id="driver"
            placeholder="Driver"
            value={filters.driver}
            onChange={(e) => setFilters({ ...filters, driver: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="status">Status</label>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusOptions}
            styles={customStyles}
            isSearchable={false}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="packages">Packages</label>
          <input
            type="text"
            id="packages"
            placeholder="Packages"
            value={filters.packages}
            onChange={(e) => setFilters({ ...filters, packages: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="orderBy">Order by</label>
          <Select
            name="orderBy"
            value={filters.orderBy}
            onChange={handleFilterChange}
            options={orderByOptions}
            styles={customStyles}
            isSearchable={false}
          />
        </div>
        <button className={styles.resetButton} onClick={resetFilters}>Reset</button>
      </div>

    </div>

    {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.truckList}>
          {trucksData.map((truck) => (
            <StatusCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
}