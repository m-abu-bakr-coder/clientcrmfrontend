import { NavbarProvider } from '../NavbarContext/NavbarContext';
import BasicTabs from '../CustomTabPanel/CustomTabPanel';
import Navbar from '../Navbar/Navbar';

export default function Admin() {

  return (
    <>
      <div className="admin-container">
        <NavbarProvider>
          <Navbar />
          <BasicTabs />
        </NavbarProvider>
      </div>
    </>
  );
}
