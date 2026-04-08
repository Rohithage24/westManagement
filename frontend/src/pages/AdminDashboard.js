import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../global/styles.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    working: 0,
    complete: 0
  })
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('All')   // ✅ FIX 1: keep 'All' as default

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get(
        'http://localhost:5000/api/admin/complaints/stats',
        { withCredentials: true }   // ✅ FIX 2: send admin cookie
      )
      setStats(statsRes.data.data)

      const complaintsRes = await axios.get(
        'http://localhost:5000/api/admin/complaints',
        { withCredentials: true }   // ✅ FIX 2: send admin cookie
      )
      setComplaints(complaintsRes.data.data)
    } catch (err) {
      console.error('Admin data fetch failed', err)
      setComplaints([
        {
          _id: '101',
          wasteType: 'Plastic',
          severity: 'High',
          currentStatus: 'Pending',
          address: 'Main Road',
          userID: { name: 'Rahul' }
        },
        {
          _id: '102',
          wasteType: 'Organic',
          severity: 'Medium',
          currentStatus: 'Working',
          address: 'Civil Lines',
          userID: { name: 'Sneha' }
        }
      ])
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/complaints/${id}/status`,
        {
          status: newStatus,
          note: `Moved to ${newStatus} by Municipality Admin`
        },
        { withCredentials: true }   // ✅ FIX 2: send admin cookie
      )
      fetchAdminData()
    } catch (err) {
      alert('Status update failed')
    }
  }

  return (
    <div className='dashboard-container' style={{ paddingTop: '100px' }}>
      <div className='dashboard-header'>
        <h1 className='hero-title' style={{ fontSize: '2.5rem' }}>
          Municipality Control
        </h1>
        <button className='upload-trigger' onClick={fetchAdminData}>
          🔄 Refresh Data
        </button>
      </div>

      {/* ADMIN STATS GRID */}
      <div className='dashboard-grid' style={{ marginBottom: '40px' }}>
        <div className='glass-card stat-item'>
          <div
            className='stat-icon'
            style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
          >
            📊
          </div>
          <div>
            <h3>Total</h3>
            <p className='stat-number'>{stats.total || complaints.length}</p>
          </div>
        </div>
        <div className='glass-card stat-item'>
          <div
            className='stat-icon'
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
          >
            ⏳
          </div>
          <div>
            <h3>Pending</h3>
            <p className='stat-number'>{stats.pending || 0}</p>
          </div>
        </div>
        <div className='glass-card stat-item'>
          <div
            className='stat-icon'
            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
          >
            ✅
          </div>
          <div>
            <h3>Resolved</h3>
            <p className='stat-number'>{stats.complete || 0}</p>
          </div>
        </div>
      </div>

      {/* MASTER TASK LIST */}
      <div
        className='glass-card main-activity'
        style={{ gridColumn: 'span 4', padding: '30px' }}
      >
        <div className='card-header-flex'>
          <h3>Active Waste Reports</h3>

          {/* ✅ FIX 3: Added 'All' button to filter group */}
          <div className='filter-group'>
            {['All', 'Pending', 'Accept', 'Working', 'Complete'].map(s => (
              <button
                key={s}
                className={`filter-pill ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className='complaint-list'>
          <div
            className='list-header'
            style={{ gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1.5fr' }}
          >
            <span>Reported By</span>
            <span>Location</span>
            <span>Type</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {complaints
            .filter(c => filter === 'All' || c.currentStatus === filter)
            .map(report => (
              <div
                key={report._id}
                className='report-row-v2'
                style={{ gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1.5fr' }}
              >
                <strong>{report.userID?.name || 'Anonymous'}</strong>
                <span style={{ fontSize: '0.85rem' }}>{report.address}</span>
                <span className={`severity-tag ${report.severity?.toLowerCase()}`}>
                  {report.wasteType}
                </span>
                <span className={`status-pill ${report.currentStatus?.toLowerCase()}`}>
                  {report.currentStatus}
                </span>

                {/* ✅ FIX 4: Pending → Accept → Working → Complete chain */}
                <div className='admin-actions'>
                  {report.currentStatus === 'Pending' && (
                    <button
                      className='action-btn-sm accept'
                      onClick={() => handleStatusUpdate(report._id, 'Accept')}
                    >
                      Accept
                    </button>
                  )}

                  {report.currentStatus === 'Accept' && (
                    <button
                      className='action-btn-sm work'
                      onClick={() => handleStatusUpdate(report._id, 'Working')}
                    >
                      Deploy
                    </button>
                  )}

                  {report.currentStatus === 'Working' && (
                    <button
                      className='action-btn-sm done'
                      onClick={() => handleStatusUpdate(report._id, 'Complete')}
                    >
                      Clear
                    </button>
                  )}

                  {report.currentStatus === 'Complete' && (
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                      ✅ Done
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard