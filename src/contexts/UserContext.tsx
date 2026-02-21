import React, { createContext, useContext, useState } from 'react';

interface User {
  _id?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  [k: string]: any;
}

interface UserContextValue {
  user: User | null;
  setUser: (u: User | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export default UserContext;

