import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComplaintCard from './ComplaintCard';

const UserHistory = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaint/my');
          // console.log(res.data);

        if (res.data.success && res.data.data.length > 0) {
          
          setComplaints(res.data.data);
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        setComplaints([
          { _id: '1', title: 'Broken vehicle', currentStatus: 'Pending', address: 'Cyber City', createdAt: '2026-03-25', imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500' },
          { _id: '2', title: 'Street cleaning', currentStatus: 'Complete', address: 'Rohini', createdAt: '2026-03-16', imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80fbe5e?w=500' },
          { _id: '3', title: 'Overflowing bin', currentStatus: 'Pending', address: 'Civil Lines', createdAt: '2026-03-26', imageUrl: 'https://images.unsplash.com/photo-1605600611220-b7c6a84844a0?w=500' },
          { _id: '4', title: 'Illegal dumping', currentStatus: 'Pending', address: 'Dharampeth', createdAt: '2026-03-24', imageUrl: 'https://images.unsplash.com/photo-1595273670150-db0c3c39241f?w=500' },
          { _id: '5', title: 'Plastic in park', currentStatus: 'Complete', address: 'Public Garden', createdAt: '2026-03-27', imageUrl: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=500' },
          { _id: '6', title: 'Construction debris', currentStatus: 'Pending', address: 'Ajni Square', createdAt: '2026-03-10', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500' },
        ]);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{width: '100%', maxWidth: '1200px', marginTop: '40px'}}>
      <h2 style={{marginBottom: '20px'}}>Community Activity</h2>
      <div className="complaints-grid">
        {complaints.map((item) => (
          <ComplaintCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default UserHistory;