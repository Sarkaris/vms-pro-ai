import React, { createContext, useContext, useState } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  // In demo mode, socket is always "connected" but doesn't actually connect
  const [connected] = useState(true);
  const [socket] = useState(null);

  const joinRoom = (room) => {
    // Demo mode - no actual socket connection
  };

  const leaveRoom = (room) => {
    // Demo mode - no actual socket connection
  };

  const emitVisitorCheckin = (data) => {
    // Demo mode - no actual socket emission
  };

  const emitVisitorCheckout = (data) => {
    // Demo mode - no actual socket emission
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    emitVisitorCheckin,
    emitVisitorCheckout
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
