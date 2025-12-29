import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMembers } from '../api/members';
import MemberProfileCard from '../components/MemberProfileCard';
import '../styles/MapPage.css';
import '../styles/ProfilePage.css';

// Create custom marker icon using member's profile picture
function createMemberIcon(pictureUrl) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-image: url('${pictureUrl}'); width: 100%; height: 100%; border-radius: 50%; background-size: cover; background-position: center;"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function MapPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const data = await fetchMembers();
        // Filter members with valid lat/lng
        const validMembers = data.members.filter(
          (member) =>
            member.homeLocation &&
            typeof member.homeLocation.lat === 'number' &&
            typeof member.homeLocation.lng === 'number' &&
            !isNaN(member.homeLocation.lat) &&
            !isNaN(member.homeLocation.lng)
        );
        setMembers(validMembers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  if (loading) {
    return <div className="map-loading">Loading map...</div>;
  }

  if (error) {
    return <div className="map-error">Error loading members: {error}</div>;
  }

  return (
    <div className="membersPage">
      <div className="membersTop">
        <h1 className="pageTitle">Member Map</h1>
        <p className="pageSub">Discover where our community is located across the US.</p>
      </div>

      <MapContainer
        center={[39.8, -98.6]}
        zoom={4}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {members.map((member) => (
          <Marker
            key={member._id}
            position={[member.homeLocation.lat, member.homeLocation.lng]}
            icon={createMemberIcon(member.picture)}
            eventHandlers={{
              click: () => setSelectedMember(member),
            }}
          />
        ))}
      </MapContainer>

      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMember(null)}>
              ×
            </button>
            <MemberProfileCard member={selectedMember} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;