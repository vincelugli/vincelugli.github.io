import React, {useState, useEffect} from 'react';
import {getAuth, signInWithCustomToken} from 'firebase/auth';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {
  HamburgerIcon,
  MobileMenu,
  HeaderLeft,
  HeaderRight,
  HeaderContainer,
  Logo,
  MobileMainLink,
  MobileNavItem,
  MobileSubMenu,
  MobileSubMenuItem,
  Nav,
  NavItem,
  SubMenu,
  SubMenuItem,
  SubMenuAction,
  MobileSubMenuAction,
  LogoutButton,
  UserNameDisplay,
  HeaderModalOverlay,
  HeaderModalBox,
  HeaderModalTitle,
  HeaderModalInput,
  HeaderModalActions,
  HeaderModalButton,
  HeaderErrorMsg,
  HeaderLoginButton,
  HeaderMobileLoginButton,
} from '../../styles';
import {FaBars, FaChevronDown, FaTimes} from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';
import ThemeToggleButton from './ThemeToggleButton';
import {getYearDisplayString, getYearFromHash} from '../../utils';
import {useAuth} from './AuthContext';
import {useTournament} from '../../context/TournamentContext';
import {usePlayers} from '../../context/PlayerContext';


const Header: React.FC = () => {
  const auth = getAuth();
  const {currentUser: user, isAdmin, isSub, subName, captainTeamId, isCaster, casterName} = useAuth();
  const {teams} = useTournament();
  const {players} = usePlayers();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accessCode) {
      setLoginError('Access code is required.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const functions = getFunctions();
      const getToken = httpsCallable(functions, 'getAuthTokenForAccessCode');
      const year = getYearFromHash(window.location.hash) || '2026';
      const result = await getToken({ accessCode, year });
      const token = (result.data as { token: string }).token;
      
      await signInWithCustomToken(auth, token);
      setIsLoginModalOpen(false);
      setAccessCode('');
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoginLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenMobileSubMenu(null);
  };

  const toggleMobileSubMenu = (menu: string) => {
    setOpenMobileSubMenu(prev => (prev === menu ? null : menu));
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSubMenu(null);
  };

  const getDisplayName = () => {
    if (isAdmin) return "Admin";
    if (isCaster) return casterName || "Caster";
    if (isSub) return subName || "Sub";
    if (captainTeamId) {
      const team = teams?.find(t => t.id === Number(captainTeamId));
      if (team) {
        const captain = players?.find(p => p.id === team.captainId);
        if (captain) {
          return captain.name;
        }
        return `Team ${team.id}`;
      }
      return "Captain";
    }
    return "User";
  };

  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const logoText = getYearDisplayString(hash);

  return (
    <HeaderContainer>
      <HeaderLeft>
        <Logo to="/" onClick={closeAllMenus}>{logoText}</Logo>
        <DivisionSelector />
      </HeaderLeft>

      <HeaderRight>
        {/* --- DESKTOP NAV --- */}
        <Nav>
          <NavItem>
            Info <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/schedule">Schedule</SubMenuItem>
              <SubMenuItem to="/availability">Availability</SubMenuItem>
              <SubMenuItem to="/players">Players</SubMenuItem>
              <SubMenuItem to="/power-rankings">Power Rankings</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Stages <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/draft-access">Draft</SubMenuItem>
              <SubMenuItem to="/swiss">{logoText === 'GRumble 2026' ? 'Swiss Stage' : 'Round Robin'}</SubMenuItem>
              <SubMenuItem to="/knockout">Knockout Stage</SubMenuItem>
              <SubMenuItem to="/teams">Teams</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Captain <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/draft-access">Draft</SubMenuItem>
              {user && (<SubMenuItem to="/pick-priority">Auto-Draft</SubMenuItem>)}
              <SubMenuItem to="/subs">Substitutes</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Year <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuAction
                onClick={() => {
                  window.location.hash = `#/2025`;
                }}
              >
                Grumble 2025
              </SubMenuAction>
              <SubMenuAction
                onClick={() => {
                  window.location.hash = `#/2026`;
                }}
              >
                Grumble 2026
              </SubMenuAction>
            </SubMenu>
          </NavItem>
        </Nav>

        {/* DELETE, DEBUG ONLY */}
        {user ? (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <LogoutButton onClick={() => auth.signOut()}>
              Logout
            </LogoutButton>
            <UserNameDisplay>  |  {getDisplayName()}</UserNameDisplay>
          </div>
        ) : (
          <HeaderLoginButton onClick={() => setIsLoginModalOpen(true)}>
            Login
          </HeaderLoginButton>
        )}
        {/* DELETE, DEBUG ONLY */}
        <ThemeToggleButton />
        <HamburgerIcon onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </HamburgerIcon>
      </HeaderRight>

      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('info')}>
            Info <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'info'}>
            <MobileSubMenuItem to="/schedule" onClick={closeAllMenus}>Schedule</MobileSubMenuItem>
            <MobileSubMenuItem to="/availability" onClick={closeAllMenus}>Availability</MobileSubMenuItem>
            <MobileSubMenuItem to="/players" onClick={closeAllMenus}>Players</MobileSubMenuItem>
            <MobileSubMenuItem to="/power-rankings" onClick={closeAllMenus}>Power Rankings</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>

        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('stages')}>
            Stages <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'stages'}>
            <MobileSubMenuItem to="/draft-access" onClick={closeAllMenus}>Draft Lobby</MobileSubMenuItem>
            <MobileSubMenuItem to="/swiss" onClick={closeAllMenus}>{logoText === 'GRumble 2026' ? 'Swiss Stage' : 'Round Robin'}</MobileSubMenuItem>
            <MobileSubMenuItem to="/knockout" onClick={closeAllMenus}>Knockout Stage</MobileSubMenuItem>
            <MobileSubMenuItem to="/teams" onClick={closeAllMenus}>Teams</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>

        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('captain')}>
            Captain <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'captain'}>
            <MobileSubMenuItem to="/draft-access" onClick={closeAllMenus}>Draft</MobileSubMenuItem>
            {user && (<MobileSubMenuItem to="/pick-priority" onClick={closeAllMenus}>Auto-Draft</MobileSubMenuItem>)}
            <MobileSubMenuItem to="/subs" onClick={closeAllMenus}>Substitutes</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>

        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('year')}>
            Year <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'year'}>
            <MobileSubMenuAction
              onClick={() => {
                window.location.hash = `#/2025`;
                closeAllMenus();
              }}
            >
              Grumble 2025
            </MobileSubMenuAction>
            <MobileSubMenuAction
              onClick={() => {
                window.location.hash = `#/2026`;
                closeAllMenus();
              }}
            >
              Grumble 2026
            </MobileSubMenuAction>
          </MobileSubMenu>
        </MobileNavItem>

        {user ? (
          <MobileNavItem>
            <div style={{padding: '0.75rem', fontSize: '1.2rem', opacity: 0.8}}>
              Logged in as: <strong>{getDisplayName()}</strong>
            </div>
            <MobileSubMenuAction
              onClick={() => {
                auth.signOut();
                closeAllMenus();
              }}
              style={{color: '#ff4d4f', fontWeight: 'bold'}}
            >
              Logout
            </MobileSubMenuAction>
          </MobileNavItem>
        ) : (
          <MobileNavItem>
            <HeaderMobileLoginButton
              onClick={() => {
                closeAllMenus();
                setIsLoginModalOpen(true);
              }}
            >
              Login
            </HeaderMobileLoginButton>
          </MobileNavItem>
        )}
      </MobileMenu>


    {isLoginModalOpen && (
        <HeaderModalOverlay onClick={() => setIsLoginModalOpen(false)}>
          <HeaderModalBox onClick={(e) => e.stopPropagation()}>
            <HeaderModalTitle>Enter Access Code</HeaderModalTitle>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <HeaderModalInput
                autoFocus
                type="text"
                placeholder="Team Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={loginLoading}
              />
              {loginError && <HeaderErrorMsg>{loginError}</HeaderErrorMsg>}
              <HeaderModalActions>
                <HeaderModalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsLoginModalOpen(false)}
                  disabled={loginLoading}
                >
                  Cancel
                </HeaderModalButton>
                <HeaderModalButton
                  type="submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Verifying...' : 'Log In'}
                </HeaderModalButton>
              </HeaderModalActions>
            </form>
          </HeaderModalBox>
        </HeaderModalOverlay>
      )}
    </HeaderContainer>
  );
};

export default Header;
