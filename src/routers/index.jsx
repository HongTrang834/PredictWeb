import { Navigate, createBrowserRouter } from "react-router-dom";
import Map from "../pages/Map";
import RoomDetail from "../pages/RoomDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Map />, // Trang chính: bản đồ
  },
  {
    path: "/RoomDetail/:id",
    element: <RoomDetail />, // Trang chi tiết phòng trọ
  },
  {
    path: "*",
    element: <Navigate to="/" replace />, // Mọi route sai → quay về trang Map
  },
]);

export default router;
