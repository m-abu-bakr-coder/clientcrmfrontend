import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClientList from '../ClientListTable/ClientList';
import Emails from '../AllMails/Emails';
import { useSelector } from 'react-redux';
import AllUsers from '../AllUsers/AllUsers';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const user = useSelector((state) => state.Auth.user);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ paddingTop: '20px', maxWidth: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Client List" sx={{ fontFamily: "sans-serif", fontWeight: "bold", marginLeft: "24px" }} {...a11yProps(0)} />
          <Tab label="All Mails" sx={{ fontFamily: "sans-serif", fontWeight: "bold" }} {...a11yProps(1)} />
          {user && user.role === 'admin' && (
            <Tab label="All Users" sx={{ fontFamily: "sans-serif", fontWeight: "bold" }} {...a11yProps(2)} />
          )}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <ClientList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Emails />
      </CustomTabPanel>
      {user && user.role === 'admin' && (
        <CustomTabPanel value={value} index={2}>
          <AllUsers />
        </CustomTabPanel>
      )}
    </Box>
  );
}