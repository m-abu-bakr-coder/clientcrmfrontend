/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from 'react';

// Create the context
const NavbarContext = createContext();

// Create a provider component
export const NavbarProvider = ({ children }) => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]); // Holds all client data
  const [newRecord, setNewRecord] = useState({ name: '', email: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [createClientPopup, setCreateClientPopup] = useState(false);
  const [uploadCSVFilePopup, setUploadCSVFilePopup] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [adminSettingPopup, setAdminSettingPopup] = useState(false);
  const [csvFileFiltedData, setCsvFileFiltedData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [updateAdminSetting, setUpdateAdminSetting] = useState({ newName: '', newEmail: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [clientListLoading, setClientListLoading] = useState(true);

  return (
    <NavbarContext.Provider value={{
      search, setSearch,
      data, setData,
      newRecord, setNewRecord,
      anchorEl, setAnchorEl,
      createClientPopup, setCreateClientPopup,
      uploadCSVFilePopup, setUploadCSVFilePopup,
      profilePopup, setProfilePopup,
      adminSettingPopup, setAdminSettingPopup,
      csvFileFiltedData, setCsvFileFiltedData,
      csvFileName, setCsvFileName,
      updateAdminSetting, setUpdateAdminSetting,
      loading, setLoading,
      clientListLoading, setClientListLoading
    }}>
      {children}
    </NavbarContext.Provider>
  );
};

// Custom hook to use the Navbar context
export const useNavbarContext = () => useContext(NavbarContext);
