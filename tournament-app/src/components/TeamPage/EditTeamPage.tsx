import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {FaArrowLeft, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase';
import {useTournament} from '../../context/TournamentContext';
import {useAuth} from '../Common/AuthContext';
import {useDivision} from '../../context/DivisionContext';
import {getFirebasePrefix} from '../../utils';
import TeamLogo, {BACKGROUND_SHAPES, FOREGROUND_SHAPES} from '../Common/TeamLogo';

// Colors row as per the screenshot
const COLOR_PALETTE = [
  '#FFFFFF', // White
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Cyan
  '#30B0C7', // Light Blue
  '#32ADE6', // Sky Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#A2845E', // Brown
];

const EditPageContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({theme}) => theme.text};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const ProgressSegment = styled.div<{active: boolean}>`
  height: 4px;
  flex: 1;
  background-color: ${props => props.active ? props.theme.primary : props.theme.border};
  border-radius: 2px;
`;

const HeaderNav = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;
  width: 100%;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  background: none;
  border: none;
  color: ${({theme}) => theme.text};
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({theme}) => theme.backgroundThree || theme.body};
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const Description = styled.p`
  font-size: 1.05rem;
  text-align: center;
  color: ${({theme}) => theme.secondaryText};
  margin: 1.5rem 0;
  max-width: 500px;
`;

const PreviewCard = styled.div`
  background-color: ${({theme}) => theme.background};
  border: 1px solid ${({theme}) => theme.border};
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${({theme}) => theme.boxShadow};
  margin-bottom: 2.5rem;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-4px);
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({theme}) => theme.secondaryText};
  margin: 0 0 1rem 0;
  align-self: flex-start;
  width: 100%;
  max-width: 600px;
`;

const CarouselContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 1rem;
  overflow: hidden;
  padding: 0.5rem;
  align-items: center;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  color: ${({theme}) => theme.text};
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({theme}) => theme.backgroundThree || theme.body};
  }
  &:disabled {
    color: ${({theme}) => theme.textAlt};
    cursor: not-allowed;
    opacity: 0.3;
  }
`;

const ShapeCard = styled.div<{selected: boolean}>`
  width: 76px;
  height: 76px;
  background-color: ${({theme}) => theme.backgroundTwo};
  border: 2px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  box-shadow: ${props => props.selected ? '0 4px 12px rgba(0, 123, 255, 0.2)' : 'none'};
  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.selected ? props.theme.primary : props.theme.primaryHover};
  }
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
`;

const ColorCircle = styled.button<{color: string; selected: boolean}>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#ffffff' : 'transparent'};
  box-shadow: 0 0 0 2px ${props => props.selected ? props.theme.primary : 'rgba(0,0,0,0.1)'};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.15);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${({theme}) => theme.border}, transparent);
  margin: 2.5rem 0;
  width: 100%;
  max-width: 600px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 400px;
`;

const InputLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({theme}) => theme.secondaryText};
`;

const CustomInput = styled.input`
  background-color: ${({theme}) => theme.backgroundTwo};
  border: 2px solid ${({theme}) => theme.border};
  color: ${({theme}) => theme.text};
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  &:focus {
    border-color: ${({theme}) => theme.primary};
    outline: none;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
  }
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  justify-content: center;
  margin-bottom: 4rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #007BFF, #0056b3);
  color: white;
  border: none;
  padding: 0.8rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  transition: all 0.2s ease-in-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    background: ${({theme}) => theme.border};
    color: ${({theme}) => theme.textAlt};
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: ${({theme}) => theme.danger};
  font-weight: 600;
  padding: 2rem;
  text-align: center;
`;

const EditTeamPage: React.FC = () => {
  const {teamId} = useParams<{teamId: string}>();
  const navigate = useNavigate();

  const {teams, refreshData} = useTournament();
  const {captainTeamId, authDivision, isTeamMember, isAdmin} = useAuth();
  const {division, urlDivision} = useDivision();
  const prefix = getFirebasePrefix();

  const teamIdNum = Number(teamId);
  const team = teams.find(t => t.id === teamIdNum);

  const [teamName, setTeamName] = useState('');
  const [bgShape, setBgShape] = useState('classic');
  const [bgColor, setBgColor] = useState('#5856D6'); // purple
  const [fgShape, setFgShape] = useState('rune');
  const [fgColor, setFgColor] = useState('#FF3B30'); // red

  const [bgCarouselIndex, setBgCarouselIndex] = useState(0);
  const [fgCarouselIndex, setFgCarouselIndex] = useState(0);

  const [saving, setSaving] = useState(false);

  // Initialize values when team loads
  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      if (team.logo) {
        setBgShape(team.logo.backgroundShape || 'classic');
        setBgColor(team.logo.backgroundColor || '#5856D6');
        setFgShape(team.logo.foregroundShape || 'none');
        setFgColor(team.logo.foregroundColor || '#FF3B30');
      }
    }
  }, [team]);

  // Auth check
  const isAuthorized = isAdmin || (isTeamMember && Number(captainTeamId) === teamIdNum && authDivision === division);

  if (!team) {
    return <ErrorMsg>Team not found.</ErrorMsg>;
  }

  if (!isAuthorized) {
    return <ErrorMsg>You are not authorized to edit this team.</ErrorMsg>;
  }

  const bgShapeKeys = Object.keys(BACKGROUND_SHAPES);
  const maxBgIndex = Math.max(0, bgShapeKeys.length - 3);
  const visibleBgShapes = bgShapeKeys.slice(bgCarouselIndex, bgCarouselIndex + 3);

  const fgShapeKeys = ['none', ...Object.keys(FOREGROUND_SHAPES)];
  const maxFgIndex = Math.max(0, fgShapeKeys.length - 3);
  const visibleFgShapes = fgShapeKeys.slice(fgCarouselIndex, fgCarouselIndex + 3);

  const handleBgLeft = () => setBgCarouselIndex(prev => Math.max(0, prev - 1));
  const handleBgRight = () => setBgCarouselIndex(prev => Math.min(maxBgIndex, prev + 1));

  const handleFgLeft = () => setFgCarouselIndex(prev => Math.max(0, prev - 1));
  const handleFgRight = () => setFgCarouselIndex(prev => Math.min(maxFgIndex, prev + 1));

  const handleSave = async () => {
    if (!teamName.trim()) {
      alert('Team name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const teamsRef = doc(db, 'teams', `${prefix}_${division}`);
      const updatedTeams = teams.map(t => {
        if (t.id === teamIdNum) {
          return {
            ...t,
            name: teamName.trim(),
            logo: {
              backgroundShape: bgShape,
              backgroundColor: bgColor,
              foregroundShape: fgShape,
              foregroundColor: fgColor,
            }
          };
        }
        return t;
      });

      await setDoc(teamsRef, {teams: updatedTeams}, {merge: true});
      // Call reload on context
      if (refreshData) {
        refreshData();
      }
      alert('Team profile updated successfully!');
      navigate(`/teams/${teamId}?division=${urlDivision}`);
    } catch (err) {
      console.error('Failed to save team: ', err);
      alert('Error updating team profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/teams/${teamId}?division=${urlDivision}`);
  };

  return (
    <EditPageContainer>
      <Header>
        {/* Progress bar matching the layout of the screenshot */}
        <ProgressBar>
          <ProgressSegment active={true} />
          <ProgressSegment active={true} />
          <ProgressSegment active={true} />
        </ProgressBar>
        <HeaderNav>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
          </BackButton>
          <HeaderTitle>Logo</HeaderTitle>
        </HeaderNav>
      </Header>

      <Description>
        Choose your team's logo. Here are some options:
      </Description>

      {/* Large logo preview card */}
      <PreviewCard>
        <TeamLogo
          logo={{
            backgroundShape: bgShape,
            backgroundColor: bgColor,
            foregroundShape: fgShape === 'none' ? '' : fgShape,
            foregroundColor: fgColor
          }}
          size={160}
        />
      </PreviewCard>

      {/* Team Name Input */}
      <InputGroup>
        <InputLabel htmlFor="teamNameInput">Team Name</InputLabel>
        <CustomInput
          id="teamNameInput"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter Team Name"
          maxLength={30}
        />
      </InputGroup>

      {/* Background Shape Carousel */}
      <CarouselContainer>
        <ArrowButton onClick={handleBgLeft} disabled={bgCarouselIndex === 0}>
          <FaChevronLeft />
        </ArrowButton>
        <CarouselTrack>
          {visibleBgShapes.map(shape => (
            <ShapeCard
              key={shape}
              selected={bgShape === shape}
              onClick={() => setBgShape(shape)}
            >
              <svg viewBox="0 0 200 200" width="40" height="40">
                <path d={BACKGROUND_SHAPES[shape]} fill="#888888" />
              </svg>
            </ShapeCard>
          ))}
        </CarouselTrack>
        <ArrowButton onClick={handleBgRight} disabled={bgCarouselIndex === maxBgIndex}>
          <FaChevronRight />
        </ArrowButton>
      </CarouselContainer>

      {/* Background Colors */}
      <ColorGrid>
        {COLOR_PALETTE.map(color => (
          <ColorCircle
            key={color}
            color={color}
            selected={bgColor === color}
            onClick={() => setBgColor(color)}
          />
        ))}
      </ColorGrid>

      <Divider />

      {/* Foreground Shape Carousel */}
      <CarouselContainer>
        <ArrowButton onClick={handleFgLeft} disabled={fgCarouselIndex === 0}>
          <FaChevronLeft />
        </ArrowButton>
        <CarouselTrack>
          {visibleFgShapes.map(shape => (
            <ShapeCard
              key={shape}
              selected={fgShape === shape}
              onClick={() => setFgShape(shape)}
            >
              {shape === 'none' ? (
                <svg viewBox="0 0 200 200" width="36" height="36">
                  <circle cx="100" cy="100" r="80" stroke="#888888" strokeWidth="12" fill="none" />
                  <line x1="43" y1="43" x2="157" y2="157" stroke="#888888" strokeWidth="12" />
                </svg>
              ) : (
                <svg viewBox="0 0 200 200" width="40" height="40">
                  <path d={FOREGROUND_SHAPES[shape]} fill="#888888" />
                </svg>
              )}
            </ShapeCard>
          ))}
        </CarouselTrack>
        <ArrowButton onClick={handleFgRight} disabled={fgCarouselIndex === maxFgIndex}>
          <FaChevronRight />
        </ArrowButton>
      </CarouselContainer>

      {/* Foreground Colors */}
      <ColorGrid>
        {COLOR_PALETTE.map(color => (
          <ColorCircle
            key={color}
            color={color}
            selected={fgColor === color}
            onClick={() => setFgColor(color)}
          />
        ))}
      </ColorGrid>

      <ActionContainer>
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Team Profile'}
        </SaveButton>
      </ActionContainer>
    </EditPageContainer>
  );
};

export default EditTeamPage;
