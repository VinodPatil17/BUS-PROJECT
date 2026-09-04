import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionStatus, setConnectionStatus] = useState(socket.connected ? 'connected' : 'connecting');
  const [liveBusData, setLiveBusData] = useState({});
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bus 03 Active', message: 'Bus 03 has departed Hostel Block A.', type: 'info', timestamp: '08:15 AM' },
    { id: 2, title: 'Weather Advisory', message: 'Light rain reported along Kottara Junction.', type: 'warning', timestamp: '08:20 AM' }
  ]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('[SocketContext] Connected to real-time server');
    }

    function onDisconnect() {
      setIsConnected(false);
      setConnectionStatus('reconnecting');
      console.log('[SocketContext] Disconnected from real-time server');
    }

    function onBusLocationUpdate(data) {
      setLiveBusData(prev => ({
        ...prev,
        [data.busId]: data
      }));
    }

    function onTripStarted(data) {
      addNotification({
        id: Date.now(),
        title: `Trip Started: Bus ${data.busId}`,
        message: `Driver started active route tracking at ${new Date().toLocaleTimeString()}`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    function onTripEnded(data) {
      addNotification({
        id: Date.now(),
        title: `Trip Completed: Bus ${data.busId}`,
        message: `Bus ${data.busId} completed its trip and is now parked at terminal.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('bus:location_update', onBusLocationUpdate);
    socket.on('fleet:location_update', onBusLocationUpdate);
    socket.on('trip:started', onTripStarted);
    socket.on('trip:ended', onTripEnded);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('bus:location_update', onBusLocationUpdate);
      socket.off('fleet:location_update', onBusLocationUpdate);
      socket.off('trip:started', onTripStarted);
      socket.off('trip:ended', onTripEnded);
    };
  }, []);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      connectionStatus,
      liveBusData,
      notifications,
      addNotification,
      markNotificationRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
