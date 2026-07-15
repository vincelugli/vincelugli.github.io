import React, {useState, useEffect} from 'react';
import {getAuth, signInWithCustomToken} from 'firebase/auth';
import {getFunctions, httpsCallable} from 'firebase/functions';
import styled from 'styled-components';
import {HamburgerIcon, MobileMenu, HeaderLeft, HeaderRight, HeaderContainer, Logo, MobileMainLink, MobileNavItem, MobileSubMenu, MobileSubMenuItem, Nav, NavItem, SubMenu, SubMenuItem, SubMenuAction, MobileSubMenuAction, LogoutButton, UserNameDisplay} from '../../styles';
import {FaBars, FaChevronDown, FaTimes} from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';
import ThemeToggleButton from './ThemeToggleButton';
import {getYearDisplayString, getYearFromHash} from '../../utils';
import {useAuth} from './AuthContext';
import {useTournament} from '../../context/TournamentContext';
import {usePlayers} from '../../context/PlayerContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.text};
`;

const ModalInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant, theme }) => (variant === 'secondary' ? 'transparent' : theme.primary)};
  color: ${({ variant, theme }) => (variant === 'secondary' ? theme.text : 'white')};
  border: ${({ variant, theme }) => (variant === 'secondary' ? `1px solid ${theme.borderColor}` : 'none')};
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ variant, theme }) => (variant === 'secondary' ? theme.body : theme.primaryHover)};
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.danger};
  font-size: 0.9rem;
  margin: 0;
`;

const HeaderLoginButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }

  @media (max-width: 1000px) {
    display: none;
  }
`;

const MobileLoginButton = styled.div`
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }
`;


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
            <MobileLoginButton
              onClick={() => {
                closeAllMenus();
                setIsLoginModalOpen(true);
              }}
            >
              Login
            </MobileLoginButton>
          </MobileNavItem>
        )}
      </MobileMenu>


    {isLoginModalOpen && (
        <ModalOverlay onClick={() => setIsLoginModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Enter Access Code</ModalTitle>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ModalInput
                autoFocus
                type="text"
                placeholder="Team Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={loginLoading}
              />
              {loginError && <ErrorMsg>{loginError}</ErrorMsg>}
              <ModalActions>
                <ModalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsLoginModalOpen(false)}
                  disabled={loginLoading}
                >
                  Cancel
                </ModalButton>
                <ModalButton
                  type="submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Verifying...' : 'Log In'}
                </ModalButton>
              </ModalActions>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </HeaderContainer>
  );
};

export default Header;
