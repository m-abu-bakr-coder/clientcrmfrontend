import Navbar from '../Navbar/Navbar'
import { NavbarProvider } from '../NavbarContext/NavbarContext'
import BasicTabs from '../CustomTabPanel/CustomTabPanel';


const User = () => {
  return (
    <div>
      <NavbarProvider>
        <Navbar />
        <BasicTabs />
      </NavbarProvider>
    </div>
  )
}

export default User
