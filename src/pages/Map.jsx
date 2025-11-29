import React, { useState, useRef, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import Loading from '../components/Loading';
import ResultSidebar from '../components/ResultSidebar';
import SearchBar from '../components/SearchBar';

const PAGE_SIZE = 5;

export default function Map() {
  const [placesData, setPlacesData] = useState([]);
  const [isResultSidebarOpen, setIsResultSidebarOpen] = useState(false);
  const [status, setStatus] = useState('Tìm kiếm phòng trọ tại Đà Nẵng...');
  const [loading, setLoading] = useState(false);
  const mapInstanceRef = useRef(null);

  const [pagination, setPagination] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  // state quản lí trọ đang được chọn 
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleRoomItemClick = (room) => {
    if (!mapInstanceRef.current || !room.lng || !room.lat) return;
    mapInstanceRef.current.flyTo({
      center: [room.lng, room.lat],
      zoom: 17, pitch: 45, duration: 1500
    });
  };

  const handleMarkerClick = (index) => {
    setIsResultSidebarOpen(true);
    const place = placesData[index];
    setIsResultSidebarOpen(true);
    setSelectedPlace(place);
    if (mapInstanceRef.current && place) {
      mapInstanceRef.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 17, pitch: 45, duration: 1500
      });
    }
  };

  // ====================== FETCH DATA ======================
  const fetchRentalData = async (filters, page = 1) => {
    setLoading(true);
    setPlacesData([]);

    let filtersToUse;
    if (filters) {
      setCurrentFilters(filters);
      filtersToUse = filters;
      setStatus('📡 Đang tìm kiếm theo bộ lọc...');
    } else {
      filtersToUse = currentFilters;
      setStatus(`⏳ Đang tải trang ${page}...`);
    }

    const params = new URLSearchParams();
    if (filtersToUse?.keyword) params.append('address', filtersToUse.keyword);
    if (filtersToUse?.rating) params.append('minRating', filtersToUse.rating);
    if (filtersToUse?.distance) params.append('maxDistance', filtersToUse.distance);
    if (filtersToUse?.price) {
      if (filtersToUse.price.includes('-')) {
        const [min, max] = filtersToUse.price.split('-');
        params.append('minPrice', min);
        params.append('maxPrice', max);
      } else {
        params.append('minPrice', filtersToUse.price);
      }
    }

    params.append('page', page);
    params.append('limit', PAGE_SIZE);

    const API_URL = `https://itnihongo2-room-finder-production.up.railway.app/api/v1/rentals/search?${params.toString()}`;

    try {
      const res = await fetch(API_URL);
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Server trả về lỗi ${res.status}`);
      }

      const apiData = json?.data?.data;
      const apiPagination = json?.data?.pagination;

      if (!apiData || !Array.isArray(apiData) || !apiPagination) {
        throw new Error('Không có dữ liệu hoặc thông tin phân trang');
      }

      apiPagination.currentPage = page;

      const newPlaces = apiData.map((item, i) => {
        let coords = [];
        try {
          coords = JSON.parse(item.locationGeoJson).coordinates;
        } catch { return null; }
        if (!coords || coords.length < 2) return null;
        const [lng, lat] = coords;
        return {
          id: item.id,
          name: item.name || `Phòng trọ #${i + 1}`,
          address: item.fullAddress || 'Chưa có địa chỉ',
          lat,
          lng,
          price: item.price ? item.price.toLocaleString('vi-VN') + ' đ' : 'N/A',
          distanceToSchool: item.distanceToSchool ? item.distanceToSchool.toFixed(1) : 'N/A',
          averageRating: item.averageRating ? item.averageRating.toFixed(1) : 'N/A',
          image: item.thumbNailUrl || 'https://via.placeholder.com/100x80.png?text=No+Image',
        };
      }).filter(Boolean);

      setPlacesData(newPlaces);
      setPagination(apiPagination);

      const totalResults = apiPagination.totalElements || 0;
      setStatus(`✅ Tìm thấy ${totalResults} kết quả (trang ${page}/${apiPagination.totalPages || 1})`);
      setIsResultSidebarOpen(true);

    } catch (err) {
      console.error(err);
      setStatus(`⚠️ ${err.message}`);
      setIsResultSidebarOpen(false);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRentalData(null, newPage);
    }
  };

  // ====================== FETCH DATA LẦN ĐẦU ======================
  useEffect(() => {
    fetchRentalData(null, 1); // Lấy dữ liệu mặc định trang 1 ngay khi load trang
  }, []);

  // ====================== RENDER ======================
  const sidebarPlaces = selectedPlace ? [selectedPlace] : placesData;

  const sidebarPagination = selectedPlace ? null : pagination;

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <SearchBar
        onSearch={(filters) => {
          setSelectedPlace(null);
          fetchRentalData(filters, 1);
        }}
        className={isResultSidebarOpen ? 'with-sidebar' : ''}
      />

      <ResultSidebar
        places={sidebarPlaces}
        onMapClick={handleRoomItemClick}
        isOpen={isResultSidebarOpen}
        onClose={() => {
          setIsResultSidebarOpen(false);
          setSelectedPlace(null);
        }}
        pagination={sidebarPagination}
        onPageChange={handlePageChange}
      />

      <MapComponent
        placesData={placesData}
        openSidebar={handleMarkerClick}
        onMapLoad={(map) => { mapInstanceRef.current = map; }}
      />

      {loading && <Loading />}
    </div>
  );
}